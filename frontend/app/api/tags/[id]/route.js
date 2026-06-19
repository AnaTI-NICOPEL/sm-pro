import { NextResponse } from 'next/server';
import { pgPool } from '../../../../lib/db';

export async function PUT(request, { params }) {
    const { id: oldName } = params;
    try {
        const body = await request.json();
        const { newName } = body;
        
        if (!newName) return NextResponse.json({ error: 'newName is required' }, { status: 400 });

        await pgPool.query('UPDATE tags SET name = $1 WHERE name = $2', [newName, oldName]);
        // Also update in contatos table
        await pgPool.query('UPDATE contatos SET tag = $1 WHERE tag = $2', [newName, oldName]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating tag:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id: name } = params;
    try {
        await pgPool.query('DELETE FROM tags WHERE name = $1', [name]);
        // Also remove tag from contatos? Or leave it?
        await pgPool.query('DELETE FROM contatos WHERE tag = $1', [name]);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
