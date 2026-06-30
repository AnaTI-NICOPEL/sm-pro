import { NextResponse } from 'next/server';
import axios from 'axios';
import { pgPool } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// Simple in-memory cache for tags to prevent hitting the API for every single row
let globalTagsCache = null;
let globalTagsCacheTime = 0;

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, telephone, tag } = body;

        if (!telephone || !tag) {
            return NextResponse.json({ error: 'Telefone e tag são obrigatórios' }, { status: 400 });
        }

        // Fetch API key and Base URL
        const resSettings = await pgPool.query('SELECT key, value FROM settings');
        const config = {};
        resSettings.rows.forEach(r => config[r.key] = r.value);
        
        const baseUrl = (config.baseUrl || 'https://api.smclick.com.br').replace(/\/+$/, '');
        const apiKey = config.apiKey || process.env.SMCLICK_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key do SM Click não configurada' }, { status: 500 });
        }

        let formattedPhone = telephone.toString().replace(/\D/g, '');
        // Remove 55 se o usuário tiver preenchido sem o 55 originalmente
        if (formattedPhone.startsWith('55') && formattedPhone.length >= 12) {
            formattedPhone = formattedPhone.substring(2);
        }

        const headers = {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
        };

        // Busca a instância ativa
        let instanceId = '';
        try {
            const instRes = await axios.get(`${baseUrl}/instances`, { headers, timeout: 10000 });
            const instances = Array.isArray(instRes.data) ? instRes.data : (instRes.data.results || []);
            const active = instances.find(i => i.name && i.name.toUpperCase().includes('NICOPEL')) || instances.find(i => i.status === 'PAIRED' || i.status === 'CONNECTED') || instances[0];
            if (active) instanceId = active.id;
        } catch (e) {
            console.log('Não foi possível obter a instância, continuando sem ela...');
        }

        // 1. Get Tag ID
        let tagsList = [];
        const now = Date.now();
        if (globalTagsCache && (now - globalTagsCacheTime < 5 * 60 * 1000)) { // 5 minutes cache
            tagsList = globalTagsCache;
        } else {
            try {
                const tagUrl = instanceId ? `${baseUrl}/contacts/tag?instance=${instanceId}` : `${baseUrl}/contacts/tag`;
                const tagRes = await axios.get(tagUrl, { headers, timeout: 10000 });
                tagsList = Array.isArray(tagRes.data) ? tagRes.data : (tagRes.data.results || []);
                globalTagsCache = tagsList;
                globalTagsCacheTime = now;
            } catch (err) {
                const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
                return NextResponse.json({ error: `Erro ao buscar etiquetas no SM Click: ${errMsg}` }, { status: 502 });
            }
        }

        const targetTag = tagsList.find(t => t.name.toLowerCase() === tag.toLowerCase() || t.id === tag);
        if (!targetTag) {
            return NextResponse.json({ error: `Etiqueta "${tag}" não foi encontrada no SM Click.` }, { status: 404 });
        }
        const tagId = targetTag.id;

        // 2. Get Contact ID
        let contactId = null;
        let targetContact = null;
        try {
            // Tentamos buscar pelo telefone formatado
            const searchUrl = instanceId ? `${baseUrl}/contacts?search=${formattedPhone}&instance=${instanceId}` : `${baseUrl}/contacts?search=${formattedPhone}`;
            const contactRes = await axios.get(searchUrl, { headers, timeout: 10000 });
            const contacts = Array.isArray(contactRes.data) ? contactRes.data : (contactRes.data.results || []);
            
            // Tenta encontrar uma correspondência exata
            const targetContact = contacts.find(c => {
                const cPhone = (c.telephone || c.whatsapp_id || '').toString().replace(/\D/g, '');
                // Compara os últimos 8 ou 9 dígitos para ser mais assertivo
                return cPhone.endsWith(formattedPhone) || formattedPhone.endsWith(cPhone) || cPhone.includes(formattedPhone) || formattedPhone.includes(cPhone);
            });

            if (targetContact) {
                contactId = targetContact.id;
            }
        } catch (err) {
            const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            return NextResponse.json({ error: `Erro ao buscar o contato ${formattedPhone} no SM Click: ${errMsg}` }, { status: 502 });
        }

        if (!contactId) {
            return NextResponse.json({ error: `O contato ${formattedPhone} não foi encontrado no SM Click.` }, { status: 404 });
        }

        // 3. Link Tag to Contact
        let smClickSuccess = false;
        try {
            // URL format exactly as provided by user, optionally with instance
            const assignUrl = instanceId 
                ? `${baseUrl}/contacts/${contactId}/tag/${tagId}/?instance=${instanceId}`
                : `${baseUrl}/contacts/${contactId}/tag/${tagId}/`;
            
            await axios.post(assignUrl, {}, { headers, timeout: 10000 });
            smClickSuccess = true;
        } catch (smErr) {
            const errorDetails = smErr.response?.data ? (typeof smErr.response.data === 'object' ? JSON.stringify(smErr.response.data) : smErr.response.data) : smErr.message;
            console.error(`Erro ao vincular tag para ${telephone}:`, errorDetails);
            return NextResponse.json({ error: errorDetails }, { status: 400 });
        }

        // 4. Update local DB
        if (smClickSuccess) {
            try {
                await pgPool.query(`
                    INSERT INTO contatos (nome, telefone, tag, updated_at)
                    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                    ON CONFLICT (telefone, tag)
                    DO UPDATE SET nome = EXCLUDED.nome, updated_at = CURRENT_TIMESTAMP
                `, [name || 'Contato', formattedPhone, targetTag.name]);
            } catch (dbErr) {
                console.error(`Erro no BD local para ${telephone}:`, dbErr.message);
            }
        }

        return NextResponse.json({ 
            success: true, 
            telephone, 
            tag: targetTag.name,
            contactName: targetContact.name || name
        });
    } catch (error) {
        console.error('Erro geral no upload de tag:', error);
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}
