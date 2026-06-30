import { NextResponse } from 'next/server';
import axios from 'axios';
import { pgPool } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, telephone, tag } = body;

        if (!telephone || !tag) {
            return NextResponse.json({ error: 'Telefone e tag são obrigatórios' }, { status: 400 });
        }

        // Busca a API key e Base URL das configurações
        const resSettings = await pgPool.query('SELECT key, value FROM settings');
        const config = {};
        resSettings.rows.forEach(r => config[r.key] = r.value);
        
        const baseUrl = config.baseUrl || 'https://api.smclick.com.br';
        const apiKey = config.apiKey || process.env.SMCLICK_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key do SM Click não configurada' }, { status: 500 });
        }

        // Formata o payload para o SM Click
        const payload = {
            name: name || '',
            telephone: telephone.toString().replace(/\D/g, ''),
            tags: [tag],
            country: 'BR'
        };

        // Envia para o SM Click
        let smClickSuccess = false;
        try {
            await axios.post(`${baseUrl}/contacts`, payload, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            smClickSuccess = true;
        } catch (smErr) {
            console.error(`Erro no SM Click para ${telephone}:`, smErr.message);
            return NextResponse.json({ error: `Erro no SM Click: ${smErr.message}` }, { status: 502 });
        }

        // Se sucesso no SM Click, salva/atualiza no banco local
        if (smClickSuccess) {
            try {
                await pgPool.query(`
                    INSERT INTO contatos (nome, telefone, tag, updated_at)
                    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                    ON CONFLICT (telefone, tag)
                    DO UPDATE SET nome = EXCLUDED.nome, updated_at = CURRENT_TIMESTAMP
                `, [payload.name, payload.telephone, tag]);
            } catch (dbErr) {
                console.error(`Erro no BD local para ${telephone}:`, dbErr.message);
                // Não falhamos a requisição se o SM Click já deu certo, mas é bom logar
            }
        }

        return NextResponse.json({ success: true, telephone, tag });
    } catch (error) {
        console.error('Erro geral no upload de tag:', error);
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}
