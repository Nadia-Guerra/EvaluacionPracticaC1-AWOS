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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Mix de Pagos
        </h1>
        <p className="text-gray-600 mb-8">
          Distribución y rendimiento por método de pago utilizado.
        </p>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {data.slice(0, 4).map((item) => (
            <div key={item.method_id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
              <p className="text-sm font-medium text-gray-500 uppercase">{item.method_name}</p>
              <p className="text-2xl font-bold text-blue-900">
                ${Number(item.total_pagado).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs font-semibold text-blue-600 mt-1">
                {Number(item.porcentaje).toFixed(1)}% del total
              </p>
            </div>
          ))}
        </div>

       
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
          <table className="min-w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold uppercase text-sm">Método de Pago</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Transacciones</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Total Recaudado</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Monto Promedio</th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-sm">Participación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {data.map((row) => (
                <tr key={row.method_id} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4 text-blue-900 font-medium">
                    {row.method_name}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    {row.num_transacciones}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-800">
                    ${Number(row.total_pagado).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    ${Number(row.monto_promedio).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${row.porcentaje}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-blue-600 text-sm">
                        {Number(row.porcentaje).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    No hay registros de pagos disponibles.
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