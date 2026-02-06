# Cafetería Dashboard ☕📊

Dashboard analítico desarrollado en **Next.js + TypeScript** que consume **reportes SQL (VIEWS)** desde **PostgreSQL**, ejecutándose completamente con **Docker Compose** y aplicando **seguridad real por roles**.

Este proyecto simula el área de analítica de una cafetería del campus y permite analizar ventas, productos estrella, inventario en riesgo, clientes frecuentes y mezcla de pagos.

## 🗂️ Estructura del proyecto

```
.
├── db/
│   ├── schema.sql        # Definición de tablas y relaciones
│   ├── seed.sql          # Datos de prueba
│   ├── migrate.sql       # Script de inicialización
│   ├── reports_vw.sql    # VIEWS analíticas
│   ├── indexes.sql       # Índices de optimización
│   └── roles.sql         # Roles y permisos
│
├── web/
│   └── src/app/
│       ├── api/reports/  # Endpoints API (solo SELECT sobre VIEWS)
│       └── reports/      # Páginas del dashboard
│
├── docker-compose.yml
└── README.md
```

---

## 🛢️ Base de datos

### Tablas principales

* `categories(id, name)`
* `products(id, name, category_id, price, stock, active)`
* `customers(id, name, email)`
* `orders(id, customer_id, created_at, status_id, channel)`
* `order_items(id, order_id, product_id, qty, unit_price)`
* `payments(id, order_id, method_id, paid_amount)`
* `methods(id, name)`


Los scripts se ejecutan automáticamente al levantar el contenedor.

---

## 📊 VIEWS analíticas implementadas

Todas las consultas de la app se realizan **exclusivamente sobre VIEWS**.

### 1️⃣ `vw_sales_daily`

* Grain: 1 fila por día
* Métricas: `total_ventas`, `tickets`, `ticket_promedio`
* Filtros: rango de fechas
* Incluye: `HAVING`, agregados y campos calculados

### 2️⃣ `vw_top_products_ranked`

* Ranking por revenue y unidades
* Window Functions: `RANK() OVER`
* Soporta búsqueda por nombre y paginación
* Incluye CTE

### 3️⃣ `vw_inventory_risk`

* Productos con stock bajo
* Métricas de riesgo e inventario
* CASE para nivel de riesgo
* Filtro por categoría

### 4️⃣ `vw_customer_value`

* Valor de vida del cliente (CLV)
* Métricas: total gastado, órdenes, promedio
* CASE para estado del cliente
* Soporta paginación

### 5️⃣ `vw_payment_mix`

* Distribución de pagos por método
* Porcentajes usando Window Functions

✔️ 5+ VIEWS
✔️ Agregados, GROUP BY, CASE, HAVING
✔️ CTE y Window Functions
✔️ Sin `SELECT *` en múltiples VIEWS

---

## 🔐 Seguridad (Roles y permisos)

La aplicación **NO se conecta como postgres**.

### Roles definidos

* `postgres`: rol administrador (solo infraestructura)
* `app_user`: rol de la aplicación

### Permisos del usuario `app_user`

El usuario **NO tiene acceso directo a tablas**
Solo puede ejecutar `SELECT` sobre VIEWS

### Verificación

```sql
SET ROLE app_user;
SELECT * FROM products;       -- ERROR
SELECT * FROM vw_sales_daily; -- OK
```

---

## ⚡ Índices y optimización

Se incluyen **mínimo 3 índices relevantes** en `db/indexes.sql`, por ejemplo:

* Índices sobre fechas (`orders.created_at`)
* Índices sobre claves foráneas
* Índices para búsquedas (`products.name`)

### Evidencia con EXPLAIN

Ejemplo:

```sql
EXPLAIN ANALYZE
SELECT * FROM vw_top_products_ranked
WHERE product_name ILIKE '%café%'
LIMIT 10 OFFSET 0;
```

Los planes de ejecución muestran uso efectivo de índices.

---

## 🖥️ Frontend (Next.js – App Router)

### Dashboard principal (`/`)

La aplicación cuenta con un **dashboard principal** que funciona como punto de entrada y contiene **tarjetas / enlaces** a cada uno de los reportes analíticos disponibles.

Desde esta vista el usuario puede navegar a cada reporte individual.

### Pantallas de reportes

Se implementan **mínimo 5 pantallas**, una por cada VIEW analítica:

* `/reports/sales-daily`
* `/reports/top-products`
* `/reports/inventory-risk`
* `/reports/customer-value`
* `/reports/payment-mix`

Cada pantalla de reporte incluye:

* **Título del reporte**
* **Descripción del insight analítico**
* **Tabla legible de resultados**
* **Al menos 1 KPI destacado** (por ejemplo: total de ventas, total pagado, ranking, etc.)

### Data fetching y seguridad

* Todo el data fetching se realiza **server-side** usando **Server Components** y **API Routes**.
* **No se exponen credenciales** al cliente.
* El cliente nunca accede directamente a la base de datos.
* Todas las consultas ejecutadas por la app son exclusivamente:

```sql
SELECT * FROM <VIEW>
```

---

## 🔎 Filtros, búsqueda y paginación

La aplicación implementa filtros y paginación **server-side**, cumpliendo con los requisitos del enunciado.

### Filtros

* `vw_sales_daily`

  * Filtro por rango de fechas (`date_from`, `date_to`).

* `vw_inventory_risk`

  * Filtro por categoría (`category_id`), validado mediante whitelist.

### Búsqueda

* `vw_top_products_ranked`

  * Búsqueda por nombre de producto (`search`).

### Paginación server-side

Se implementa paginación usando `LIMIT` y `OFFSET`:

* `vw_top_products_ranked`
* `vw_customer_value`

Los parámetros `page` y `limit` son:

* Validados en el servidor
* Limitados a rangos seguros
* Nunca interpolados directamente sin control

---

## 🐳 Docker Compose

El proyecto se ejecuta completamente mediante **Docker Compose**.

### Servicios levantados

* **PostgreSQL** (`cafe_db`)
* **Next.js** (`cafe_web`)

### Comando de ejecución

```bash
docker compose up --build
```

Este comando:

* Construye las imágenes
* Inicializa la base de datos
* Ejecuta los scripts SQL (`schema`, `seed`, `views`, `indexes`, `roles`)
* Levanta la aplicación web

La aplicación queda disponible en:

```
http://localhost:3000
```

---

## 🐳 Ejecución con Docker

### Levantar el proyecto

```bash
docker compose up --build
```

La app estará disponible en:

```
http://localhost:3000
```

### Reiniciar BD (opcional)

```bash
docker compose down -v
docker compose up --build
```

