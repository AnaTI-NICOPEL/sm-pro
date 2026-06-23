import { NextResponse } from 'next/server';
import { pgPool } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await pgPool.query('SELECT * FROM logs_envio ORDER BY sent_at DESC');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
