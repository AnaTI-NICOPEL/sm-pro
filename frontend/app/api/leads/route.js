import { NextResponse } from 'next/server';
import { pgPool } from '../../../lib/db';

export async function GET() {
    try {
        const result = await pgPool.query('SELECT * FROM leads_monitoring ORDER BY created_at DESC');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
