import { NextResponse } from 'next/server';
import { pgPool } from '../../../../lib/db';
import { calculateBusinessSeconds } from '../../../../lib/businessHours';

export const dynamic = 'force-dynamic';


export async function POST(request) {
    try {
        const payload = await request.json();
        const eventType = payload.event || payload.type || 'unknown';
        
        let customerPhone = null;
        let customerName = 'Desconhecido';
        let attendantName = null;
        let attendantId = null;
        let messageText = '';
        let departmentId = null;
        let isFromMe = false;
        let processingResult = 'Received';

        // 1. Extração Inteligente: Tenta ler da nova estrutura "infos", ou fallback para "data" / "raiz"
        if (payload.infos) {
            const chatInfo = payload.infos.chat || {};
            const messageInfo = payload.infos.message || {};
            const lastMessageInfo = chatInfo.last_message || {};
            const contactInfo = chatInfo.contact || {};

            customerPhone = contactInfo.telephone || null;
            customerName = contactInfo.name || 'Desconhecido';
            departmentId = chatInfo.department?.id || null;

            if (eventType === 'new-chat-message') {
                messageText = messageInfo.content?.text || '';
                attendantId = messageInfo.sent_by?.id || null;
                attendantName = messageInfo.sent_by?.name || null;
                isFromMe = messageInfo.from_me === true;
            } else {
                messageText = lastMessageInfo.content?.text || '';
                attendantId = lastMessageInfo.sent_by?.id || null;
                attendantName = lastMessageInfo.sent_by?.name || null;
                isFromMe = lastMessageInfo.from_me === true;
            }
        } else if (payload.data) {
            // Fallback para formato antigo (data)
            customerPhone = payload.data.customer_phone || payload.data.whatsapp_id || payload.data.telephone;
            customerName = payload.data.customer_name || payload.data.name || 'Desconhecido';
            attendantName = payload.data.attendant?.name || null;
            attendantId = payload.data.attendant?.id || null;
            messageText = payload.data.message?.text || payload.data.text || '';
            departmentId = payload.data.department?.id || null;
            isFromMe = payload.data.fromMe === true;
        } else {
            // Fallback para formato antigo (raiz)
            customerPhone = payload.phone || payload.to || payload.whatsapp_id || payload.customer_phone;
            customerName = payload.name || payload.customer_name || 'Desconhecido';
            attendantName = payload.attendant?.name || null;
            attendantId = payload.attendant?.id || null;
            messageText = payload.text || payload.message?.text || '';
            departmentId = payload.department?.id || null;
            isFromMe = payload.fromMe === true;
        }

        // Salvar log bruto
        const logRes = await pgPool.query(
            'INSERT INTO webhook_logs (event_type, payload, customer_phone, attendant_name, processing_result) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [eventType, JSON.stringify(payload), customerPhone, attendantName, processingResult]
        );
        const logId = logRes.rows[0].id;

        const isNewChatEvent = eventType === 'new_chat' || eventType === 'new-chat' || eventType === 'chat-started' || eventType === 'message_received' || (eventType === 'new-chat-message' && !isFromMe);
        const isReplyEvent = eventType === 'message_sent' || eventType === 'message-sent' || eventType === 'attendant_replied' || (eventType === 'new-chat-message' && isFromMe);

        // Processar Lead Monitoring
        if (isNewChatEvent) {
            // Verifica se já existe um lead pendente para este cliente
            if (customerPhone) {
                const existing = await pgPool.query('SELECT id FROM leads_monitoring WHERE customer_phone = $1 AND status = $2', [customerPhone, 'pending']);
                if (existing.rowCount === 0) {
                    await pgPool.query(
                        `INSERT INTO leads_monitoring 
                         (customer_phone, customer_name, first_message, attendant_id, attendant_name, status) 
                         VALUES ($1, $2, $3, $4, $5, 'pending')`,
                        [customerPhone, customerName, messageText, attendantId, attendantName]
                    );
                    processingResult = 'Lead created';
                } else {
                    processingResult = 'Lead already pending';
                }
            } else {
                processingResult = 'Ignored: No customer phone found';
            }
        } else if (isReplyEvent) {
            const mariaId = process.env.LEAD_MONITOR_ATTENDANT_ID;
            
            if (customerPhone) {
                const pending = await pgPool.query('SELECT id, created_at FROM leads_monitoring WHERE customer_phone = $1 AND status = $2 ORDER BY created_at ASC LIMIT 1', [customerPhone, 'pending']);
                
                if (pending.rowCount > 0) {
                    const lead = pending.rows[0];
                    const answeredAt = new Date();
                    const createdAt = new Date(lead.created_at);
                    const responseTime = calculateBusinessSeconds(createdAt, answeredAt); // em segundos de horário comercial
                    
                    if (attendantId === mariaId && !departmentId) {
                        // É a Maria (ID confere e departamento nulo)
                        await pgPool.query(
                            `UPDATE leads_monitoring 
                             SET answered_at = $1, response_time = $2, maria_message = $3, status = 'completed' 
                             WHERE id = $4`,
                            [answeredAt, responseTime, messageText, lead.id]
                        );
                        processingResult = `Maria answered in ${responseTime}s`;
                    } else if (attendantId && attendantId !== mariaId) {
                        // É um Vendedor (não é a Maria e possui um attendantId)
                        await pgPool.query(
                            `UPDATE leads_monitoring 
                             SET answered_at = $1, response_time = $2, attendant_id = $3, attendant_name = $4, status = 'completed' 
                             WHERE id = $5`,
                            [answeredAt, responseTime, attendantId, attendantName, lead.id]
                        );
                        processingResult = `Seller ${attendantName} answered in ${responseTime}s`;
                    } else {
                        processingResult = 'Ignored: Does not match Maria or Seller rules';
                    }
                } else {
                    processingResult = 'No pending lead found for this reply';
                }
            } else {
                processingResult = 'Ignored: No customer phone found for reply';
            }
        }

        // Atualizar resultado do processamento no log
        await pgPool.query('UPDATE webhook_logs SET processing_result = $1 WHERE id = $2', [processingResult, logId]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
