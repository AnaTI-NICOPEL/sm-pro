const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const axios = require('axios');
const path = require('path');

// Configuração do PostgreSQL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL não configurada nas variáveis de ambiente.');
}

const pgPool = new Pool({
    connectionString,
});

// Configurações padrão do SM Click
let baseUrl = 'https://api.smclick.com.br';
let apiKey = process.env.SMCLICK_API_KEY || '';

// Estado da Importação
let state = {
    status: 'idle', // 'idle' | 'running' | 'paused_delay' | 'completed' | 'failed' | 'cancelled'
    totalContacts: 0,
    contactsProcessed: 0,
    contactsSaved: 0,
    currentPage: 0,
    totalPages: 0,
    currentBatch: 0,
    totalBatches: 0,
    nextBatchTime: null, // timestamp
    startTime: null,
    elapsedTime: 0,
    logs: [] // log messages for UI
};

let cancelRequested = false;
let pauseRequested = false;
let activeInterval = null;

function addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${message}`;
    state.logs.unshift(formatted);
    if (state.logs.length > 50) state.logs.pop(); // keep last 50
    console.log(formatted);
}

async function loadConfig() {
    try {
        const DB_PATH = path.join(__dirname, 'database.sqlite');
        const db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });
        const settings = await db.all('SELECT * FROM settings');
        settings.forEach(s => {
            if (s.key === 'apiKey') apiKey = s.value;
            if (s.key === 'baseUrl') baseUrl = s.value;
        });
        await db.close();
    } catch (e) {
        // Fallback configuration is used
    }
}

function getHeaders() {
    return {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
    };
}

async function getActiveInstanceId() {
    try {
        const response = await axios.get(`${baseUrl}/instances`, { headers: getHeaders() });
        const instances = response.data;
        const nicopel = instances.find(i => i.name && i.name.toUpperCase().includes('NICOPEL'));
        const active = nicopel || instances.find(i => i.status === 'PAIRED' || i.status === 'CONNECTED') || instances[0];
        return active ? active.id : null;
    } catch (error) {
        addLog(`❌ Erro ao buscar instâncias: ${error.message}`);
        return null;
    }
}

async function preparePgDatabase() {
    try {
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
        addLog('✅ Tabela "contatos" pronta no PostgreSQL Neon.');
    } catch (err) {
        addLog(`❌ Erro ao criar tabela no PG: ${err.message}`);
        throw err;
    }
}

async function startImportBackground() {
    if (state.status === 'running' || state.status === 'paused_delay') {
        addLog('⚠️ Importação já está em andamento.');
        return;
    }

    cancelRequested = false;
    pauseRequested = false;

    state = {
        status: 'running',
        totalContacts: 0,
        contactsProcessed: 0,
        contactsSaved: 0,
        currentPage: 0,
        totalPages: 0,
        currentBatch: 0,
        totalBatches: 0,
        nextBatchTime: null,
        startTime: Date.now(),
        elapsedTime: 0,
        logs: []
    };

    addLog('🚀 Iniciando processo de importação em background...');
    
    // Inicia cronômetro
    if (activeInterval) clearInterval(activeInterval);
    activeInterval = setInterval(() => {
        if (state.status === 'running' || state.status === 'paused_delay' || state.status === 'paused_user') {
            state.elapsedTime = Math.round((Date.now() - state.startTime) / 1000);
        } else {
            clearInterval(activeInterval);
        }
    }, 1000);

    // Executa fluxo em background
    executeImportFlow().catch(err => {
        state.status = 'failed';
        addLog(`❌ Erro crítico: ${err.message}`);
    });
}

async function executeImportFlow() {
    await loadConfig();
    await preparePgDatabase();

    const instanceId = await getActiveInstanceId();
    if (!instanceId) {
        state.status = 'failed';
        addLog('❌ Nenhuma instância ativa encontrada. Importação cancelada.');
        return;
    }
    addLog(`✅ Usando instância ativa: ${instanceId}`);

    // Obter primeira página
    addLog('Buscando informações iniciais da API...');
    let totalContacts = 0;
    let pageSize = 10;
    try {
        const response = await axios.get(`${baseUrl}/contacts?instance=${instanceId}&page=1`, { headers: getHeaders() });
        totalContacts = response.data.count || 0;
        pageSize = Array.isArray(response.data.results) ? response.data.results.length : 10;
        if (pageSize === 0) pageSize = 10;
    } catch (e) {
        state.status = 'failed';
        addLog(`❌ Erro ao buscar contatos na API: ${e.message}`);
        return;
    }

    state.totalContacts = totalContacts;
    state.totalPages = Math.ceil(totalContacts / pageSize);
    
    const contactsPerBatch = 1000;
    const pagesPerBatch = Math.ceil(contactsPerBatch / pageSize); // 100 páginas
    state.totalBatches = Math.ceil(state.totalPages / pagesPerBatch);
    state.currentBatch = 1;
    state.currentPage = 1;

    addLog(`📊 Total de contatos na API: ${totalContacts}. Páginas: ${state.totalPages}`);
    addLog(`⚡ Configurado: Lotes de ${contactsPerBatch} contatos (${pagesPerBatch} páginas) com pausa de 2 minutos.`);

    // Concorrência interna por lote
    const CONCURRENCY = 10;

    while (state.currentPage <= state.totalPages) {

        // --- Checagem de cancelamento no topo do loop principal ---
        if (cancelRequested) {
            state.status = 'cancelled';
            addLog('🛑 Importação interrompida pelo usuário.');
            return;
        }

        // --- Checagem de pausa pelo usuário ---
        if (pauseRequested) {
            state.status = 'paused_user';
            addLog('⏸️ Importação pausada pelo usuário. Clique em Retomar para continuar.');
            while (pauseRequested) {
                if (cancelRequested) {
                    state.status = 'cancelled';
                    addLog('🛑 Importação interrompida pelo usuário.');
                    return;
                }
                await new Promise(r => setTimeout(r, 500));
            }
            state.status = 'running';
            addLog('▶️ Importação retomada.');
        }

        // Determina o limite de páginas para este lote (100 páginas = 1000 contatos)
        const batchEndPage = Math.min(state.currentPage + pagesPerBatch - 1, state.totalPages);
        addLog(`📦 Iniciando Lote ${state.currentBatch}/${state.totalBatches} (Páginas ${state.currentPage} a ${batchEndPage})...`);

        // Processa o lote em grupos concorrentes
        for (let pageGroupStart = state.currentPage; pageGroupStart <= batchEndPage; pageGroupStart += CONCURRENCY) {

            // Checagem de cancelamento/pausa antes de cada grupo de páginas
            if (cancelRequested) {
                state.status = 'cancelled';
                addLog('🛑 Importação interrompida pelo usuário.');
                return;
            }

            if (pauseRequested) {
                state.status = 'paused_user';
                addLog('⏸️ Importação pausada pelo usuário. Clique em Retomar para continuar.');
                while (pauseRequested) {
                    if (cancelRequested) {
                        state.status = 'cancelled';
                        addLog('🛑 Importação interrompida pelo usuário.');
                        return;
                    }
                    await new Promise(r => setTimeout(r, 500));
                }
                state.status = 'running';
                addLog('▶️ Importação retomada.');
            }

            const pageGroup = [];
            for (let k = 0; k < CONCURRENCY && (pageGroupStart + k) <= batchEndPage; k++) {
                pageGroup.push(pageGroupStart + k);
            }

            addLog(`Buscando páginas ${pageGroup.join(', ')}...`);

            const promises = pageGroup.map(page =>
                axios.get(`${baseUrl}/contacts?instance=${instanceId}&page=${page}`, { headers: getHeaders(), timeout: 15000 })
                    .then(res => ({ page, data: res.data }))
                    .catch(err => {
                        addLog(`❌ Erro na página ${page}: ${err.message}`);
                        return { page, data: null };
                    })
            );

            const results = await Promise.all(promises);

            for (const result of results) {
                if (!result.data || !result.data.results) continue;

                const contacts = result.data.results;
                for (const contact of contacts) {
                    state.contactsProcessed++;
                    const contactTags = contact.tags || [];

                    if (contactTags.length === 0) continue;

                    const nome = contact.name || 'Sem Nome';
                    const telefone = contact.telephone || contact.whatsapp_id;

                    if (!telefone) continue;

                    for (const t of contactTags) {
                        const tagName = typeof t === 'object' ? t.name : t;
                        if (!tagName) continue;

                        try {
                            await pgPool.query(`
                                INSERT INTO contatos (nome, telefone, tag, updated_at)
                                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                                ON CONFLICT (telefone, tag)
                                DO UPDATE SET nome = EXCLUDED.nome, updated_at = CURRENT_TIMESTAMP
                            `, [nome, telefone, tagName]);
                            state.contactsSaved++;
                        } catch (dbErr) {
                            addLog(`❌ Erro ao salvar ${telefone} com tag "${tagName}": ${dbErr.message}`);
                        }
                    }
                }
            }

            // Atualiza a página atual do estado
            state.currentPage = pageGroup[pageGroup.length - 1] + 1;
        }

        // Lote concluído. Se ainda houver mais contatos, aguarda 2 minutos
        if (state.currentPage <= state.totalPages) {
            state.status = 'paused_delay';
            const pauseDuration = 2 * 60 * 1000; // 2 minutos
            state.nextBatchTime = Date.now() + pauseDuration;
            addLog(`⏳ Lote ${state.currentBatch} concluído. Pausa de 2 minutos antes do próximo lote...`);

            const pauseStart = Date.now();
            while (Date.now() - pauseStart < pauseDuration) {
                if (cancelRequested) {
                    state.status = 'cancelled';
                    addLog('🛑 Importação interrompida durante o intervalo.');
                    return;
                }
                // Pausa manual durante o intervalo de segurança
                if (pauseRequested) {
                    state.status = 'paused_user';
                    state.nextBatchTime = null;
                    addLog('⏸️ Importação pausada durante o intervalo de segurança.');
                    while (pauseRequested) {
                        if (cancelRequested) {
                            state.status = 'cancelled';
                            addLog('🛑 Importação interrompida pelo usuário.');
                            return;
                        }
                        await new Promise(r => setTimeout(r, 500));
                    }
                    addLog('▶️ Importação retomada. Iniciando próximo lote...');
                    // Sai do loop de 2 minutos imediatamente ao retomar
                    break;
                }
                await new Promise(r => setTimeout(r, 1000));
            }

            state.status = 'running';
            state.nextBatchTime = null;
            state.currentBatch++;
        }
    }

    state.status = 'completed';
    addLog(`🎉 Importação finalizada! Contatos analisados: ${state.contactsProcessed}. Salvos: ${state.contactsSaved}`);
}

function cancelImport() {
    cancelRequested = true;
    pauseRequested = false;
    if (['paused_delay', 'paused_user', 'idle'].includes(state.status)) {
        state.status = 'cancelled';
        addLog('🛑 Importação interrompida pelo usuário.');
    }
}

function pauseImport() {
    if (['running', 'paused_delay'].includes(state.status)) {
        pauseRequested = true;
        addLog('⏸️ Pausa solicitada...');
    }
}

function resumeImport() {
    if (state.status === 'paused_user') {
        pauseRequested = false;
        addLog('▶️ Retomando importação...');
    }
}

function getStatus() {
    return {
        ...state,
        nextBatchCountdown: state.nextBatchTime ? Math.max(0, Math.round((state.nextBatchTime - Date.now()) / 1000)) : 0
    };
}

// Suporte para rodar direto via CLI
if (require.main === module) {
    (async () => {
        await startImportBackground();
    })();
}

module.exports = {
    startImportBackground,
    cancelImport,
    pauseImport,
    resumeImport,
    getStatus
};
