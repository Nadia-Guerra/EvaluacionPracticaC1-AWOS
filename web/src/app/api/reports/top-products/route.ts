import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { z } from 'zod';

const TopProductsSchema = z.object({
  search: z.string().max(100).optional(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(50),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const searchTerm = searchParams.get('search') || undefined;

    const validation = TopProductsSchema.safeParse({
      search: searchTerm,
      page,
      limit,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { search, page: validPage, limit: validLimit } = validation.data;
    const offset = (validPage - 1) * validLimit;

    let sql = 'SELECT * FROM vw_top_products_ranked WHERE 1=1';
    const params: any[] = [];

    if (search) {
      const sanitizedSearch = search.replace(/[^\w\s]/gi, '');
      params.push(`%${sanitizedSearch}%`);
      sql += ` AND product_name ILIKE $${params.length}`;
    }

    sql += ' ORDER BY ranking_revenue';
    
    params.push(validLimit, offset);
    sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const data = await query(sql, params);

    return NextResponse.json({
      data,
      page: validPage,
      limit: validLimit,
      search: search || null,
    });
  } catch (error) {
    console.error('Error en top-products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}