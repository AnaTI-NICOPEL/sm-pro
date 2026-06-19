import { NextResponse } from 'next/server';
import { pgPool } from '../../../../../lib/db';

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
        const queryParams = [attendantId, limit, offset];
        
        if (start && end) {
            dateFilter = 'AND created_at >= $4 AND created_at <= $5::timestamp + interval \'1 day\'';
            queryParams.push(start, end);
        }

        const query = `
            SELECT id, customer_phone, customer_name, status, created_at, answered_at, response_time, first_message, maria_message 
            FROM leads_monitoring 
            WHERE attendant_id = $1 ${dateFilter}
            ORDER BY created_at DESC 
            LIMIT ${limit} OFFSET ${offset}
        `;
        const result = await pgPool.query(query, queryParams);

        const countQuery = `SELECT COUNT(*) FROM leads_monitoring WHERE attendant_id = $1 ${dateFilter}`;
        const countParams = start && end ? [attendantId, start, end] : [attendantId];
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
