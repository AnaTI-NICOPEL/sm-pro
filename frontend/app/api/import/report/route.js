import { NextResponse } from 'next/server';
import { getStatus } from '../../../../lib/importer';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET() {
    const status = getStatus();
    if (!status || !status.report) {
        return NextResponse.json({ error: 'Nenhum relatório disponível' }, { status: 404 });
    }

    const { added, modified, deleted, errors } = status.report;
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Adicionados sheet
    const wsAdded = XLSX.utils.json_to_sheet(added.length > 0 ? added : [{ Mensagem: 'Nenhum contato adicionado' }]);
    XLSX.utils.book_append_sheet(wb, wsAdded, "Adicionados");

    // Modificados sheet
    const wsModified = XLSX.utils.json_to_sheet(modified.length > 0 ? modified : [{ Mensagem: 'Nenhum contato modificado' }]);
    XLSX.utils.book_append_sheet(wb, wsModified, "Modificados");

    // Deletados sheet
    const deletedFormatted = deleted.map(d => ({ Telefone: d }));
    const wsDeleted = XLSX.utils.json_to_sheet(deletedFormatted.length > 0 ? deletedFormatted : [{ Mensagem: 'Nenhum contato deletado' }]);
    XLSX.utils.book_append_sheet(wb, wsDeleted, "Deletados");

    // Erros sheet
    const errorsFormatted = errors.map(e => ({ Erro: e }));
    const wsErrors = XLSX.utils.json_to_sheet(errorsFormatted.length > 0 ? errorsFormatted : [{ Mensagem: 'Nenhum erro registrado' }]);
    XLSX.utils.book_append_sheet(wb, wsErrors, "Erros");

    // Convert to buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="relatorio_importacao.xlsx"'
        }
    });
}
