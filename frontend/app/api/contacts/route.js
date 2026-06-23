import { NextResponse } from 'next/server';
import { pgPool } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const tagsParam = searchParams.get('tags');

    try {
        if (!tagsParam) {
            return NextResponse.json([]);
        }
        const tagsArray = tagsParam.split(',').map(t => t.trim());
        const result = await pgPool.query(
            'SELECT DISTINCT nome, telefone FROM contatos WHERE tag = ANY($1) ORDER BY nome ASC',
            [tagsArray]
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
