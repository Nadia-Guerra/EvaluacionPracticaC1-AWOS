import { headers } from 'next/headers';

type PaymentMixRow = {
  method_id: number;
  method_name: string;
  num_transacciones: number;
  total_pagado: string;
  monto_promedio: string;
  porcentaje: string;
};

async function getPaymentMix(): Promise<PaymentMixRow[]> {
  const headersList = await headers();
  const host = headersList.get('host');

  const res = await fetch(
    `http://${host}/api/reports/payment-mix`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Error al obtener mix de pagos');
  }

  return res.json();
}

export default async function PaymentMixPage() {
  const data = await getPaymentMix();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">
        Mix de pagos
      </h1>

      <p className="text-gray-600 mb-6">
        Distribución de métodos de pago utilizados.
      </p>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left border-b">Método</th>
              <th className="px-4 py-2 text-right border-b">Transacciones</th>
              <th className="px-4 py-2 text-right border-b">Total pagado</th>
              <th className="px-4 py-2 text-right border-b">Monto prom.</th>
              <th className="px-4 py-2 text-right border-b">Porcentaje</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.method_id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b font-medium">
                  {row.method_name}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  {row.num_transacciones}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  ${Number(row.total_pagado).toFixed(2)}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  ${Number(row.monto_promedio).toFixed(2)}
                </td>
                <td className="px-4 py-2 border-b text-right">
                  <span className="font-semibold text-blue-600">
                    {Number(row.porcentaje).toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
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
