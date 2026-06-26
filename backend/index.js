const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodeCron = require('node-cron');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const importContacts = require('./import_contacts');


const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Endpoint de diagnóstico: exibe os valores exatos das variáveis de ambiente relevantes.
app.get('/api/debug', (req, res) => {
    res.json({
        TARGET_ATTENDANT_NAME,
        TARGET_ATTENDANT_EMAIL,
        TARGET_ATTENDANT_NAME_chars: [...TARGET_ATTENDANT_NAME].map(c => c.charCodeAt(0)),
        LEAD_SESSION_WINDOW_HOURS,
        env_LEAD_MONITOR_ATTENDANT: process.env.LEAD_MONITOR_ATTENDANT,
        env_LEAD_MONITOR_EMAIL: process.env.LEAD_MONITOR_EMAIL,
        node_version: process.version
    });
});

const DB_PATH = path.join(__dirname, 'database.sqlite');
let db;

const PG_CONNECTION_STRING = process.env.DATABASE_URL;
const SMCLICK_API_KEY = process.env.SMCLICK_API_KEY;

if (!PG_CONNECTION_STRING) {
    throw new Error('DATABASE_URL não configurada nas variáveis de ambiente.');
}

if (!SMCLICK_API_KEY) {
    throw new Error('SMCLICK_API_KEY não configurada nas variáveis de ambiente.');
}

const pgPool = new Pool({
    connectionString: PG_CONNECTION_STRING,
});
// Initialize Database
async function initDb() {
    db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag TEXT,
            content TEXT,
            scheduled_at DATETIME,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS logs_envio (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id INTEGER,
            tag TEXT,
            content TEXT,
            contact_name TEXT,
            contact_number TEXT,
            status TEXT,
            error TEXT,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    try {
        await db.exec('ALTER TABLE messages ADD COLUMN media_name TEXT;');
        await db.exec('ALTER TABLE messages ADD COLUMN media_base64 TEXT;');
    } catch (e) {
        // Ignora erro se as colunas já existirem
    }

    // Update settings with user provided values
    await db.run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', 'apiKey', SMCLICK_API_KEY);
    await db.run('UPDATE settings SET value = ? WHERE key = ?', SMCLICK_API_KEY, 'apiKey');
    await db.run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', 'baseUrl', 'https://api.smclick.com.br');

    console.log('--- Verifying SM Click Connectivity ---');
    const id = await getActiveInstanceId();
    if (id) {
        console.log('✅ Connected! Active Instance ID:', id);
    } else {
        console.log('❌ Failed to connect or find active instance.');
    }

    // Inicializa as tabelas no PostgreSQL e migra as etiquetas dos contatos
    try {
        console.log('[Backend] Initializing PostgreSQL tables...');
        
        // Garante que a tabela de contatos existe
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS contatos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255),
                telefone VARCHAR(255),
                tag VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (telefone, tag)
            );
        `);

        // Garante que a tabela de tags existe
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Garante que a tabela de monitoramento de leads existe.
        // O registro nunca representa encerramento de conversa: ele guarda apenas a medição
        // entre a primeira mensagem do cliente e a primeira mensagem da atendente-alvo.
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS leads_monitoring (
                id SERIAL PRIMARY KEY,
                customer_phone VARCHAR(50) NOT NULL,
                customer_name VARCHAR(255),
                status VARCHAR(50) DEFAULT 'waiting_maria',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                answered_at TIMESTAMP,
                response_time INTEGER,
                first_message TEXT,
                maria_message TEXT,
                conversation_id VARCHAR(255),
                first_event_id VARCHAR(255),
                maria_event_id VARCHAR(255),
                attendant_name VARCHAR(255),
                attendant_id VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migração segura para bancos que já possuem a versão anterior da tabela.
        await pgPool.query(`
            ALTER TABLE leads_monitoring ADD COLUMN IF NOT EXISTS conversation_id VARCHAR(255);
            ALTER TABLE leads_monitoring ADD COLUMN IF NOT EXISTS first_event_id VARCHAR(255);
            ALTER TABLE leads_monitoring ADD COLUMN IF NOT EXISTS maria_event_id VARCHAR(255);
            ALTER TABLE leads_monitoring ADD COLUMN IF NOT EXISTS attendant_name VARCHAR(255);
            ALTER TABLE leads_monitoring ADD COLUMN IF NOT EXISTS attendant_id VARCHAR(255);
            ALTER TABLE leads_monitoring ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            UPDATE leads_monitoring SET status = 'waiting_maria' WHERE status = 'pending' AND answered_at IS NULL;
            UPDATE leads_monitoring SET status = 'measured' WHERE status = 'answered' OR answered_at IS NOT NULL;
        `);

        await pgPool.query(`
            CREATE INDEX IF NOT EXISTS idx_leads_phone_measurement ON leads_monitoring(customer_phone, answered_at);
            CREATE INDEX IF NOT EXISTS idx_leads_conversation ON leads_monitoring(conversation_id);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_first_event_unique
                ON leads_monitoring(first_event_id)
                WHERE first_event_id IS NOT NULL;

            CREATE INDEX IF NOT EXISTS idx_logs_envio_status ON logs_envio(status);
            CREATE INDEX IF NOT EXISTS idx_logs_envio_sent_at ON logs_envio(sent_at);
            CREATE INDEX IF NOT EXISTS idx_contatos_telefone ON contatos(telefone);

            -- Hash Indexes for equality queries
            CREATE INDEX IF NOT EXISTS idx_logs_message_id_hash ON logs_envio USING HASH (message_id);
            CREATE INDEX IF NOT EXISTS idx_contatos_telefone_hash ON contatos USING HASH (telefone);
            CREATE INDEX IF NOT EXISTS idx_leads_conversation_hash ON leads_monitoring USING HASH (conversation_id);
            CREATE INDEX IF NOT EXISTS idx_leads_attendant_hash ON leads_monitoring USING HASH (attendant_id);
        `);

        // Garante que a tabela de logs de webhook existe
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS webhook_logs (
                id SERIAL PRIMARY KEY,
                received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                event_type VARCHAR(100),
                payload TEXT,
                processing_result VARCHAR(100),
                customer_phone VARCHAR(50),
                attendant_name VARCHAR(255)
            );
        `);

        await pgPool.query(`
            ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS processing_result VARCHAR(100);
            ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
            ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS attendant_name VARCHAR(255);
        `);

        await pgPool.query(`
            INSERT INTO tags (name)
            SELECT DISTINCT tag FROM contatos WHERE tag IS NOT NULL AND tag != ''
            ON CONFLICT (name) DO NOTHING;
        `);
        
        // Garante que a tabela de vendedores existe
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS sellers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                attendant_id VARCHAR(255) UNIQUE NOT NULL,
                photo_base64 TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log('✅ PostgreSQL tables (contatos, tags, leads_monitoring, webhook_logs, sellers) initialized and synced.');
    } catch (e) {
        console.error('❌ Failed to initialize PostgreSQL tables:', e.message);
    }
}

