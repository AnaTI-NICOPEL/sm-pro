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
        
        const baseUrl = (config.baseUrl || 'https://api.smclick.com.br').replace(/\/+$/, '');
        // O usuario passou uma chave especifica no curl, usamos do banco preferencialmente,
        // mas faremos fallback para a chave caso precise
        const apiKey = config.apiKey || process.env.SMCLICK_API_KEY || '7597dbb1-9a56-4cd8-b111-a35bfc8def55';

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key do SM Click não configurada' }, { status: 500 });
        }

        const headers = {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
        };

        const chatsUrl = `${baseUrl}/attendances/chats?instance=${instance}`;
        const chatsRes = await axios.get(chatsUrl, { headers, timeout: 15000 });
        
        // Pode ser um array direto ou um objeto com .results
        const chats = Array.isArray(chatsRes.data) ? chatsRes.data : (chatsRes.data.results || []);

        return NextResponse.json({ success: true, chats });
    } catch (error) {
        console.error('Erro ao buscar chats ativos:', error.response?.data || error.message);
        return NextResponse.json({ 
            error: 'Erro ao buscar chats no SM Click', 
            details: error.response?.data || error.message 
        }, { status: 500 });
    }
}
