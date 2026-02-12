import Link from 'next/link';

export default function Home() {
  const reportes = [
    {
      titulo: 'Ventas Diarias',
      descripcion: 'Consulta ventas agregadas por día',
      ruta: '/reports/sales-daily'
    },
    {
      titulo: 'Top Productos',
      descripcion: 'Ranking de productos más vendidos',
      ruta: '/reports/top-products'
    },
    {
      titulo: 'Valor de Clientes',
      descripcion: 'Análisis de clientes por gasto total',
      ruta: '/reports/customer-value'
    },
    {
      titulo: 'Inventario en Riesgo',
      descripcion: 'Productos con stock bajo',
      ruta: '/reports/inventory-risk'
    },
    {
      titulo: 'Mix de Pagos',
      descripcion: 'Distribución de métodos de pago',
      ruta: '/reports/payment-mix'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Dashboard Cafetería
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportes.map((reporte) => (
            <Link 
              key={reporte.ruta}
              href={reporte.ruta}
              className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {reporte.titulo}
              </h2>
              <p className="text-gray-600">
                {reporte.descripcion}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}