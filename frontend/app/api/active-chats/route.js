import { NextResponse } from 'next/server';
import axios from 'axios';
import { pgPool } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        // Permite passar instancia pela query, ou usa a padrao informada
        const instance = searchParams.get('instance') || 'ef046c24-2508-4565-b36d-a88f0d0a3749';

        const resSettings = await pgPool.query('SELECT key, value FROM settings');
        const config = {};
        resSettings.rows.forEach(r => config[r.key] = r.value);
        
        // Forçando o uso exato da chave e rota fornecida pelo usuario
        const apiKey = '59732a5d-d614-4b15-84fe-28f24e06936e';
        const chatsUrl = 'https://api.smclick.com.br/attendances/chats';

        const headers = {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
        };

        const chatsRes = await axios.get(chatsUrl, { headers, timeout: 60000 }); // increased to 60s
        
        // Pode ser um array direto ou um objeto com .results
        let chats = Array.isArray(chatsRes.data) ? chatsRes.data : (chatsRes.data.results || []);

        return NextResponse.json({ success: true, chats });
    } catch (error) {
        console.error('Erro ao buscar chats ativos:', error.response?.data || error.message);
        
        const isTimeout = error.code === 'ECONNABORTED';
        const status = isTimeout ? 504 : (error.response?.status || 500);
        const details = isTimeout ? 'A requisição para o SM Click demorou mais que 60 segundos (Timeout).' : (error.response?.data || error.message);

        return NextResponse.json({ 
            error: isTimeout ? 'Tempo esgotado' : 'Erro ao buscar chats no SM Click', 
            details: details
        }, { status });
    }
}
