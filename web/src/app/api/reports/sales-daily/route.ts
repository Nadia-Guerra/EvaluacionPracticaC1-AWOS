import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  let sql = `
    SELECT *
    FROM vw_sales_daily
  `;
  const params: any[] = [];

  if (start && end) {
    sql += ` WHERE fecha BETWEEN $1 AND $2`;
    params.push(start, end);
  }

  sql += ` ORDER BY fecha DESC`;

  try {
    const data = await query(sql,params);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener ventas diarias' },
      { status: 500 }
    );
  }
}
