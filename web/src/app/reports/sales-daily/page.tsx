import { headers } from 'next/headers';

type SalesDailyRow = {
  fecha: string;
  tickets: number;
  total_ventas: string;
  ticket_promedio: string;
};

async function getSalesDaily(): Promise<SalesDailyRow[]> {
  const headersList = await headers();
  const host = headersList.get('host');

  const res = await fetch(
    `http://${host}/api/reports/sales-daily`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Error al obtener ventas diarias');
  }

  return res.json();
}

export default async function SalesDailyPage() {
  const data = await getSalesDaily();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">
        Ventas diarias
      </h1>

      <p className="text-gray-600 mb-6">
        Resumen de ventas agregadas por día.
      </p>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left border-b">Fecha</th>
              <th className="px-4 py-2 text-right border-b">Tickets</th>
              <th className="px-4 py-2 text-right border-b">Total ventas</th>
              <th className="px-4 py-2 text-right border-b">Ticket promedio</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.fecha} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">
                  {row.fecha}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  {row.tickets}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  ${Number(row.total_ventas).toFixed(2)}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  ${Number(row.ticket_promedio).toFixed(2)}
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={4}
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
