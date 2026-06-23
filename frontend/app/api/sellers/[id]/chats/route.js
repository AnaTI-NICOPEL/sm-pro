import { NextResponse } from 'next/server';
import { pgPool } from '../../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    const sellerId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const offset = (page - 1) * limit;

    try {
        const sellerRes = await pgPool.query('SELECT attendant_id FROM sellers WHERE id = $1', [sellerId]);
        if (sellerRes.rowCount === 0) {
            return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
        }
        
        const attendantId = sellerRes.rows[0].attendant_id;

        let dateFilter = '';
        let queryParams = [];
        let countParams = [];
        let limitIndex, offsetIndex;
        
        if (start && end) {
            dateFilter = 'AND created_at >= $2 AND created_at <= $3::timestamp + interval \'1 day\'';
            queryParams = [attendantId, start, end, limit, offset];
            countParams = [attendantId, start, end];
            limitIndex = '$4';
            offsetIndex = '$5';
        } else {
            queryParams = [attendantId, limit, offset];
            countParams = [attendantId];
            limitIndex = '$2';
            offsetIndex = '$3';
        }

        const query = `
            SELECT id, customer_phone, customer_name, status, created_at, answered_at, response_time, first_message, maria_message 
            FROM leads_monitoring 
            WHERE attendant_id = $1 ${dateFilter}
            ORDER BY created_at DESC 
            LIMIT ${limitIndex} OFFSET ${offsetIndex}
        `;
        const result = await pgPool.query(query, queryParams);

        const countQuery = `SELECT COUNT(*) FROM leads_monitoring WHERE attendant_id = $1 ${dateFilter}`;
        const countResult = await pgPool.query(countQuery, countParams);
        
        const totalRecords = parseInt(countResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalRecords / limit);

        return NextResponse.json({
            chats: result.rows,
            page,
            totalPages,
            totalRecords
        });
    } catch (error) {
        console.error('Error fetching seller chats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
