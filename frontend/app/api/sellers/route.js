import { NextResponse } from 'next/server';
import { pgPool } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await pgPool.query('SELECT id, name, attendant_id, photo_base64 FROM sellers ORDER BY name ASC');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching sellers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, attendant_id, department_id, photo_base64 } = body;

        if (!name || !attendant_id || !department_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await pgPool.query(
            'INSERT INTO sellers (name, attendant_id, photo_base64) VALUES ($1, $2, $3) RETURNING *',
            [name, attendant_id, photo_base64 || null]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        if (error.code === '23505') {
            // 23505 = unique_violation
            return NextResponse.json({ error: 'Este ID de Atendente já está cadastrado.' }, { status: 400 });
        }
        console.error('Error creating seller:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
