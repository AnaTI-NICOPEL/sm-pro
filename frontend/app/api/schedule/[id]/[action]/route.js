import { NextResponse } from 'next/server';
import { pgPool } from '../../../../../lib/db';

export const dynamic = 'force-dynamic';




export async function POST(request, { params }) {
    const { id, action } = params;

    try {
        if (action === 'send-now') {
            await pgPool.query('UPDATE messages SET status = $1, scheduled_at = CURRENT_TIMESTAMP WHERE id = $2', ['pending', id]);
            return NextResponse.json({ success: true, message: 'Agendamento forçado para envio imediato. Será processado em instantes.' });
        }

        if (action === 'pause') {
            await pgPool.query('UPDATE messages SET status = $1 WHERE id = $2 AND status IN ($3, $4)', ['paused', id, 'pending', 'sending']);
            return NextResponse.json({ success: true });
        }

        if (action === 'resume') {
            await pgPool.query('UPDATE messages SET status = $1 WHERE id = $2 AND status = $3', ['pending', id, 'paused']);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });

    } catch (error) {
        console.error(`Error performing action ${action} on schedule ${id}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
