import { NextResponse } from 'next/server';
import { pgPool } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '100');
        const status = searchParams.get('status') || 'all';
        const search = searchParams.get('search') || '';

        const offset = (page - 1) * limit;
        
        let conditions = [];
        let values = [];
        let valueCount = 1;

        if (status !== 'all') {
            conditions.push(`status = $${valueCount}`);
            values.push(status);
            valueCount++;
        }

        if (search) {
            conditions.push(`telefone ILIKE $${valueCount}`);
            values.push(`%${search}%`);
            valueCount++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countQuery = `SELECT COUNT(*) FROM logs_envio ${whereClause}`;
        const countResult = await pgPool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit) || 1;

        const dataQuery = `SELECT * FROM logs_envio ${whereClause} ORDER BY sent_at DESC LIMIT $${valueCount} OFFSET $${valueCount + 1}`;
        const dataResult = await pgPool.query(dataQuery, [...values, limit, offset]);

        const statsQuery = `SELECT status, COUNT(*) FROM logs_envio GROUP BY status`;
        const statsResult = await pgPool.query(statsQuery);
        let totalSuccess = 0;
        let totalFailed = 0;
        statsResult.rows.forEach(row => {
            if (row.status === 'success') totalSuccess = parseInt(row.count);
            if (row.status === 'failed') totalFailed = parseInt(row.count);
        });

        return NextResponse.json({
            logs: dataResult.rows,
            total,
            totalPages,
            currentPage: page,
            limit,
            totalSuccess,
            totalFailed
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
