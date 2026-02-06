import { headers } from 'next/headers';

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

async function getCustomerValue(): Promise<CustomerValueRow[]> {
  const headersList = await headers();
  const host = headersList.get('host');

  const res = await fetch(
    `http://${host}/api/reports/customer-value`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Error al obtener valor de clientes');
  }

  return res.json();
}

export default async function CustomerValuePage() {
  const data = await getCustomerValue();

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
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">
        Valor de clientes
      </h1>

      <p className="text-gray-600 mb-6">
        CLV y segmentación de clientes por comportamiento de compra.
      </p>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left border-b">Cliente</th>
              <th className="px-4 py-2 text-left border-b">Email</th>
              <th className="px-4 py-2 text-right border-b">Órdenes</th>
              <th className="px-4 py-2 text-right border-b">Total gastado</th>
              <th className="px-4 py-2 text-right border-b">Gasto prom.</th>
              <th className="px-4 py-2 text-left border-b">Última compra</th>
              <th className="px-4 py-2 text-center border-b">Estado</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.customer_id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b font-medium">
                  {row.customer_name}
                </td>
                <td className="px-4 py-2 border-b text-gray-600">
                  {row.customer_email}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  {row.num_ordenes}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  ${Number(row.total_gastado).toFixed(2)}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  ${Number(row.gasto_promedio).toFixed(2)}
                </td>
                <td className="px-4 py-2 border-b">
                  {new Date(row.ultima_compra).toLocaleDateString('es-MX')}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getEstadoColor(row.estado_cliente)}`}>
                    {row.estado_cliente}
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