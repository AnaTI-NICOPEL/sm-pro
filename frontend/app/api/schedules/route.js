import { NextResponse } from 'next/server';
import { pgPool } from '../../../lib/db';

export async function GET() {
    try {
        const result = await pgPool.query('SELECT * FROM messages ORDER BY created_at DESC');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { tags, content, scheduledAt, mediaName, mediaBase64 } = body;

        if (!tags || tags.length === 0) {
            return NextResponse.json({ error: 'Etiqueta não fornecida' }, { status: 400 });
        }
        if (!content && !mediaBase64) {
            return NextResponse.json({ error: 'Conteúdo vazio' }, { status: 400 });
        }
        if (!scheduledAt) {
            return NextResponse.json({ error: 'Data de disparo não fornecida' }, { status: 400 });
        }

        const tagString = tags.join(',');
        
        const result = await pgPool.query(
            `INSERT INTO messages (tag, content, scheduled_at, media_name, media_base64, status) 
             VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
            [tagString, content, new Date(scheduledAt), mediaName || null, mediaBase64 || null]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Error creating schedule:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
