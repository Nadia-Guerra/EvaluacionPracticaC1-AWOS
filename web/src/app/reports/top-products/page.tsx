import { headers } from 'next/headers';

type TopProductRow = {
  product_id: number;
  product_name: string;
  category_name: string;
  unidades_vendidas: number;
  revenue_total: string;
  precio_promedio: string;
  ranking_revenue: number;
  ranking_unidades: number;
};

async function getTopProducts(): Promise<TopProductRow[]> {
  const headersList = await headers();
  const host = headersList.get('host');

  const res = await fetch(
    `http://${host}/api/reports/top-products`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Error al obtener productos');
  }

  return res.json();
}

export default async function TopProductsPage() {
  const data = await getTopProducts();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">
        Top productos
      </h1>

      <p className="text-gray-600 mb-6">
        Ranking de productos por revenue y unidades vendidas.
      </p>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left border-b">Ranking</th>
              <th className="px-4 py-2 text-left border-b">Producto</th>
              <th className="px-4 py-2 text-left border-b">Categoría</th>
              <th className="px-4 py-2 text-right border-b">Unidades</th>
              <th className="px-4 py-2 text-right border-b">Revenue</th>
              <th className="px-4 py-2 text-right border-b">Precio prom.</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.product_id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">
                  #{row.ranking_revenue}
                </td>
                <td className="px-4 py-2 border-b font-medium">
                  {row.product_name}
                </td>
                <td className="px-4 py-2 border-b">
                  {row.category_name}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  {row.unidades_vendidas}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  ${Number(row.revenue_total).toFixed(2)}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  ${Number(row.precio_promedio).toFixed(2)}
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No hay datos para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}