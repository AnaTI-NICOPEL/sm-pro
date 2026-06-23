import { NextResponse } from 'next/server';
import { pgPool } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await pgPool.query('SELECT * FROM webhook_logs ORDER BY received_at DESC LIMIT 100');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching webhook logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
