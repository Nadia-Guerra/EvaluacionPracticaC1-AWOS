import { headers } from 'next/headers';
import Link from 'next/link';

//igual a la BD
type SalesDailyRow = {
  fecha: string;
  tickets: number;
  total_ventas: string;
  ticket_promedio: string;
};

//formato d la fecha
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}


//funcion, obtiene el host
async function getSalesDaily(dateFrom?: string, dateTo?: string): Promise<SalesDailyRow[]> {
  const headersList = await headers();
  const host = headersList.get('host');

  let url = `http://${host}/api/reports/sales-daily`;
  const params = new URLSearchParams();
  
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);
  
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Error al obtener ventas diarias');
  }

  return res.json();
}

export default async function SalesDailyPage({
  searchParams,
}: {
  searchParams: Promise<{ date_from?: string; date_to?: string }>; 
}) {
  const params = await searchParams; 
  const data = await getSalesDaily(params.date_from, params.date_to);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Ventas Diarias
        </h1>
        <p className="text-gray-600 mb-6">
          Resumen de ventas agregadas por día
        </p>

        <form method="get" className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 mb-6 flex gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">
              Desde
            </label>
            <input
              type="date"
              name="date_from"
              defaultValue={params.date_from}
              className="border border-blue-200 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">
              Hasta
            </label>
            <input
              type="date"
              name="date_to"
              defaultValue={params.date_to}
              className="border border-blue-200 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              Filtrar
            </button>
            <Link
              href="/reports/sales-daily"
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
                <th className="px-6 py-4 text-left font-semibold uppercase text-sm">Fecha</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Tickets</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Total Ventas</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Ticket Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4 text-blue-900 font-medium">
                    {formatDate(row.fecha)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    {row.tickets}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-700">
                    ${Number(row.total_ventas).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    ${Number(row.ticket_promedio).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                    No se encontraron registros en este rango de fechas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}