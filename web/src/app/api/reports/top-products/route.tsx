import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search');
  const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
  const offset = (page - 1) * limit;

  let sql = `
    SELECT *
    FROM vw_top_products_ranked
  `;

  let params: any[] = [];

  if (search) {
    sql += ` WHERE product_name ILIKE $1`;
    params.push(`%${search}%`);
    sql += ` ORDER BY ranking_revenue LIMIT $2 OFFSET $3`;
    params.push(limit, offset);
  } else {
    sql += ` ORDER BY ranking_revenue LIMIT $1 OFFSET $2`;
    params.push(limit, offset);
  }

  try {
    const data = await query(sql, params);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}
