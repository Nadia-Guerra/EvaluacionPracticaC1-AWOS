import { headers } from 'next/headers';
import Link from 'next/link';

type CustomerValueRow = {
  customer_id: number;
  customer_name: string;
  customer_email: string;
  num_ordenes: number;
  total_gastado: string;
  gasto_promedio: string;
  ultima_compra: string;
  estado_cliente: string;
};

type ApiResponse = {
  data: CustomerValueRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function getCustomerValue(page = 1, limit = 10): Promise<ApiResponse> {
  const headersList = await headers();
  const host = headersList.get('host');

  const url = `http://${host}/api/reports/customer-value?page=${page}&limit=${limit}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Error al obtener valor de clientes');
  }

  return res.json();
}

export default async function CustomerValuePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>; // ← Promise aquí
}) {
  const params = await searchParams; // ← await aquí
  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '10');
  const response = await getCustomerValue(page, limit);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800';
      case 'FRECUENTE':
        return 'bg-blue-100 text-blue-800';
      case 'INACTIVO':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Valor de Clientes
        </h1>
        <p className="text-gray-600 mb-6">
          CLV y segmentación de clientes por comportamiento de compra
        </p>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
          <table className="min-w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold uppercase text-sm">Cliente</th>
                <th className="px-6 py-4 text-left font-semibold uppercase text-sm">Email</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Órdenes</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Total Gastado</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Gasto Prom.</th>
                <th className="px-6 py-4 text-left font-semibold uppercase text-sm">Última Compra</th>
                <th className="px-6 py-4 text-center font-semibold uppercase text-sm">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {response.data.map((row) => (
                <tr key={row.customer_id} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4 text-blue-900 font-medium">
                    {row.customer_name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {row.customer_email}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    {row.num_ordenes}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-700">
                    ${Number(row.total_gastado).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    ${Number(row.gasto_promedio).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatDate(row.ultima_compra)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getEstadoColor(row.estado_cliente)}`}>
                      {row.estado_cliente}
                    </span>
                  </td>
                </tr>
              ))}
              {response.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                    No hay datos de clientes disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center items-center gap-4">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}&limit=${limit}`}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition"
            >
              ← Anterior
            </Link>
          )}
          
          <span className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-sm">
            Página {page} de {response.totalPages}
          </span>
          
          {page < response.totalPages && (
            <Link
              href={`?page=${page + 1}&limit=${limit}`}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition"
            >
              Siguiente →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}