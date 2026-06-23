import { NextResponse } from 'next/server';
import { pgPool } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
    const { id } = params;

    try {
        await pgPool.query('DELETE FROM messages WHERE id = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
