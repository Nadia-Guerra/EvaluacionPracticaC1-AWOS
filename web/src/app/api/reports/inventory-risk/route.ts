import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { z } from 'zod';

const ALLOWED_CATEGORIES = [1, 2, 3] as const;

const InventoryRiskSchema = z.object({
  category_id: z.enum(['1', '2', '3']).optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const validation = InventoryRiskSchema.safeParse({
      category_id: searchParams.get('category_id') || null,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Categoría inválida. Valores permitidos: 1, 2, 3' },
        { status: 400 }
      );
    }

    const { category_id } = validation.data;

    let sql = 'SELECT * FROM vw_inventory_risk WHERE 1=1';
    const params: number[] = [];

    if (category_id) {
      const categoryIdNum = parseInt(category_id);
      
      if (!ALLOWED_CATEGORIES.includes(categoryIdNum as any)) {
        return NextResponse.json(
          { error: 'Categoría no permitida' },
          { status: 400 }
        );
      }

      params.push(categoryIdNum);
      sql += ` AND category_id = $${params.length}`;
    }

    sql += ' ORDER BY porcentaje_riesgo DESC NULLS LAST';

    const data = await query(sql, params);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en inventory-risk:', error);
    return NextResponse.json(
      { error: 'Error al obtener inventario en riesgo' },
      { status: 500 }
    );
  }
}