const axios = require('axios');
const { pgPool } = require('./db');

// Estado da Importação
if (!global.importState) {
    global.importState = {
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
        logs: [], // log messages for UI
        report: { added: [], modified: [], deleted: [], errors: [] }
    };
    global.importCancelRequested = false;
    global.importPauseRequested = false;
    global.importActiveInterval = null;
}

function addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${message}`;
    global.importState.logs.unshift(formatted);
    if (global.importState.logs.length > 50) global.importState.logs.pop(); // keep last 50
    console.log(formatted);
}

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
        addLog(`❌ Erro ao buscar instâncias: ${error.message}`);
        return null;
    }
}

async function startImportBackground() {
    if (global.importState.status === 'running' || global.importState.status === 'paused_delay') {
        addLog('⚠️ Importação já está em andamento.');
        return;
    }

    global.importCancelRequested = false;
    global.importPauseRequested = false;

    global.importState = {
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
        logs: [],
        report: { added: [], modified: [], deleted: [], errors: [] }
    };

    addLog('🚀 Iniciando processo de importação em background...');
    
    // Inicia cronômetro
    if (global.importActiveInterval) clearInterval(global.importActiveInterval);
    global.importActiveInterval = setInterval(() => {
        if (global.importState.status === 'running' || global.importState.status === 'paused_delay' || global.importState.status === 'paused_user') {
            global.importState.elapsedTime = Math.round((Date.now() - global.importState.startTime) / 1000);
        } else {
            clearInterval(global.importActiveInterval);
        }
    }, 1000);

    // Executa fluxo em background
    executeImportFlow().catch(err => {
        global.importState.status = 'failed';
        addLog(`❌ Erro crítico: ${err.message}`);
    });
}

async function executeImportFlow() {
    const { baseUrl, apiKey } = await getApiConfig();
    const instanceId = await getActiveInstanceId();
    if (!instanceId) {
        global.importState.status = 'failed';
        addLog('❌ Nenhuma instância ativa encontrada. Importação cancelada.');
        return;
    }
    addLog(`✅ Usando instância ativa: ${instanceId}`);

    addLog('Buscando informações iniciais da API...');
    let totalContacts = 0;
    let pageSize = 10;
    try {
        const response = await axios.get(`${baseUrl}/contacts?instance=${instanceId}&page=1`, { headers: getHeaders(apiKey) });
        totalContacts = response.data.count || 0;
        pageSize = Array.isArray(response.data.results) ? response.data.results.length : 10;
        if (pageSize === 0) pageSize = 10;
    } catch (e) {
        global.importState.status = 'failed';
        addLog(`❌ Erro ao buscar contatos na API: ${e.message}`);
        return;
    }

    global.importState.totalContacts = totalContacts;
    global.importState.totalPages = Math.ceil(totalContacts / pageSize);
    
    const contactsPerBatch = 1000;
    const pagesPerBatch = Math.ceil(contactsPerBatch / pageSize);
    global.importState.totalBatches = Math.ceil(global.importState.totalPages / pagesPerBatch);
    global.importState.currentBatch = 1;
    global.importState.currentPage = 1;

    addLog(`📊 Total de contatos na API: ${totalContacts}. Páginas: ${global.importState.totalPages}`);
    addLog(`⚡ Configurado: Lotes de ${contactsPerBatch} contatos (${pagesPerBatch} páginas) com pausa de 15 segundos.`);

    const CONCURRENCY = 10;

    while (global.importState.currentPage <= global.importState.totalPages) {
        if (global.importCancelRequested) {
            global.importState.status = 'cancelled';
            addLog('🛑 Importação interrompida pelo usuário.');
            return;
        }

        if (global.importPauseRequested) {
            global.importState.status = 'paused_user';
            addLog('⏸️ Importação pausada pelo usuário. Clique em Retomar para continuar.');
            while (global.importPauseRequested) {
                if (global.importCancelRequested) {
                    global.importState.status = 'cancelled';
                    addLog('🛑 Importação interrompida pelo usuário.');
                    return;
                }
                await new Promise(r => setTimeout(r, 500));
            }
            global.importState.status = 'running';
            addLog('▶️ Importação retomada.');
        }

        const batchEndPage = Math.min(global.importState.currentPage + pagesPerBatch - 1, global.importState.totalPages);
        addLog(`📦 Iniciando Lote ${global.importState.currentBatch}/${global.importState.totalBatches} (Páginas ${global.importState.currentPage} a ${batchEndPage})...`);

        for (let pageGroupStart = global.importState.currentPage; pageGroupStart <= batchEndPage; pageGroupStart += CONCURRENCY) {
            if (global.importCancelRequested) {
                global.importState.status = 'cancelled';
                addLog('🛑 Importação interrompida pelo usuário.');
                return;
            }

            if (global.importPauseRequested) {
                global.importState.status = 'paused_user';
                addLog('⏸️ Importação pausada pelo usuário. Clique em Retomar para continuar.');
                while (global.importPauseRequested) {
                    if (global.importCancelRequested) {
                        global.importState.status = 'cancelled';
                        addLog('🛑 Importação interrompida pelo usuário.');
                        return;
                    }
                    await new Promise(r => setTimeout(r, 500));
                }
                global.importState.status = 'running';
                addLog('▶️ Importação retomada.');
            }

            const pageGroup = [];
            for (let k = 0; k < CONCURRENCY && (pageGroupStart + k) <= batchEndPage; k++) {
                pageGroup.push(pageGroupStart + k);
            }

            addLog(`Buscando páginas ${pageGroup.join(', ')}...`);

            const promises = pageGroup.map(page =>
                axios.get(`${baseUrl}/contacts?instance=${instanceId}&page=${page}`, { headers: getHeaders(apiKey), timeout: 15000 })
                    .then(res => ({ page, data: res.data }))
                    .catch(err => {
                        addLog(`❌ Erro na página ${page}: ${err.message}`);
                        return { page, data: null, error: err.message };
                    })
            );

            const results = await Promise.all(promises);

            for (const result of results) {
                if (result.error) {
                    global.importState.report.errors.push(`Página ${result.page}: ${result.error}`);
                }
                if (!result.data || !result.data.results) continue;

                const contacts = result.data.results;
                for (const contact of contacts) {
                    global.importState.contactsProcessed++;
                    const contactTags = contact.tags || [];

                    const nome = contact.name || 'Sem Nome';
                    const telefone = contact.telephone || contact.whatsapp_id;

                    if (!telefone) continue;

                    if (contactTags.length === 0) {
                        try {
                            const delRes = await pgPool.query(`DELETE FROM contatos WHERE telefone = $1 RETURNING id`, [telefone]);
                            if (delRes.rowCount > 0) {
                                global.importState.report.deleted.push(telefone);
                                addLog(`🗑️ Contato ${telefone} removido (sem tags)`);
                            }
                        } catch (dbErr) {
                            addLog(`❌ Erro ao deletar ${telefone}: ${dbErr.message}`);
                        }
                        continue;
                    }

                    for (const t of contactTags) {
                        const tagName = typeof t === 'object' ? t.name : t;
                        if (!tagName) continue;

                        try {
                            const res = await pgPool.query(`
                                INSERT INTO contatos (nome, telefone, tag, updated_at)
                                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                                ON CONFLICT (telefone, tag)
                                DO UPDATE SET nome = EXCLUDED.nome, updated_at = CURRENT_TIMESTAMP
                                RETURNING (xmax = 0) AS inserted
                            `, [nome, telefone, tagName]);
                            
                            if (res.rows[0].inserted) {
                                global.importState.report.added.push({ telefone, tag: tagName });
                            } else {
                                global.importState.report.modified.push({ telefone, tag: tagName });
                            }
                            global.importState.contactsSaved++;
                        } catch (dbErr) {
                            addLog(`❌ Erro ao salvar ${telefone} com tag "${tagName}": ${dbErr.message}`);
                        }
                    }
                }
            }

            global.importState.currentPage = pageGroup[pageGroup.length - 1] + 1;
        }

        if (global.importState.currentPage <= global.importState.totalPages) {
            global.importState.status = 'paused_delay';
            const pauseDuration = 15 * 1000;
            global.importState.nextBatchTime = Date.now() + pauseDuration;
            addLog(`⏳ Lote ${global.importState.currentBatch} concluído. Pausa de 15 segundos antes do próximo lote...`);

            const pauseStart = Date.now();
            while (Date.now() - pauseStart < pauseDuration) {
                if (global.importCancelRequested) {
                    global.importState.status = 'cancelled';
                    addLog('🛑 Importação interrompida durante o intervalo.');
                    return;
                }
                if (global.importPauseRequested) {
                    global.importState.status = 'paused_user';
                    global.importState.nextBatchTime = null;
                    addLog('⏸️ Importação pausada durante o intervalo de segurança.');
                    while (global.importPauseRequested) {
                        if (global.importCancelRequested) {
                            global.importState.status = 'cancelled';
                            addLog('🛑 Importação interrompida pelo usuário.');
                            return;
                        }
                        await new Promise(r => setTimeout(r, 500));
                    }
                    addLog('▶️ Importação retomada. Iniciando próximo lote...');
                    break;
                }
                await new Promise(r => setTimeout(r, 1000));
            }

            global.importState.status = 'running';
            global.importState.nextBatchTime = null;
            global.importState.currentBatch++;
        }
    }

    global.importState.status = 'completed';
    addLog(`🎉 Importação finalizada! Contatos analisados: ${global.importState.contactsProcessed}. Salvos: ${global.importState.contactsSaved}`);
}

function cancelImport() {
    global.importCancelRequested = true;
    global.importPauseRequested = false;
    if (['paused_delay', 'paused_user', 'idle'].includes(global.importState.status)) {
        global.importState.status = 'cancelled';
        addLog('🛑 Importação interrompida pelo usuário.');
    }
}

function pauseImport() {
    if (['running', 'paused_delay'].includes(global.importState.status)) {
        global.importPauseRequested = true;
        addLog('⏸️ Pausa solicitada...');
    }
}

function resumeImport() {
    if (global.importState.status === 'paused_user') {
        global.importPauseRequested = false;
        addLog('▶️ Retomando importação...');
    }
}

function getStatus() {
    return {
        ...global.importState,
        nextBatchCountdown: global.importState.nextBatchTime ? Math.max(0, Math.round((global.importState.nextBatchTime - Date.now()) / 1000)) : 0
    };
}

module.exports = {
    startImportBackground,
    cancelImport,
    pauseImport,
    resumeImport,
    getStatus
};
