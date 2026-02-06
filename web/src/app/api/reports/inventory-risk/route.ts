import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category_id');

  let sql = `
    SELECT *
    FROM vw_inventory_risk
    WHERE 1=1
  `;
  const params: any[] = [];

  if (categoryId) {
    params.push(parseInt(categoryId));
    sql += ` AND category_id = $${params.length}`;
  }

  sql += ` ORDER BY porcentaje_riesgo DESC NULLS LAST`;

  try {
    const data = await query(sql, params);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener inventario en riesgo' },
      { status: 500 }
    );
  }
}