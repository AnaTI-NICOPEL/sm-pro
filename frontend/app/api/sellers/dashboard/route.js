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
            dateFilter = 'AND l.created_at >= $1 AND l.created_at <= $2::timestamp + interval \'1 day\'';
            params.push(start, end);
        }

        const query = `
            SELECT 
                s.id, 
                s.name, 
                s.photo_base64,
                COUNT(l.id) as total_chats,
                COUNT(l.answered_at) as answered_chats,
                AVG(l.response_time) as avg_response_time
            FROM sellers s
            LEFT JOIN leads_monitoring l ON s.name = l.attendant_name ${dateFilter}
            GROUP BY s.id, s.name, s.photo_base64
            ORDER BY avg_response_time ASC NULLS LAST
        `;

        const result = await pgPool.query(query, params);
        
        // Convert avg_response_time to number
        const mapped = result.rows.map(r => ({
            ...r,
            total_chats: parseInt(r.total_chats, 10),
            answered_chats: parseInt(r.answered_chats, 10),
            avg_response_time: r.avg_response_time ? parseFloat(r.avg_response_time) : null
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching sellers dashboard:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
