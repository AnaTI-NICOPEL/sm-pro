import { NextResponse } from 'next/server';
import { pgPool } from '../../../lib/db';

export async function GET() {
    try {
        const result = await pgPool.query('SELECT name FROM tags ORDER BY name ASC');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name } = body;
        
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const result = await pgPool.query('INSERT INTO tags (name) VALUES ($1) RETURNING *', [name]);
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
