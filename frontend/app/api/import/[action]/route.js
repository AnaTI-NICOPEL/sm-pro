import { NextResponse } from 'next/server';
import { getStatus, startImportBackground, pauseImport, resumeImport, cancelImport } from '../../../../lib/importer';

export async function GET(request) {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/status')) {
        return NextResponse.json(getStatus());
    }
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

export async function POST(request) {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/start')) {
        startImportBackground();
        return NextResponse.json({ success: true });
    }
    if (url.pathname.endsWith('/pause')) {
        pauseImport();
        return NextResponse.json({ success: true });
    }
    if (url.pathname.endsWith('/resume')) {
        resumeImport();
        return NextResponse.json({ success: true });
    }
    if (url.pathname.endsWith('/cancel')) {
        cancelImport();
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}
