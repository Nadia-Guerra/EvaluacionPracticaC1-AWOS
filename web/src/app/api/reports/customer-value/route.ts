import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { z } from 'zod';

interface CustomerValue {
  customer_id: number;
  customer_name: string;
  customer_email: string;
  num_ordenes: string;
  total_gastado: string;
  gasto_promedio: string;
  ultima_compra: string;
  estado_cliente: string;
}

const CustomerValueSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const validation = CustomerValueSchema.safeParse({ page, limit });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: validation.error.issues},
        { status: 400 }
      );
    }

    const { page: validPage, limit: validLimit } = validation.data;
    const offset = (validPage - 1) * validLimit;

const [countResult, data] = await Promise.all([
  query('SELECT COUNT(*) as total FROM vw_customer_value'),
  query(
    'SELECT * FROM vw_customer_value ORDER BY total_gastado DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  ),
]);


    const total = parseInt(countResult[0]?.total || '0');

    return NextResponse.json({
      data,
      total,
      page: validPage,
      limit: validLimit,
      totalPages: Math.ceil(total / validLimit),
    });
  } catch (error) {
    console.error('Error en customer-value:', error);
    return NextResponse.json(
      { error: 'Error al obtener valor de clientes' },
      { status: 500 }
    );
  }
}