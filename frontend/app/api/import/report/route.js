import { NextResponse } from 'next/server';
import { getStatus } from '../../../../lib/importer';

export const dynamic = 'force-dynamic';

export async function GET() {
    const status = getStatus();
    if (!status || !status.report) {
        return NextResponse.json({ error: 'Nenhum relatório disponível' }, { status: 404 });
    }

    const { added, modified, deleted, errors } = status.report;
    
    let reportText = `Relatório de Importação\nData: ${new Date().toLocaleString()}\n`;
    reportText += `===================================\n\n`;
    
    reportText += `Páginas com Erro (${errors.length}):\n`;
    errors.forEach(e => reportText += `- ${e}\n`);
    reportText += `\n`;

    reportText += `Contatos Deletados (sem tag) (${deleted.length}):\n`;
    deleted.forEach(d => reportText += `- ${d}\n`);
    reportText += `\n`;

    reportText += `Contatos Adicionados (${added.length}):\n`;
    added.forEach(a => reportText += `- ${a.telefone} (Tag: ${a.tag})\n`);
    reportText += `\n`;

    reportText += `Contatos Modificados (${modified.length}):\n`;
    modified.forEach(m => reportText += `- ${m.telefone} (Tag: ${m.tag})\n`);
    reportText += `\n`;

    return new NextResponse(reportText, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': 'attachment; filename="relatorio_importacao.txt"'
        }
    });
}