// SM Click API Integration Helper
async function getApiConfig() {
    const settings = await db.all('SELECT * FROM settings');
    const config = {};
    settings.forEach(s => config[s.key] = s.value);
    return config;
}

// SM Click Helper for Request Headers
function getHeaders(apiKey) {
    return {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
    };
}

// Endpoints
app.get('/api/schedules', async (req, res) => {
    const schedules = await db.all(`
        SELECT m.*, 
               (SELECT MIN(sent_at) FROM logs_envio WHERE message_id = m.id) as start_time,
               (SELECT MAX(sent_at) FROM logs_envio WHERE message_id = m.id) as end_time,
               (SELECT COUNT(*) FROM logs_envio WHERE message_id = m.id) as total_count,
               (SELECT COUNT(*) FROM logs_envio WHERE message_id = m.id AND status = 'success') as success_count,
               (SELECT COUNT(*) FROM logs_envio WHERE message_id = m.id AND status = 'failed') as failed_count
        FROM messages m 
        ORDER BY m.scheduled_at DESC
    `);
    res.json(schedules.map(s => {
        if (s.created_at && !s.created_at.endsWith('Z') && !s.created_at.includes('T')) {
            s.created_at = s.created_at.replace(' ', 'T') + 'Z';
        }
        if (s.start_time && !s.start_time.endsWith('Z') && !s.start_time.includes('T')) {
            s.start_time = s.start_time.replace(' ', 'T') + 'Z';
        }
        if (s.end_time && !s.end_time.endsWith('Z') && !s.end_time.includes('T')) {
            s.end_time = s.end_time.replace(' ', 'T') + 'Z';
        }
        return s;
    }));
});

