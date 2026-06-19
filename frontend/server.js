require('dotenv').config({ path: '.env.local' });
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const nodeCron = require('node-cron');
const { pgPool } = require('./lib/db');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

async function initPostgres() {
    // Tabela de Configurações
    await pgPool.query(`
        CREATE TABLE IF NOT EXISTS settings (
            key VARCHAR(255) PRIMARY KEY,
            value TEXT
        );
    `);

    // Tabela de Mensagens
    await pgPool.query(`
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            tag TEXT,
            content TEXT,
            scheduled_at TIMESTAMP,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            media_name TEXT,
            media_base64 TEXT
        );
    `);

    // Tabela de Logs de Envio
    await pgPool.query(`
        CREATE TABLE IF NOT EXISTS logs_envio (
            id SERIAL PRIMARY KEY,
            message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
            tag TEXT,
            content TEXT,
            contact_name VARCHAR(255),
            contact_number VARCHAR(50),
            status VARCHAR(50),
            error TEXT,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Adicionando coluna attendant_id caso não exista (da migration anterior)
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

    // Demais tabelas mantidas
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

    await pgPool.query(`
        CREATE TABLE IF NOT EXISTS tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

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

    console.log('✅ PostgreSQL Schema Initialized');
}

async function migrateSqliteToPostgres() {
    const sqlitePath = path.join(__dirname, '..', 'backend', 'database.sqlite');
    if (!fs.existsSync(sqlitePath)) return;

    console.log('🔄 Encontrado banco SQLite antigo. Iniciando migração para PostgreSQL...');
    const db = await open({ filename: sqlitePath, driver: sqlite3.Database });

    try {
        const settings = await db.all('SELECT * FROM settings');
        for (const s of settings) {
            await pgPool.query(
                'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
                [s.key, s.value]
            );
        }

        const messages = await db.all('SELECT * FROM messages');
        for (const m of messages) {
            await pgPool.query(
                `INSERT INTO messages (id, tag, content, scheduled_at, status, created_at, media_name, media_base64) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
                [m.id, m.tag, m.content, new Date(m.scheduled_at), m.status, new Date(m.created_at), m.media_name, m.media_base64]
            );
        }

        // Set sequence to max id so next inserts don't fail
        const maxMsgResult = await pgPool.query('SELECT MAX(id) FROM messages');
        const maxMsgId = maxMsgResult.rows[0].max;
        if (maxMsgId) {
            await pgPool.query(`SELECT setval('messages_id_seq', ${maxMsgId})`);
        }

        const logs = await db.all('SELECT * FROM logs_envio');
        for (const l of logs) {
            await pgPool.query(
                `INSERT INTO logs_envio (id, message_id, tag, content, contact_name, contact_number, status, error, sent_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
                [l.id, l.message_id, l.tag, l.content, l.contact_name, l.contact_number, l.status, l.error, new Date(l.sent_at)]
            );
        }
        
        const maxLogResult = await pgPool.query('SELECT MAX(id) FROM logs_envio');
        const maxLogId = maxLogResult.rows[0].max;
        if (maxLogId) {
            await pgPool.query(`SELECT setval('logs_envio_id_seq', ${maxLogId})`);
        }

        console.log('✅ Migração do SQLite concluída!');
        
        // Renomear o arquivo para evitar migração repetida
        fs.renameSync(sqlitePath, sqlitePath + '.migrated');
        
    } catch (e) {
        console.error('❌ Erro na migração do SQLite:', e);
    } finally {
        await db.close();
    }
}

// Background Job - Cron para processamento de mensagens
const activeProcesses = new Set();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getHeaders(apiKey) {
    return {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
    };
}

async function getApiConfig() {
    const res = await pgPool.query('SELECT key, value FROM settings');
    const config = {};
    res.rows.forEach(r => config[r.key] = r.value);
    // Fallbacks
    if (!config.baseUrl) config.baseUrl = 'https://api.smclick.com.br';
    if (!config.apiKey) config.apiKey = process.env.SMCLICK_API_KEY;
    return config;
}

async function getActiveInstanceId() {
    const { baseUrl, apiKey } = await getApiConfig();
    try {
        const response = await axios.get(`${baseUrl}/instances`, { headers: getHeaders(apiKey) });
        const instances = response.data;
        const nicopel = instances.find(i => i.name && i.name.toUpperCase().includes('NICOPEL'));
        const active = nicopel || instances.find(i => i.status === 'PAIRED' || i.status === 'CONNECTED') || instances[0];
        return active ? active.id : null;
    } catch (error) {
        console.error('Error fetching instances:', error.message);
        return null;
    }
}

async function processMessage(msg) {
    if (activeProcesses.has(msg.id)) return false;
    activeProcesses.add(msg.id);

    try {
        const check = await pgPool.query('UPDATE messages SET status = $1 WHERE id = $2 AND status = $3 RETURNING id', ['sending', msg.id, 'pending']);
        if (check.rowCount === 0) {
            activeProcesses.delete(msg.id);
            return false;
        }

        console.log(`\n--- Iniciando disparo para: ${msg.tag} (ID: ${msg.id}) ---`);
        const { baseUrl, apiKey } = await getApiConfig();
        const instanceId = await getActiveInstanceId();
        
        if (!instanceId) {
            console.error('❌ No active instance found');
            await pgPool.query('UPDATE messages SET status = $1 WHERE id = $2', ['failed', msg.id]);
            activeProcesses.delete(msg.id);
            return false;
        }

        const tagsArray = msg.tag.split(',').map(t => t.trim());
        const pgResult = await pgPool.query(
            'SELECT DISTINCT nome, telefone FROM contatos WHERE tag = ANY($1)',
            [tagsArray]
        );
        const allContacts = pgResult.rows;

        const sentLogs = await pgPool.query('SELECT contact_number FROM logs_envio WHERE message_id = $1 AND status = $2', [msg.id, 'success']);
        const processedNumbers = new Set(sentLogs.rows.map(l => l.contact_number));
        const contacts = allContacts.filter(c => !processedNumbers.has(c.telefone));

        let sentCount = 0;
        for (let i = 0; i < contacts.length; i++) {
            const statusCheck = await pgPool.query('SELECT status FROM messages WHERE id = $1', [msg.id]);
            if (!statusCheck.rows.length || statusCheck.rows[0].status !== 'sending') {
                console.log(`🛑 Disparo ${msg.id} pausado/cancelado.`);
                activeProcesses.delete(msg.id);
                return false;
            }

            const contact = contacts[i];
            const rawName = contact.nome || 'Sem Nome';
            const firstName = rawName.split('-')[0].trim();
            const personalizedMessage = msg.content ? msg.content.replace(/{nome}/gi, firstName) : '';

            if (i > 0) await sleep(45000); // Aguarda 45s entre mensagens para evitar block

            try {
                let payload = {};
                if (msg.media_base64) {
                    let mediaType = "file";
                    if (msg.media_name && msg.media_name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                        mediaType = "image";
                    }
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

                await axios.post(`${baseUrl}/instances/messages`, payload, { headers: getHeaders(apiKey) });
                
                await pgPool.query(
                    'INSERT INTO logs_envio (message_id, tag, content, contact_name, contact_number, status) VALUES ($1, $2, $3, $4, $5, $6)',
                    [msg.id, msg.tag, personalizedMessage, contact.nome || 'Sem Nome', contact.telefone, 'success']
                );
                sentCount++;
                console.log(`✅ Sucesso para ${contact.telefone}`);
            } catch (err) {
                const errorData = err.response?.data;
                const errorMsg = errorData ? JSON.stringify(errorData) : err.message;
                await pgPool.query(
                    'INSERT INTO logs_envio (message_id, tag, content, contact_name, contact_number, status, error) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [msg.id, msg.tag, personalizedMessage, contact.nome || 'Sem Nome', contact.telefone, 'failed', errorMsg]
                );
            }
        }

        const finalStatus = (sentCount > 0 || contacts.length === 0) ? 'sent' : 'failed';
        await pgPool.query('UPDATE messages SET status = $1 WHERE id = $2', [finalStatus, msg.id]);
        activeProcesses.delete(msg.id);
        return true;
    } catch (e) {
        console.error('Erro geral no processMessage:', e);
        await pgPool.query('UPDATE messages SET status = $1 WHERE id = $2', ['failed', msg.id]);
        activeProcesses.delete(msg.id);
        return false;
    }
}

// Inicialização do servidor
app.prepare().then(async () => {
    await initPostgres();
    await migrateSqliteToPostgres();

    // Cron rodando a cada minuto
    nodeCron.schedule('* * * * *', async () => {
        const now = new Date();
        const res = await pgPool.query("SELECT * FROM messages WHERE status = 'pending' AND scheduled_at <= $1", [now]);
        for (const msg of res.rows) {
            processMessage(msg);
        }
    });

    createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        
        // Passar banco de dados globalmente para as rotas Next API (via req se necessário, mas usaremos export comum)
        // O Next.js será responsável pelas rotas /api/* e renderização
        handle(req, res, parsedUrl);
    }).listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});

// Exporta o utilitário caso necessário pelas rotas
module.exports = { pgPool, processMessage };
