import { NextResponse } from 'next/server';
import { pgPool } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
    const { id } = params;
    try {
        const body = await request.json();
        const { name, attendant_id, department_id, photo_base64 } = body;

        if (!name || !attendant_id || !department_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await pgPool.query(
            'UPDATE sellers SET name = $1, attendant_id = $2, department_id = $3, photo_base64 = $4 WHERE id = $5 RETURNING *',
            [name, attendant_id, department_id, photo_base64 || null, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Este ID de Atendente já está cadastrado.' }, { status: 400 });
        }
        console.error('Error updating seller:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        await pgPool.query('DELETE FROM sellers WHERE id = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting seller:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