app.post('/api/schedule', async (req, res) => {
    const { tags, tag, content, scheduledAt, mediaName, mediaBase64 } = req.body;
    
    const tagsString = Array.isArray(tags) ? tags.join(', ') : (tag || '');

    try {
        // Verifica se já existe um agendamento idêntico pendente
        const existing = await db.get(
            'SELECT id FROM messages WHERE tag = ? AND content = ? AND scheduled_at = ? AND status = "pending"',
            tagsString, content, scheduledAt
        );

        if (existing) {
            return res.status(400).json({ error: 'Uma mensagem idêntica já está agendada para este horário.' });
        }

        await db.run(
            'INSERT INTO messages (tag, content, scheduled_at, media_name, media_base64) VALUES (?, ?, ?, ?, ?)',
            tagsString, content, scheduledAt, mediaName, mediaBase64
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error scheduling message:', error.message);
        res.status(500).json({ error: 'Erro interno ao agendar.' });
    }
});

app.delete('/api/cancelar/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Canceling and deleting schedule ID: ${id}`);
    try {
        await db.run('DELETE FROM messages WHERE id = ?', id);
        await db.run('DELETE FROM logs_envio WHERE message_id = ?', id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error canceling/deleting schedule:', error.message);
        res.status(500).json({ error: 'Erro ao apagar agendamento e logs.' });
    }
});

app.post('/api/clear-history', async (req, res) => {
    try {
        console.log('🧹 Clearing all schedules and sending logs...');
        await db.run('DELETE FROM logs_envio');
        await db.run('DELETE FROM messages');
        res.json({ success: true });
    } catch (error) {
        console.error('Error clearing history:', error.message);
        res.status(500).json({ error: 'Erro ao limpar histórico.' });
    }
});

app.get('/api/logs', async (req, res) => {
    const logs = await db.all('SELECT * FROM logs_envio ORDER BY sent_at DESC');
    res.json(logs.map(log => {
        if (log.sent_at && !log.sent_at.endsWith('Z') && !log.sent_at.includes('T')) {
            log.sent_at = log.sent_at.replace(' ', 'T') + 'Z';
        }
        return log;
    }));
});

app.get('/api/logs/:messageId', async (req, res) => {
    const { messageId } = req.params;
    const logs = await db.all('SELECT * FROM logs_envio WHERE message_id = ? ORDER BY sent_at ASC', messageId);
    res.json(logs.map(log => {
        if (log.sent_at && !log.sent_at.endsWith('Z') && !log.sent_at.includes('T')) {
            log.sent_at = log.sent_at.replace(' ', 'T') + 'Z';
        }
        return log;
    }));
});

// Tag Management (PostgreSQL Neon)
app.get('/api/tags', async (req, res) => {
    try {
        const result = await pgPool.query('SELECT name FROM tags ORDER BY name ASC');
        res.json(result.rows.map(t => t.name));
    } catch (error) {
        console.error('Error fetching tags from PG:', error.message);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

app.post('/api/tags', async (req, res) => {
    const { name } = req.body;
    try {
        await pgPool.query('INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error inserting tag to PG:', error.message);
        res.status(400).json({ error: 'Failed to create tag' });
    }
});

app.delete('/api/tags/:name', async (req, res) => {
    const { name } = req.params;
    try {
        await pgPool.query('DELETE FROM tags WHERE name = $1', [name]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag from PG:', error.message);
        res.status(500).json({ error: 'Failed to delete tag' });
    }
});

app.put('/api/tags/:oldName', async (req, res) => {
    const { oldName } = req.params;
    const { newName } = req.body;
    try {
        await pgPool.query('UPDATE tags SET name = $1 WHERE name = $2', [newName, oldName]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating tag in PG:', error.message);
        res.status(400).json({ error: 'New name already exists or invalid' });
    }
});

// Import Contacts Routes
app.post('/api/import/start', async (req, res) => {
    try {
        importContacts.startImportBackground();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/import/status', (req, res) => {
    res.json(importContacts.getStatus());
});

app.post('/api/import/cancel', (req, res) => {
    importContacts.cancelImport();
    res.json({ success: true });
});

app.post('/api/import/pause', (req, res) => {
    importContacts.pauseImport();
    res.json({ success: true });
});

app.post('/api/import/resume', (req, res) => {
    importContacts.resumeImport();
    res.json({ success: true });
});



// Helper to get the first active instance ID
async function getActiveInstanceId() {
    const { baseUrl, apiKey } = await getApiConfig();
    try {
        const response = await axios.get(`${baseUrl}/instances`, {
            headers: getHeaders(apiKey)
        });
        const instances = response.data;
        
        // Search for NICOPEL (case insensitive)
        const nicopel = instances.find(i => i.name && i.name.toUpperCase().includes('NICOPEL'));
        const active = nicopel || instances.find(i => i.status === 'PAIRED' || i.status === 'CONNECTED') || instances[0];
        
        return active ? active.id : null;
    } catch (error) {
        console.error('Error fetching instances:', error.message);
        return null;
    }
}

app.get('/api/contacts', async (req, res) => {
    const tagsParam = req.query.tags;
    if (!tagsParam) return res.json([]);
    
    const tagsArray = tagsParam.split(',').map(t => t.trim());
    try {
        console.log(`Fetching contacts for tags: ${tagsArray.join(', ')} from PostgreSQL...`);
        const result = await pgPool.query(
            'SELECT DISTINCT nome, telefone FROM contatos WHERE tag = ANY($1)',
            [tagsArray]
        );
        
        const filtered = result.rows.map(row => ({
            name: row.nome || 'Sem Nome',
            number: row.telefone
        }));
        
        res.json(filtered);
    } catch (error) {
        console.error('PostgreSQL Error (Contacts):', error.message);
        res.status(500).json([]);
    }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const activeProcesses = new Set();

async function processMessage(msg) {
    if (activeProcesses.has(msg.id)) {
        console.log(`⚠️ Skip message ${msg.id}: Already in memory lock.`);
        return false;
    }
    activeProcesses.add(msg.id);

    try {
        const result = await db.run(
            'UPDATE messages SET status = "sending" WHERE id = ? AND status = "pending"',
            msg.id
        );

        if (result.changes === 0) {
            console.log(`⚠️ Skip message ${msg.id}: Already being processed or sent (DB lock).`);
            activeProcesses.delete(msg.id);
            return false;
        }

        console.log(`\n--- Starting dispatch for tags: ${msg.tag} (ID: ${msg.id}) ---`);
        const { baseUrl, apiKey } = await getApiConfig();
        const instanceId = await getActiveInstanceId();
        if (!instanceId) {
            console.error('❌ Error: No active instance found');
            await db.run('UPDATE messages SET status = "failed" WHERE id = ?', msg.id);
            activeProcesses.delete(msg.id);
            return false;
        }

        const tagsArray = msg.tag.split(',').map(t => t.trim());

        const pgResult = await pgPool.query(
            'SELECT DISTINCT nome, telefone FROM contatos WHERE tag = ANY($1)',
            [tagsArray]
        );

        const allContacts = pgResult.rows;
        
        const logs = await db.all('SELECT contact_number FROM logs_envio WHERE message_id = ? AND status = "success"', msg.id);
        const processedNumbers = new Set(logs.map(l => l.contact_number));
        const contacts = allContacts.filter(c => !processedNumbers.has(c.telefone));

        console.log(`📊 Found ${contacts.length} remaining contacts for tags "${msg.tag}"`);

        let sentCount = 0;
        for (let i = 0; i < contacts.length; i++) {
            const currentStatus = await db.get('SELECT status FROM messages WHERE id = ?', msg.id);
            if (!currentStatus || currentStatus.status !== 'sending') {
                console.log(`🛑 Process ${msg.id} paused/stopped. Exiting loop.`);
                activeProcesses.delete(msg.id);
                return false;
            }

            const contact = contacts[i];
            
            const rawName = contact.nome || 'Sem Nome';
            const firstName = rawName.split('-')[0].trim();
            const personalizedMessage = msg.content ? msg.content.replace(/{nome}/gi, firstName) : '';
            
            if (i > 0) {
                console.log(`Waiting 45 seconds before next message...`);
                await sleep(45000);
            }

            try {
                let payload = {};
                
                if (msg.media_base64) {
                    // Define o tipo com base na extensão do arquivo
                    let mediaType = "file";
                    if (msg.media_name && msg.media_name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                        mediaType = "image";
                    }

                    // Tenta enviar como mídia se houver anexo
                    payload = {
                        instance: instanceId,
                        type: mediaType,
                        content: {
                            telephone: contact.telefone,
                            message: personalizedMessage,
                            base64: msg.media_base64,
                            fileName: msg.media_name
                        }
                    };
                } else {
                    payload = {
                        instance: instanceId,
                        type: "text",
                        content: {
                            telephone: contact.telefone,
                            message: personalizedMessage
                        }
                    };
                }

                console.log(`[${i + 1}/${contacts.length}] Sending to ${contact.telefone} (Name: ${firstName})...`);
                const response = await axios.post(`${baseUrl}/instances/messages`, payload, {
                    headers: getHeaders(apiKey)
                });
                
                await db.run(
                    'INSERT INTO logs_envio (message_id, tag, content, contact_name, contact_number, status) VALUES (?, ?, ?, ?, ?, ?)',
                    msg.id, msg.tag, personalizedMessage, contact.nome || 'Sem Nome', contact.telefone, 'success'
                );

                console.log(`✅ Success for ${contact.telefone}!`);
                sentCount++;
            } catch (sendErr) {
                const errorData = sendErr.response?.data;
                const errorMsg = errorData ? JSON.stringify(errorData) : sendErr.message;
                
                await db.run(
                    'INSERT INTO logs_envio (message_id, tag, content, contact_name, contact_number, status, error) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    msg.id, msg.tag, personalizedMessage, contact.nome || 'Sem Nome', contact.telefone, 'failed', errorMsg
                );

                console.error(`❌ Failed to send to ${contact.telefone}:`, errorMsg);
            }
        }

        if (sentCount > 0 || contacts.length === 0) {
            await db.run('UPDATE messages SET status = "sent" WHERE id = ?', msg.id);
            activeProcesses.delete(msg.id);
            return true;
        } else {
            await db.run('UPDATE messages SET status = "failed" WHERE id = ?', msg.id);
            activeProcesses.delete(msg.id);
            return false;
        }
    } catch (error) {
        console.error(`Error processing message ${msg.id}:`, error.message);
        await db.run('UPDATE messages SET status = "failed" WHERE id = ?', msg.id);
        activeProcesses.delete(msg.id);
        return false;
    }
}

app.post('/api/disparar/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Manual trigger requested for message ID: ${id}`);
    try {
        const msg = await db.get('SELECT * FROM messages WHERE id = ?', id);
        if (!msg) {
            console.error(`Message ID ${id} not found in database`);
            return res.status(404).json({ error: 'Mensagem não encontrada.' });
        }

        if (msg.status === 'sending') {
            return res.status(400).json({ error: 'Este disparo já está em andamento.' });
        }

        if (msg.status === 'sent') {
            return res.status(400).json({ error: 'Esta mensagem já foi enviada.' });
        }

        processMessage(msg); // Run in background
        res.json({ success: true, message: 'Disparo iniciado' });
    } catch (error) {
        console.error('Error in send-now route:', error.message);
        res.status(500).json({ error: 'Erro interno ao iniciar disparo.' });
    }
});

app.post('/api/pausar/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Pause requested for message ID: ${id}`);
    try {
        await db.run('UPDATE messages SET status = "paused" WHERE id = ?', id);
        res.json({ success: true, message: 'Disparo pausado' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao pausar.' });
    }
});

app.post('/api/retomar/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Resume requested for message ID: ${id}`);
    try {
        await db.run('UPDATE messages SET status = "pending" WHERE id = ?', id);
        res.json({ success: true, message: 'Disparo retomado' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao retomar.' });
    }
});


// ==========================================
// Webhook & Lead Monitoring API
// ==========================================

// Remove caracteres de controle/invisíveis que podem vir do env var (ex: \r do CRLF no .env)
const TARGET_ATTENDANT_NAME = (process.env.LEAD_MONITOR_ATTENDANT || 'MARIA')
    .replace(/[^\x20-\x7E\u00C0-\u024F]/g, '')  // mantém apenas ASCII imprimível + acentos latinos
    .trim();
const TARGET_ATTENDANT_EMAIL = (process.env.LEAD_MONITOR_EMAIL || '').trim().toLowerCase();
const LEAD_SESSION_WINDOW_HOURS = Math.max(1, Number(process.env.LEAD_SESSION_WINDOW_HOURS) || 24);

console.log('[Config] TARGET_ATTENDANT_NAME:', JSON.stringify(TARGET_ATTENDANT_NAME));
console.log('[Config] TARGET_ATTENDANT_NAME chars:', [...TARGET_ATTENDANT_NAME].map(c => c.charCodeAt(0)));

function normalizeComparable(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase();
}

function firstDefined(...values) {
    return values.find(value => value !== undefined && value !== null && value !== '');
}

function cleanPhone(value) {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const cleaned = String(value).split('@')[0].replace(/\D/g, '');
    return cleaned || null;
}

function extractEventType(payload) {
    return String(firstDefined(
        payload.event,
        payload.eventType,
        payload.event_type,
        payload.type,
        payload.action,
        payload.data?.event,
        payload.data?.eventType,
        payload.data?.type,
        'unknown'
    ));
}

function extractPhone(payload, outgoing = false) {
    const commonPhone = firstDefined(
        payload.phone,
        payload.telephone,
        payload.number,
        payload.contact?.phone,
        payload.contact?.number,
        payload.chat?.phone,
        payload.chat?.number,
        payload.data?.key?.remoteJid,
        payload.data?.phone,
        payload.data?.telephone,
        payload.data?.number,
        payload.data?.contact?.phone,
        payload.data?.contact?.number,
        payload.data?.chat?.phone,
        payload.data?.chat?.number,
        payload.key?.remoteJid,
        payload.remoteJid
    );

    // Em mensagens de saída, normalmente "to" é o cliente e "from" é a instância da empresa.
    // Em mensagens de entrada ocorre o inverso.
    return cleanPhone(firstDefined(
        commonPhone,
        outgoing ? payload.to : payload.from,
        outgoing ? payload.data?.to : payload.data?.from,
        outgoing ? payload.from : payload.to,
        outgoing ? payload.data?.from : payload.data?.to
    ));
}

function extractCustomerName(payload) {
    return firstDefined(
        payload.contact?.name,
        payload.customer?.name,
        payload.client?.name,
        payload.chat?.contact?.name,
        payload.data?.contact?.name,
        payload.data?.customer?.name,
        payload.data?.client?.name,
        payload.data?.chat?.contact?.name,
        payload.pushName,
        payload.data?.pushName,
        payload.name
    ) || 'Cliente WhatsApp';
}

function extractMessageContent(payload) {
    const data = payload.data || payload;
    const message = firstDefined(
        data.message,
        data.body,
        data.text,
        data.content,
        data.message?.text,
        payload.message,
        payload.body,
        payload.text,
        payload.content
    );

    if (typeof message === 'string') return message;
    if (typeof message === 'object' && message !== null) {
        return firstDefined(
            message.conversation,
            message.text,
            message.body,
            message.caption,
            message.extendedTextMessage?.text,
            message.imageMessage?.caption,
            message.videoMessage?.caption
        ) || JSON.stringify(message);
    }
    return null;
}

function extractConversationId(payload) {
    const value = firstDefined(
        payload.conversationId,
        payload.conversation_id,
        payload.chatId,
        payload.chat_id,
        payload.ticketId,
        payload.ticket_id,
        payload.serviceId,
        payload.service_id,
        payload.chat?.id,
        payload.conversation?.id,
        payload.ticket?.id,
        payload.data?.conversationId,
        payload.data?.conversation_id,
        payload.data?.chatId,
        payload.data?.chat_id,
        payload.data?.ticketId,
        payload.data?.ticket_id,
        payload.data?.serviceId,
        payload.data?.service_id,
        payload.data?.chat?.id,
        payload.data?.conversation?.id,
        payload.data?.ticket?.id
    );
    return value === undefined || value === null ? null : String(value);
}

function extractEventId(payload) {
    const value = firstDefined(
        payload.eventId,
        payload.event_id,
        payload.messageId,
        payload.message_id,
        payload.id,
        payload.key?.id,
        payload.data?.eventId,
        payload.data?.event_id,
        payload.data?.messageId,
        payload.data?.message_id,
        payload.data?.id,
        payload.data?.key?.id,
        payload.message?.id
    );
    return value === undefined || value === null ? null : String(value);
}

function parseWebhookDate(value) {
    if (value === undefined || value === null || value === '') return null;

    if (typeof value === 'number' || /^\d+$/.test(String(value))) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return null;
        const milliseconds = numeric < 100000000000 ? numeric * 1000 : numeric;
        const date = new Date(milliseconds);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function extractEventDate(payload) {
    const value = firstDefined(
        payload.timestamp,
        payload.createdAt,
        payload.created_at,
        payload.sentAt,
        payload.sent_at,
        payload.date,
        payload.data?.timestamp,
        payload.data?.createdAt,
        payload.data?.created_at,
        payload.data?.sentAt,
        payload.data?.sent_at,
        payload.data?.date,
        payload.message?.timestamp,
        payload.data?.message?.timestamp
    );
    return parseWebhookDate(value) || new Date();
}

function extractAttendantName(payload) {
    const attendant = firstDefined(
        payload.attendantName,
        payload.attendant_name,
        payload.agentName,
        payload.agent_name,
        payload.operatorName,
        payload.operator_name,
        payload.userName,
        payload.user_name,
        payload.nomeAtendente,
        payload.nome_atendente,
        payload.attendant?.name,
        payload.agent?.name,
        payload.operator?.name,
        payload.user?.name,
        payload.employee?.name,
        payload.sentBy?.name,
        payload.sent_by?.name,
        payload.data?.attendantName,
        payload.data?.attendant_name,
        payload.data?.agentName,
        payload.data?.agent_name,
        payload.data?.operatorName,
        payload.data?.operator_name,
        payload.data?.userName,
        payload.data?.user_name,
        payload.data?.nomeAtendente,
        payload.data?.nome_atendente,
        payload.data?.attendant?.name,
        payload.data?.agent?.name,
        payload.data?.operator?.name,
        payload.data?.user?.name,
        payload.data?.employee?.name,
        payload.data?.sentBy?.name,
        payload.data?.sent_by?.name,
        payload.sender?.name,
        payload.data?.sender?.name
    );
    return attendant ? String(attendant).trim() : null;
}

// ==========================================
// SM Click specific extractors
// Reads the nested "infos" structure used by the SM Click platform.
// ==========================================

function smClickChatId(payload) {
    return firstDefined(
        payload.infos?.chat?.id,
        payload.chat?.id
    ) || null;
}

function smClickPhone(payload) {
    const raw = firstDefined(
        payload.infos?.chat?.contact?.telephone,
        payload.infos?.chat?.contact?.phone,
        payload.chat?.contact?.telephone,
        payload.chat?.contact?.phone
    );
    return cleanPhone(raw);
}

function smClickCustomerName(payload) {
    return firstDefined(
        payload.infos?.chat?.contact?.name,
        payload.chat?.contact?.name
    ) || 'Cliente WhatsApp';
}

// Returns the attendant who sent the message (only present in new-chat-message).
function smClickSentByName(payload) {
    const name = firstDefined(
        payload.infos?.message?.sent_by?.name,
        payload.infos?.chat?.last_message?.sent_by?.name
    );
    return name ? String(name).trim() : null;
}

// Returns true when the message was sent by the company (not by the client).
function smClickIsFromMe(payload) {
    return firstDefined(
        payload.infos?.message?.from_me,
        payload.infos?.chat?.last_message?.from_me
    ) === true;
}

function smClickMessageText(payload) {
    return firstDefined(
        payload.infos?.message?.content?.original_text,
        payload.infos?.message?.content?.text,
        payload.infos?.chat?.last_message?.content?.original_text,
        payload.infos?.chat?.last_message?.content?.text
    ) || null;
}

function smClickFirstClientMessage(payload) {
    // For new-chat the last_message IS the first client message (from_me === false).
    const lm = payload.infos?.chat?.last_message;
    if (lm && lm.from_me === false) {
        return firstDefined(
            lm.content?.original_text,
            lm.content?.text
        ) || 'Novo chat iniciado (new-chat)';
    }
    return 'Novo chat iniciado (new-chat)';
}

function smClickEventDate(payload) {
    const raw = firstDefined(
        payload.event_time,
        payload.infos?.chat?.created_at,
        payload.infos?.message?.created_at,
        payload.infos?.message?.sent_at
    );
    return parseWebhookDate(raw) || new Date();
}

function booleanLike(value) {
    if (value === true || value === false) return value;
    const normalized = normalizeComparable(value);
    if (['TRUE', '1', 'YES', 'SIM'].includes(normalized)) return true;
    if (['FALSE', '0', 'NO', 'NAO'].includes(normalized)) return false;
    return null;
}

function isOutgoingMessage(payload) {
    const event = normalizeComparable(extractEventType(payload));
    const direction = normalizeComparable(firstDefined(payload.direction, payload.data?.direction));
    const fromMe = booleanLike(firstDefined(
        payload.fromMe,
        payload.from_me,
        payload.isFromMe,
        payload.is_from_me,
        payload.data?.fromMe,
        payload.data?.from_me,
        payload.data?.isFromMe,
        payload.data?.is_from_me,
        payload.data?.key?.fromMe,
        payload.key?.fromMe
    ));

    return fromMe === true ||
        ['OUT', 'OUTGOING', 'SAIDA', 'SENT'].includes(direction) ||
        event.includes('MESSAGE SENT') ||
        event.includes('MESSAGE-SENT') ||
        event.includes('SENT MESSAGE') ||
        event.includes('OUTGOING') ||
        event.includes('SEND MESSAGE');
}

function isNewChatEvent(payload) {
    const event = normalizeComparable(extractEventType(payload)).replace(/[\s_-]+/g, '');
    return event.includes('NEWCHAT') || event.includes('NOVACHAT') || event.includes('NOVACONVERSA');
}

function isIncomingMessage(payload) {
    if (isOutgoingMessage(payload)) return false;

    const event = normalizeComparable(extractEventType(payload));
    const direction = normalizeComparable(firstDefined(payload.direction, payload.data?.direction));
    const fromMe = booleanLike(firstDefined(
        payload.fromMe,
        payload.from_me,
        payload.isFromMe,
        payload.is_from_me,
        payload.data?.fromMe,
        payload.data?.from_me,
        payload.data?.isFromMe,
        payload.data?.is_from_me,
        payload.data?.key?.fromMe,
        payload.key?.fromMe
    ));

    if (fromMe === false) return true;
    if (['IN', 'INCOMING', 'ENTRADA', 'RECEIVED'].includes(direction)) return true;
    return event.includes('MESSAGE RECEIVED') ||
        event.includes('MESSAGE-RECEIVED') ||
        event.includes('RECEIVED MESSAGE') ||
        event.includes('INCOMING');
}

function isAttendantTarget(attendantName, attendantEmail) {
    if (!attendantName && !attendantEmail) return false;

    // Estratégia 0: verificar pelo e-mail (mais confiável, sem ambiguidade de encoding)
    if (attendantEmail && TARGET_ATTENDANT_EMAIL) {
        if (String(attendantEmail).trim().toLowerCase() === TARGET_ATTENDANT_EMAIL) return true;
    }

    if (!attendantName) return false;

    // Estratégia 1: comparação direta case-insensitive
    const actualLower  = String(attendantName).trim().toLowerCase();
    const targetLower  = String(TARGET_ATTENDANT_NAME).trim().toLowerCase();
    if (actualLower && targetLower && actualLower === targetLower) return true;

    // Estratégia 2: via normalização Unicode (remove acentos)
    const actual = normalizeComparable(attendantName);
    const target = normalizeComparable(TARGET_ATTENDANT_NAME);
    if (!actual || !target) return false;
    if (actual === target) return true;

    // Estratégia 3: nome composto - "MARIA SILVA" contém "MARIA" como palavra isolada.
    if (!target.includes(' ')) {
        if (actual.split(/\s+/).includes(target)) return true;
        if (actualLower.split(/\s+/).includes(targetLower)) return true;
    }
    return actual.includes(target);
}

async function saveWebhookLog({ eventType, payload, result, phone, attendantName }) {
    await pgPool.query(
        `INSERT INTO webhook_logs
         (event_type, payload, processing_result, customer_phone, attendant_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [eventType, JSON.stringify(payload), result, phone, attendantName]
    );
}

async function findExistingLead({ phone, conversationId, eventId, eventDate, messageContent, newChat }) {
    if (eventId) {
        const byEvent = await pgPool.query(
            'SELECT * FROM leads_monitoring WHERE first_event_id = $1 LIMIT 1',
            [eventId]
        );
        if (byEvent.rows.length) return byEvent.rows[0];
    }

    if (conversationId) {
        const byConversation = await pgPool.query(
            'SELECT * FROM leads_monitoring WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1',
            [conversationId]
        );
        if (byConversation.rows.length) return byConversation.rows[0];
    }

    // Evita duplicidade quando o SM Click repete o mesmo webhook sem ID de evento.
    const duplicateWindowSeconds = newChat ? 120 : LEAD_SESSION_WINDOW_HOURS * 3600;
    const recent = await pgPool.query(
        `SELECT * FROM leads_monitoring
         WHERE customer_phone = $1
           AND created_at >= $2::timestamp - ($3::double precision * INTERVAL '1 second')
           AND created_at <= $2::timestamp + INTERVAL '2 minutes'
         ORDER BY created_at DESC
         LIMIT 1`,
        [phone, eventDate, duplicateWindowSeconds]
    );

    if (!recent.rows.length) return null;

    if (!newChat) return recent.rows[0];
    const sameMessage = normalizeComparable(recent.rows[0].first_message) === normalizeComparable(messageContent);
    return sameMessage ? recent.rows[0] : null;
}

async function findWaitingMeasurement({ phone, conversationId }) {
    if (conversationId) {
        const byConversation = await pgPool.query(
            `SELECT * FROM leads_monitoring
             WHERE conversation_id = $1 AND answered_at IS NULL
             ORDER BY created_at DESC LIMIT 1`,
            [conversationId]
        );
        if (byConversation.rows.length) return byConversation.rows[0];
    }

    const byPhone = await pgPool.query(
        `SELECT * FROM leads_monitoring
         WHERE customer_phone = $1 AND answered_at IS NULL
         ORDER BY created_at DESC LIMIT 1`,
        [phone]
    );
    return byPhone.rows[0] || null;
}

// =============================================================================
// WEBHOOK SM CLICK — leitura direta dos campos JSON
// Fluxo:
//   1. new-chat          → salva o chat.id e dados do cliente (início da medição)
//   2. new-chat-message  → verifica se mesmo chat.id + se enviado pela MARIA → calcula tempo
// =============================================================================

// ID único da atendente monitorada (UUID, sem problemas de encoding ou capitalização)
const MARIA_ATTENDANT_ID = String(process.env.LEAD_MONITOR_ATTENDANT_ID || '').trim();
const MARIA_NAME_TARGET  = String(process.env.LEAD_MONITOR_ATTENDANT || 'MARIA').trim(); // apenas para exibição

console.log('[Config] Atendente monitorada => id:', JSON.stringify(MARIA_ATTENDANT_ID), '| nome:', JSON.stringify(MARIA_NAME_TARGET));

app.post(['/api/webhook', '/api/webhook/smclick'], async (req, res) => {
    const body = req.body || {};

    // Tipo do evento: normaliza para comparação simples
    const rawEvent = String(body.event || '').trim().toLowerCase().replace(/[-_\s]/g, '');
    const isNewChat        = rawEvent === 'newchat';
    const isNewChatMessage = rawEvent === 'newchatmessage';

    // ── Leitura DIRETA dos campos do JSON do SM Click ─────────────────────────
    const chatId      = body.infos?.chat?.id || null;
    const clientPhone = String(body.infos?.chat?.contact?.telephone || '').replace(/\D/g, '') || null;
    const clientName  = body.infos?.chat?.contact?.name || 'Cliente';
    const chatStartAt = body.event_time || body.infos?.chat?.created_at || new Date().toISOString();

    // Dados do remetente (presente em new-chat-message)
    const fromMe      = body.infos?.message?.from_me === true;
    const sentById    = body.infos?.message?.sent_by?.id    || body.infos?.chat?.last_message?.sent_by?.id    || null;
    const sentByName  = body.infos?.message?.sent_by?.name  || body.infos?.chat?.last_message?.sent_by?.name  || null;
    const msgSentAt   = body.infos?.message?.sent_at || body.event_time || new Date().toISOString();
    const msgText     = body.infos?.message?.content?.original_text || body.infos?.message?.content?.text || null;

    // Primeira msg do cliente (no new-chat, last_message vem do cliente)
    const clientFirstMsg = (body.infos?.chat?.last_message?.from_me === false)
        ? (body.infos?.chat?.last_message?.content?.text || body.infos?.chat?.last_message?.content?.original_text || 'Novo chat')
        : 'Novo chat iniciado';

    // ── Identifica se é a atendente monitorada pelo ID (UUID — sem ambiguidade) ─
    const isMaria = MARIA_ATTENDANT_ID.length > 0 && sentById === MARIA_ATTENDANT_ID;

    console.log('[Webhook]', JSON.stringify({
        event: rawEvent, chatId, clientPhone, fromMe,
        sentById, sentByName, isMaria,
        MARIA_ATTENDANT_ID
    }));


    let processingResult = 'ignored';

    try {
        // ── 1. new-chat: registra início da medição ───────────────────────────
        if (isNewChat) {
            // Ignora conversas que já nascem com um departamento associado (department !== null)
            const department = body.infos?.chat?.department;
            if (department !== null && department !== undefined) {
                processingResult = 'ignored_has_department';
                await saveWebhookLog({ eventType: body.event, payload: body, result: processingResult, phone: clientPhone, attendantName: null });
                return res.status(200).json({ success: true, action: processingResult });
            }

            if (!chatId && !clientPhone) {
                processingResult = 'ignored_no_chat_id_or_phone';
                await saveWebhookLog({ eventType: body.event, payload: body, result: processingResult, phone: clientPhone, attendantName: null });
                return res.status(200).json({ success: true, action: processingResult });
            }

            // Evita duplicata: já existe medição aberta com este chat.id?
            if (chatId) {
                const dup = await pgPool.query(
                    'SELECT id FROM leads_monitoring WHERE conversation_id = $1 AND answered_at IS NULL LIMIT 1',
                    [chatId]
                );
                if (dup.rows.length) {
                    processingResult = 'ignored_duplicate_chat';
                    await saveWebhookLog({ eventType: body.event, payload: body, result: processingResult, phone: clientPhone, attendantName: null });
                    return res.status(200).json({ success: true, action: processingResult, leadId: dup.rows[0].id });
                }
            }

            const inserted = await pgPool.query(
                `INSERT INTO leads_monitoring
                 (customer_phone, customer_name, status, created_at, first_message, conversation_id, updated_at)
                 VALUES ($1, $2, 'waiting_maria', $3, $4, $5, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [clientPhone || 'unknown', clientName, new Date(chatStartAt), clientFirstMsg, chatId]
            );

            processingResult = 'new_chat_registered';
            await saveWebhookLog({ eventType: body.event, payload: body, result: processingResult, phone: clientPhone, attendantName: null });
            return res.status(200).json({ success: true, action: processingResult, lead: inserted.rows[0] });
        }

        // ── 2. new-chat-message: verifica se é resposta da MARIA ─────────────
        if (isNewChatMessage) {
            if (!fromMe) {
                processingResult = 'ignored_client_message';
                await saveWebhookLog({ eventType: body.event, payload: body, result: processingResult, phone: clientPhone, attendantName: null });
                return res.status(200).json({ success: true, action: processingResult });
            }

            // Busca se o sentById (ou sentByName) pertence a algum vendedor cadastrado
            let seller = null;
            if (sentById) {
                const sellerQuery = await pgPool.query('SELECT name, attendant_id FROM sellers WHERE attendant_id = $1 LIMIT 1', [sentById]);
                if (sellerQuery.rows.length > 0) seller = sellerQuery.rows[0];
            } else if (sentByName) {
                const sellerQuery = await pgPool.query('SELECT name, attendant_id FROM sellers WHERE name = $1 LIMIT 1', [sentByName]);
                if (sellerQuery.rows.length > 0) seller = sellerQuery.rows[0];
            }

            if (!seller) {
                processingResult = sentByName ? `ignored_unregistered_attendant:${sentByName}` : 'ignored_attendant_not_identified';
                await saveWebhookLog({ eventType: body.event, payload: body, result: processingResult, phone: clientPhone, attendantName: sentByName });
                return res.status(200).json({ success: true, action: processingResult });
            }

            // Busca medição aberta pelo chat.id (ou fallback por telefone)
            let lead = null;
            if (chatId) {
                const r = await pgPool.query(
                    `SELECT * FROM leads_monitoring WHERE conversation_id = $1 AND answered_at IS NULL ORDER BY created_at DESC LIMIT 1`,
                    [chatId]
                );
                lead = r.rows[0] || null;
            }
            if (!lead && clientPhone) {
                const r = await pgPool.query(
                    `SELECT * FROM leads_monitoring WHERE customer_phone = $1 AND answered_at IS NULL ORDER BY created_at DESC LIMIT 1`,
                    [clientPhone]
                );
                lead = r.rows[0] || null;
            }

            if (!lead) {
                processingResult = 'ignored_no_waiting_measurement';
                await saveWebhookLog({ eventType: body.event, payload: body, result: processingResult, phone: clientPhone, attendantName: sentByName });
                return res.status(200).json({ success: true, action: processingResult });
            }

            // Calcula tempo: do new-chat até a primeira mensagem da MARIA
            const t0 = new Date(lead.created_at);
            const t1 = new Date(msgSentAt);
            const responseTimeSecs = Math.max(0, Math.round((t1 - t0) / 1000));

            const finalCustomerName = (clientName && clientName !== 'Cliente' && clientName !== 'Contato') ? clientName : lead.customer_name;
            const finalCustomerPhone = (clientPhone && clientPhone !== 'unknown') ? clientPhone : lead.customer_phone;

            const updated = await pgPool.query(
                `UPDATE leads_monitoring
                 SET status         = 'measured',
                     answered_at    = $1,
                     response_time  = $2,
                     maria_message  = $3,
                     attendant_name = $4,
                     customer_name  = $5,
                     customer_phone = $6,
                     attendant_id   = $7,
                     updated_at     = CURRENT_TIMESTAMP
                 WHERE id = $8 AND answered_at IS NULL
                 RETURNING *`,
                [t1, responseTimeSecs, msgText || `Primeira mensagem de ${seller.name}`, seller.name, finalCustomerName, finalCustomerPhone, seller.attendant_id, lead.id]
            );

            processingResult = updated.rows.length ? 'first_maria_message_measured' : 'ignored_already_measured';
            await saveWebhookLog({ eventType: body.event, payload: body, result: processingResult, phone: clientPhone, attendantName: sentByName });
            return res.status(200).json({ success: true, action: processingResult, lead: updated.rows[0] || lead });
        }

        // ── 3. Outros eventos: ignorados ─────────────────────────────────────
        processingResult = 'ignored_unrelated_event';
        await saveWebhookLog({ eventType: body.event, payload: body, result: processingResult, phone: clientPhone, attendantName: null });
        return res.status(200).json({ success: true, action: processingResult });

    } catch (err) {
        console.error('[Webhook] Erro:', err.message);
        try {
            await saveWebhookLog({ eventType: body.event, payload: body, result: `error:${err.message}`.slice(0, 100), phone: clientPhone, attendantName: sentByName || null });
        } catch (_) {}
        return res.status(500).json({ error: 'Erro ao processar webhook.', details: err.message });
    }
});

// Retorna todas as medições. Os registros permanecem disponíveis mesmo após o tempo ser calculado.
app.get('/api/leads', async (req, res) => {
    try {
        const result = await pgPool.query(`
            SELECT *,
                   CASE WHEN answered_at IS NULL THEN 'waiting_maria' ELSE 'measured' END AS measurement_status
            FROM leads_monitoring
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching leads:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Cadastra uma medição manual para testes.
app.post('/api/leads', async (req, res) => {
    const { phone, name, created_at, answered_at, first_message, maria_message } = req.body;
    try {
        if (!phone) {
            return res.status(400).json({ error: 'O telefone é obrigatório.' });
        }

        const phoneClean = cleanPhone(phone);
        const firstCustomerAt = created_at ? new Date(created_at) : new Date();
        const firstMariaAt = answered_at ? new Date(answered_at) : null;
        const responseTime = firstMariaAt
            ? Math.max(0, Math.round((firstMariaAt - firstCustomerAt) / 1000))
            : null;

        const result = await pgPool.query(
            `INSERT INTO leads_monitoring
             (customer_phone, customer_name, status, created_at, answered_at,
              response_time, first_message, maria_message, attendant_name, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
             RETURNING *`,
            [
                phoneClean,
                name || 'Lead Manual',
                firstMariaAt ? 'measured' : 'waiting_maria',
                firstCustomerAt,
                firstMariaAt,
                responseTime,
                first_message || 'Lead adicionado manualmente',
                maria_message || null,
                firstMariaAt ? TARGET_ATTENDANT_NAME : null
            ]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating lead:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Deleta somente o registro de medição local; não altera a conversa no SM Click.
app.delete('/api/leads/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pgPool.query('DELETE FROM leads_monitoring WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting lead:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Limpa somente os registros locais de medição; não encerra conversas.
app.post('/api/leads/clear', async (req, res) => {
    try {
        await pgPool.query('DELETE FROM leads_monitoring');
        res.json({ success: true });
    } catch (err) {
        console.error('Error clearing leads:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Simula apenas a primeira mensagem da MARIA para validar o cálculo.
app.post('/api/leads/:id/simulate-reply', async (req, res) => {
    const { id } = req.params;
    const { reply_message } = req.body;
    try {
        const leadResult = await pgPool.query('SELECT * FROM leads_monitoring WHERE id = $1', [id]);
        if (leadResult.rows.length === 0) {
            return res.status(404).json({ error: 'Lead não encontrado.' });
        }

        const lead = leadResult.rows[0];
        if (lead.answered_at) {
            return res.status(200).json({
                ...lead,
                alreadyMeasured: true,
                message: 'O tempo desta conversa já foi calculado pela primeira mensagem da MARIA.'
            });
        }

        const firstMariaAt = new Date();
        const firstCustomerAt = new Date(lead.created_at);
        const responseTimeSecs = Math.max(0, Math.round((firstMariaAt - firstCustomerAt) / 1000));

        const updateResult = await pgPool.query(
            `UPDATE leads_monitoring
             SET status = 'measured', answered_at = $1, response_time = $2,
                 maria_message = $3, attendant_name = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 AND answered_at IS NULL
             RETURNING *`,
            [
                firstMariaAt,
                responseTimeSecs,
                reply_message || `Simulação da primeira mensagem de ${TARGET_ATTENDANT_NAME}`,
                TARGET_ATTENDANT_NAME,
                id
            ]
        );

        res.json(updateResult.rows[0]);
    } catch (err) {
        console.error('Error simulating reply:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Retorna os logs brutos dos webhooks
app.get('/api/webhook-logs', async (req, res) => {
    try {
        const result = await pgPool.query('SELECT * FROM webhook_logs ORDER BY received_at DESC LIMIT 100');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching webhook logs:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Limpa os logs de webhooks
app.post('/api/webhook-logs/clear', async (req, res) => {
    try {
        await pgPool.query('DELETE FROM webhook_logs');
        res.json({ success: true });
    } catch (err) {
        console.error('Error clearing webhook logs:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Sellers API
// ==========================================
app.get('/api/sellers', async (req, res) => {
    try {
        const result = await pgPool.query('SELECT id, name, attendant_id, photo_base64, created_at, updated_at FROM sellers ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching sellers:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sellers', async (req, res) => {
    const { name, attendant_id, photo_base64 } = req.body;
    try {
        const result = await pgPool.query(
            `INSERT INTO sellers (name, attendant_id, photo_base64)
             VALUES ($1, $2, $3) RETURNING *`,
            [name, attendant_id, photo_base64]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating seller:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/sellers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, attendant_id, photo_base64 } = req.body;
    try {
        const result = await pgPool.query(
            `UPDATE sellers SET name = $1, attendant_id = $2, photo_base64 = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 RETURNING *`,
            [name, attendant_id, photo_base64, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating seller:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/sellers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pgPool.query('DELETE FROM sellers WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting seller:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Dashboard API
// ==========================================
app.get('/api/dashboard', async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const params = [];
        let joinCondition = `ON s.attendant_id = lm.attendant_id`;
        if (startDate && endDate) {
            joinCondition += ` AND lm.created_at >= $1 AND lm.created_at <= $2`;
            params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        }

        const query = `
            SELECT 
                s.id, 
                s.name, 
                s.attendant_id, 
                s.photo_base64,
                COUNT(lm.id) as total_chats,
                COUNT(CASE WHEN lm.status = 'waiting_maria' THEN 1 END) as open_chats,
                COUNT(CASE WHEN lm.status = 'measured' THEN 1 END) as answered_chats,
                AVG(CASE WHEN lm.status = 'measured' THEN lm.response_time END) as avg_response_time
            FROM sellers s
            LEFT JOIN leads_monitoring lm ${joinCondition}
            GROUP BY s.id, s.name, s.attendant_id, s.photo_base64
            ORDER BY avg_response_time ASC NULLS LAST, name ASC
        `;

        const result = await pgPool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching dashboard:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/sellers/:id/chats', async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    try {
        const sellerResult = await pgPool.query('SELECT attendant_id FROM sellers WHERE id = $1', [id]);
        if (!sellerResult.rows.length) {
            return res.status(404).json({ error: 'Seller not found' });
        }
        
        const attendantId = sellerResult.rows[0].attendant_id;
        
        let whereClause = `WHERE attendant_id = $1`;
        const params = [attendantId];
        let paramIndex = 2;
        
        if (startDate && endDate) {
            whereClause += ` AND created_at >= $${paramIndex} AND created_at <= $${paramIndex + 1}`;
            params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
            paramIndex += 2;
        }
        
        const countQuery = `SELECT COUNT(*) FROM leads_monitoring ${whereClause}`;
        const countResult = await pgPool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);
        
        const offset = (page - 1) * limit;
        const query = `
            SELECT * FROM leads_monitoring 
            ${whereClause} 
            ORDER BY created_at DESC 
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        
        params.push(limit, offset);
        const result = await pgPool.query(query, params);
        
        res.json({
            data: result.rows,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error('Error fetching seller chats:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// Serve o frontend React gerado pelo Vite.
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');

if (fs.existsSync(FRONTEND_DIST)) {
    app.use(express.static(FRONTEND_DIST));

    // Fallback de SPA sem usar wildcard incompatível com Express 5.
    app.use((req, res, next) => {
        if (req.method !== 'GET' || req.path.startsWith('/api')) {
            return next();
        }

        res.sendFile(path.join(FRONTEND_DIST, 'index.html'), (error) => {
            if (error) next(error);
        });
    });
} else {
    console.warn(`[Backend] Frontend não encontrado em ${FRONTEND_DIST}`);
}

// Cron Job: Every minute
nodeCron.schedule('* * * * *', async () => {
    const now = new Date();
    const pending = await db.all(
        'SELECT * FROM messages WHERE status = "pending"'
    );

    for (const msg of pending) {
        if (new Date(msg.scheduled_at) <= now) {
            await processMessage(msg);
        }
    }
});

const PORT = Number(process.env.PORT) || 3001;
initDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Backend running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Falha ao iniciar o sistema:', error);
    process.exit(1);
});
