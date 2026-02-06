import { headers } from 'next/headers';

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

async function getInventoryRisk(): Promise<InventoryRiskRow[]> {
  const headersList = await headers();
  const host = headersList.get('host');

  const res = await fetch(
    `http://${host}/api/reports/inventory-risk`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Error al obtener inventario en riesgo');
  }

  return res.json();
}

export default async function InventoryRiskPage() {
  const data = await getInventoryRisk();

  const getRiskColor = (nivel: string) => {
    switch (nivel) {
      case 'CRÍTICO':
        return 'bg-red-100 text-red-800';
      case 'ALTO':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIO':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">
        Inventario en riesgo
      </h1>

      <p className="text-gray-600 mb-6">
        Productos con stock bajo y nivel de riesgo.
      </p>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left border-b">Producto</th>
              <th className="px-4 py-2 text-left border-b">Categoría</th>
              <th className="px-4 py-2 text-right border-b">Stock</th>
              <th className="px-4 py-2 text-right border-b">Vendidos (mes)</th>
              <th className="px-4 py-2 text-right border-b">Días inv.</th>
              <th className="px-4 py-2 text-right border-b">% Riesgo</th>
              <th className="px-4 py-2 text-center border-b">Nivel</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.product_id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b font-medium">
                  {row.product_name}
                </td>
                <td className="px-4 py-2 border-b">
                  {row.category_name}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  {row.stock_actual}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  {row.unidades_vendidas_mes}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  {row.dias_inventario || 'N/A'}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  {Number(row.porcentaje_riesgo).toFixed(2)}%
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(row.nivel_riesgo)}`}>
                    {row.nivel_riesgo}
                  </span>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={7}
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