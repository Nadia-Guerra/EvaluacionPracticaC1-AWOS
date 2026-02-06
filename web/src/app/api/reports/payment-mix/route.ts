import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';

export async function GET() {
  const sql = `
    SELECT *
    FROM vw_payment_mix
    ORDER BY total_pagado DESC
  `;

  try {
    const data = await query(sql);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en payment-mix API:', error);
    return NextResponse.json(
      { error: 'Error al obtener mix de pagos' },
      { status: 500 }
    );
  }
}
