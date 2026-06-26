import { NextResponse } from 'next/server';
import { pgPool } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    try {
        let dateFilter = '';
        const params = [];
        if (start && end) {
            dateFilter = 'WHERE received_at >= $1 AND received_at <= $2::timestamp + interval \'1 day\'';
            params.push(start, end);
        }

        const query = `SELECT * FROM webhook_logs ${dateFilter} ORDER BY received_at DESC LIMIT 100`;
        const result = await pgPool.query(query, params);
        
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching webhook logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
