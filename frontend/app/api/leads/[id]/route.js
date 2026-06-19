import { NextResponse } from 'next/server';
import { pgPool } from '../../../../lib/db';

export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        await pgPool.query('DELETE FROM leads_monitoring WHERE id = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting lead:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
