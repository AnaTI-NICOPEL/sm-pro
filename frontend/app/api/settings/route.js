import { NextResponse } from 'next/server';
import { pgPool } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await pgPool.query('SELECT key, value FROM settings');
        const settings = {};
        result.rows.forEach(r => settings[r.key] = r.value);
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { apiKey, baseUrl } = body;
        
        const upsertQuery = `
            INSERT INTO settings (key, value) VALUES ($1, $2)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `;

        if (apiKey !== undefined) await pgPool.query(upsertQuery, ['apiKey', apiKey]);
        if (baseUrl !== undefined) await pgPool.query(upsertQuery, ['baseUrl', baseUrl]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
