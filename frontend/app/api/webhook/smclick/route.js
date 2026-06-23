import { NextResponse } from 'next/server';
import { pgPool } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const payload = await request.json();
        const eventType = payload.event || payload.type || 'unknown';
        
        let customerPhone = null;
        let attendantName = null;
        let processingResult = 'Received';

        // Tenta extrair telefone e atendente dependendo da estrutura do webhook do SM Click
        if (payload.data) {
            customerPhone = payload.data.customer_phone || payload.data.whatsapp_id || payload.data.telephone;
            if (payload.data.attendant) {
                attendantName = payload.data.attendant.name;
            }
        }

        // Salvar log bruto
        const logRes = await pgPool.query(
            'INSERT INTO webhook_logs (event_type, payload, customer_phone, attendant_name, processing_result) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [eventType, JSON.stringify(payload), customerPhone, attendantName, processingResult]
        );
        const logId = logRes.rows[0].id;

        // Processar Lead Monitoring (Exemplo de lógica baseada em eventos chat/message)
        if (eventType === 'new_chat' || eventType === 'message_received') {
            const customerName = payload.data?.customer_name || payload.data?.name || 'Desconhecido';
            const firstMessage = payload.data?.message?.text || payload.data?.text || '';
            const attendantId = payload.data?.attendant?.id || null;
            
            // Verifica se já existe um lead pendente para este cliente
            if (customerPhone) {
                const existing = await pgPool.query('SELECT id FROM leads_monitoring WHERE customer_phone = $1 AND status = $2', [customerPhone, 'pending']);
                if (existing.rowCount === 0) {
                    await pgPool.query(
                        `INSERT INTO leads_monitoring 
                         (customer_phone, customer_name, first_message, attendant_id, attendant_name, status) 
                         VALUES ($1, $2, $3, $4, $5, 'pending')`,
                        [customerPhone, customerName, firstMessage, attendantId, attendantName]
                    );
                    processingResult = 'Lead created';
                } else {
                    processingResult = 'Lead already pending';
                }
            }
        } else if (eventType === 'message_sent' || eventType === 'attendant_replied') {
            const replyMessage = payload.data?.message?.text || payload.data?.text || '';
            const departmentId = payload.data?.department?.id || null;
            const attendantId = payload.data?.attendant?.id || null;
            const attendantNamePayload = payload.data?.attendant?.name || null;
            const mariaId = process.env.LEAD_MONITOR_ATTENDANT_ID;
            
            if (customerPhone) {
                const pending = await pgPool.query('SELECT id, created_at FROM leads_monitoring WHERE customer_phone = $1 AND status = $2 ORDER BY created_at ASC LIMIT 1', [customerPhone, 'pending']);
                
                if (pending.rowCount > 0) {
                    const lead = pending.rows[0];
                    const answeredAt = new Date();
                    const createdAt = new Date(lead.created_at);
                    const responseTime = Math.round((answeredAt - createdAt) / 1000); // em segundos
                    
                    if (attendantId === mariaId && !departmentId) {
                        // É a Maria (ID confere e departamento nulo)
                        await pgPool.query(
                            `UPDATE leads_monitoring 
                             SET answered_at = $1, response_time = $2, maria_message = $3, status = 'completed' 
                             WHERE id = $4`,
                            [answeredAt, responseTime, replyMessage, lead.id]
                        );
                        processingResult = `Maria answered in ${responseTime}s`;
                    } else if (departmentId && attendantId !== mariaId) {
                        // É um Vendedor (possui departamento e não é a Maria)
                        await pgPool.query(
                            `UPDATE leads_monitoring 
                             SET answered_at = $1, response_time = $2, attendant_id = $3, attendant_name = $4, status = 'completed' 
                             WHERE id = $5`,
                            [answeredAt, responseTime, attendantId, attendantNamePayload, lead.id]
                        );
                        processingResult = `Seller ${attendantNamePayload} answered in ${responseTime}s`;
                    } else {
                        processingResult = 'Ignored: Does not match Maria or Seller rules';
                    }
                } else {
                    processingResult = 'No pending lead found for this reply';
                }
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
