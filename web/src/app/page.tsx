import { query } from '../../lib/db';

export default function Home() {
  return (
    <div>
      <h1>Dashboard Cafetería</h1>
      <ul>
        <li><a href="/reports/sales-daily">Ventas diarias</a></li>
        <li><a href="/reports/top-products">Top productos</a></li>
        <li><a href="/reports/customer-value">Clientes</a></li>
        <li><a href="/reports/inventory-risk">Inventario</a></li>
        <li><a href="/reports/payment-mix">Métodos de pago</a></li>
      </ul>
    </div>
  );
}
