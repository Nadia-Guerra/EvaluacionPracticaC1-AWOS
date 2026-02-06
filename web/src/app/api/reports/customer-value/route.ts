import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
  const offset = (page - 1) * limit;

  const sql = `
    SELECT *
    FROM vw_customer_value
    ORDER BY total_gastado DESC
    LIMIT $1 OFFSET $2
  `;

  try {
    const data = await query(sql, [limit, offset]);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener valor de clientes' },
      { status: 500 }
    );
  }
}