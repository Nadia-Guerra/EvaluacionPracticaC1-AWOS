
//importaciones necesarias
import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { z } from 'zod';

//schema para valifacion de zod
const SalesDailySchema = z.object({
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const validation = SalesDailySchema.safeParse({ //valida q se cumpla el zod
      date_from: searchParams.get('date_from') || null,
      date_to: searchParams.get('date_to') || null,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos. Formato de fecha: YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const { date_from, date_to } = validation.data;

    let sql = 'SELECT * FROM vw_sales_daily WHERE 1=1';
    const params: string[] = [];

    if (date_from) {
      params.push(date_from);
      sql += ` AND fecha >= $${params.length}`;
    }

    if (date_to) {
      params.push(date_to);
      sql += ` AND fecha <= $${params.length}`;
    }

    sql += ' ORDER BY fecha DESC';

    const data = await query(sql, params);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en sales-daily:', error);
    return NextResponse.json(
      { error: 'Error al obtener ventas diarias' },
      { status: 500 }
    );
  }
}