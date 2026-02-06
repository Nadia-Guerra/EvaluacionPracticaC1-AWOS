# Cafetería Dashboard ☕📊

Dashboard analítico desarrollado con **Next.js (App Router) + TypeScript** que consume **reportes SQL (VIEWS)** desde **PostgreSQL**, ejecutándose completamente con **Docker Compose** y aplicando **seguridad real por roles**.


---

## 🧪 Pruebas de seguridad y funcionamiento

Estas pruebas verifican que la aplicación cumple con el requisito de **seguridad real por roles** y que el acceso a la base de datos está correctamente restringido.

### 1️⃣ Conectarse como `app_user`

```bash
docker exec -it cafe_db psql -U app_user -d cafeteria_db
```

---

### 2️⃣ Probar acceso a VIEWS (✅ debe funcionar)

```sql
SELECT * FROM vw_sales_daily LIMIT 3;
```

---

### 3️⃣ Probar acceso a TABLAS (❌ debe fallar)

```sql
SELECT * FROM customers LIMIT 1;
```

**Resultado esperado:**

```
ERROR:  permission denied for table customers
```

---

### ✅ Resultado esperado de seguridad

**El usuario `app_user` puede:**

* Leer datos de las 5 VIEWS analíticas

**El usuario `app_user` NO puede:**

* Leer tablas directamente
* Insertar datos
* Actualizar datos
* Eliminar datos
* Crear o modificar la estructura de la base de datos

Esto garantiza que, incluso si la aplicación fuera comprometida, un atacante solo podría acceder a datos agregados desde las VIEWS y no a información sensible ni a la estructura de la base de datos.

---

## ▶️ Guía rápida de pruebas (paso a paso)

### 2. Pruebas desde terminal (API)

Ejecutar llamadas directas a la API para validar los reportes:

```bash
curl http://localhost:3000/api/reports/sales-daily
curl http://localhost:3000/api/reports/top-products?page=1&limit=5
curl http://localhost:3000/api/reports/payment-mix
```

**Resultado esperado:**

* Respuestas en formato JSON
* Los datos corresponden a los reportes definidos en las VIEWS
* No se exponen tablas ni credenciales

---

### 3. Pruebas desde la aplicación (Next.js)

Abrir en el navegador:

* `http://localhost:3000` (Dashboard principal)
* Navegar a cualquiera de los reportes:

  * `/reports/sales-daily`
  * `/reports/top-products`
  * `/reports/inventory-risk`
  * `/reports/customer-value`
  * `/reports/payment-mix`

**Resultado esperado:**

* Cada pantalla muestra título, descripción del insight, tabla de resultados y al menos un KPI
* Filtros, búsqueda y paginación funcionan correctamente

---

## 🗂️ Estructura del proyecto

```
.
├── db/
│   ├── schema.sql        # Tablas y relaciones
│   ├── seed.sql          # Datos de prueba
│   ├── migrate.sql       # Migraciones incrementales
│   ├── reports_vw.sql    # VIEWS analíticas
│   ├── indexes.sql       # Índices
│   └── roles.sql         # Roles y permisos
│
├── web/
│   └── src/app/
│       ├── api/reports/  # API Routes (solo SELECT sobre VIEWS)
│       └── reports/      # Pantallas del dashboard
│
├── docker-compose.yml
└── README.md
```

---

## 🛢️ Base de datos

La base de datos contiene más de 5 tablas relacionadas mediante llaves foráneas reales:

* `categories`
* `products`
* `customers`
* `orders`
* `order_items`
* `payments`
* `methods`

Todos los scripts SQL se ejecutan automáticamente al levantar el contenedor.

---

## 📊 VIEWS analíticas

Todas las consultas de la aplicación se realizan **exclusivamente sobre VIEWS**:

* `vw_sales_daily`: ventas diarias con métricas agregadas y filtro por fechas
* `vw_top_products_ranked`: ranking de productos (Window Functions, búsqueda y paginación)
* `vw_inventory_risk`: productos con riesgo de inventario
* `vw_customer_value`: valor de vida del cliente (CLV) con paginación
* `vw_payment_mix`: mezcla de pagos con porcentajes

Las VIEWS incluyen agregados, GROUP BY, CASE, HAVING, CTEs y Window Functions.

---

## 🔐 Seguridad

* La aplicación **no se conecta como `postgres`**
* Se utiliza el rol `app_user`
* `app_user` solo tiene permisos `SELECT` sobre VIEWS
* No existe acceso directo a tablas desde la app

Ejemplo de verificación:

```sql
SET ROLE app_user;
SELECT * FROM products;       -- ERROR
SELECT * FROM vw_sales_daily; -- OK
```

---

## 🔎 Filtros, búsqueda y paginación

* Filtros:

  * Ventas diarias: rango de fechas
  * Inventario: categoría (whitelist)
* Búsqueda:

  * Top productos por nombre
* Paginación server-side:

  * Top productos
  * Valor de clientes

Todo el procesamiento se realiza en el servidor.

---

## 🐳 Docker Compose

El proyecto se ejecuta completamente con:

```bash
docker compose up --build
```

Este comando levanta PostgreSQL y Next.js, inicializa la base de datos y deja la aplicación lista para usarse en `http://localhost:3000`.

---

