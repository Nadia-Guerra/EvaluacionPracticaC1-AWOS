import { headers } from 'next/headers';
import Link from 'next/link';

type InventoryRiskRow = {
  product_id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  stock_actual: number;
  unidades_vendidas_mes: number;
  dias_inventario: string | null;
  porcentaje_riesgo: string;
  nivel_riesgo: string;
};

async function getInventoryRisk(categoryId?: string): Promise<InventoryRiskRow[]> {
  const headersList = await headers();
  const host = headersList.get('host');

  let url = `http://${host}/api/reports/inventory-risk`;
  if (categoryId) url += `?category_id=${categoryId}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Error al obtener inventario en riesgo');
  }

  return res.json();
}

export default async function InventoryRiskPage({
  searchParams,
}: {
  searchParams: Promise<{ category_id?: string }>; // ← Promise aquí
}) {
  const params = await searchParams; // ← await aquí
  const data = await getInventoryRisk(params.category_id);

  const getRiskColor = (nivel: string) => {
    switch (nivel) {
      case 'CRÍTICO': return 'bg-red-100 text-red-800';
      case 'ALTO': return 'bg-orange-100 text-orange-800';
      case 'MEDIO': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Inventario en Riesgo
        </h1>
        <p className="text-gray-600 mb-6">
          Productos con stock bajo y nivel de riesgo
        </p>

        <form method="get" className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 mb-6 flex gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">
              Categoría
            </label>
            <select
              name="category_id"
              defaultValue={params.category_id || ''}
              className="border border-blue-200 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="1">Bebidas</option>
              <option value="2">Panadería</option>
              <option value="3">Snacks</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              Filtrar
            </button>
            <Link
              href="/reports/inventory-risk"
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
                <th className="px-6 py-4 text-left font-semibold uppercase text-sm">Producto</th>
                <th className="px-6 py-4 text-left font-semibold uppercase text-sm">Categoría</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Stock</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Vendidos</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Días Inv.</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">% Riesgo</th>
                <th className="px-6 py-4 text-center font-semibold uppercase text-sm">Nivel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {data.map((row) => (
                <tr key={row.product_id} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4 text-blue-900 font-medium">{row.product_name}</td>
                  <td className="px-6 py-4 text-gray-600">{row.category_name}</td>
                  <td className="px-6 py-4 text-right">{row.stock_actual}</td>
                  <td className="px-6 py-4 text-right">{row.unidades_vendidas_mes}</td>
                  <td className="px-6 py-4 text-right">{row.dias_inventario || 'N/A'}</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-700">{Number(row.porcentaje_riesgo).toFixed(2)}%</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(row.nivel_riesgo)}`}>
                      {row.nivel_riesgo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}