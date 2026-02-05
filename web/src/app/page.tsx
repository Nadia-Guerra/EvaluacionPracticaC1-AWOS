import { query } from '../../lib/db';

export default async function Home() {
  const data = await query('SELECT * FROM products');

  return (
    <div>
      <div>
        <h1>Productos de la Cafetería</h1>

        <div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>${parseFloat(row.price).toFixed(2)}</td>
                  <td>{row.stock}</td>
                  <td>{row.active ? 'Activo' : 'Inactivo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
