import { headers } from 'next/headers';
import Link from 'next/link';

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

type ApiResponse = {
  data: TopProductRow[];
  page: number;
  limit: number;
  search: string | null;
};

async function getTopProducts(
  search?: string,
  page = 1,
  limit = 10
): Promise<ApiResponse> {
  const headersList = await headers();
  const host = headersList.get('host');

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const url = `http://${host}/api/reports/top-products?${params.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Error al obtener productos');
  }

  return res.json();
}

export default async function TopProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; limit?: string }>; // ← Promise aquí
}) {
  const params = await searchParams; // ← await aquí
  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '10');
  const response = await getTopProducts(params.search, page, limit);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Top Productos
        </h1>
        <p className="text-gray-600 mb-6">
          Ranking de productos por revenue y unidades vendidas
        </p>

        <form method="get" className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 mb-6 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-blue-800 mb-1">
              Buscar producto
            </label>
            <input
              type="text"
              name="search"
              defaultValue={params.search}
              placeholder="Ej: Café, Concha..."
              className="w-full border border-blue-200 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              Buscar
            </button>
            <Link
              href="/reports/top-products"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition"
            >
              Limpiar
            </Link>
          </div>
        </form>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
          <table className="min-w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold uppercase text-sm">Ranking</th>
                <th className="px-6 py-4 text-left font-semibold uppercase text-sm">Producto</th>
                <th className="px-6 py-4 text-left font-semibold uppercase text-sm">Categoría</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Unidades</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Revenue</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Precio Prom.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {response.data.map((row) => (
                <tr key={row.product_id} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4 text-blue-600 font-bold">
                    #{row.ranking_revenue}
                  </td>
                  <td className="px-6 py-4 text-blue-900 font-medium">
                    {row.product_name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {row.category_name}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    {row.unidades_vendidas}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-700">
                    ${Number(row.revenue_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    ${Number(row.precio_promedio).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {response.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                    No se encontraron productos con ese nombre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center items-center gap-4">
          {page > 1 && (
            <Link
              href={`?search=${params.search || ''}&page=${page - 1}&limit=${limit}`}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition"
            >
              ← Anterior
            </Link>
          )}
          
          <span className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-sm">
            Página {page}
          </span>
          
          <Link
            href={`?search=${params.search || ''}&page=${page + 1}&limit=${limit}`}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition"
          >
            Siguiente →
          </Link>
        </div>
      </div>
    </div>
  );
}