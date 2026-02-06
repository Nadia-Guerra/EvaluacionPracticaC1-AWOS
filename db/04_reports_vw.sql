-- =========================================================================================
-- vw_sales_daily
-- Ventas diarias agregadas
-- Grain: 1 fila por día
-- Métricas: total_ventas (suma de pagos), tickets (count órdenes), ticket_promedio
-- Campo calculado: ticket_promedio = total_ventas / tickets
-- =========================================================================================

CREATE OR REPLACE VIEW vw_sales_daily AS
SELECT
  DATE(o.created_at) AS fecha,
  COUNT(DISTINCT o.id) AS tickets,
  COALESCE(SUM(p.paid_amount), 0) AS total_ventas,
  COALESCE(ROUND(AVG(p.paid_amount), 2), 0) AS ticket_promedio
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status_id = 2  -- Solo órdenes pagadas
GROUP BY DATE(o.created_at)
HAVING COUNT(DISTINCT o.id) > 0
ORDER BY fecha DESC;


-- =========================================================================================
-- vw_top_products_ranked
-- Ranking de productos por revenue y unidades vendidas (Window Function)
-- Grain: 1 fila por producto
-- Métricas: unidades_vendidas, revenue_total, ranking_revenue, ranking_unidades
-- Campo calculado: rankings usando RANK() OVER, precio_promedio
-- =========================================================================================

CREATE OR REPLACE VIEW vw_top_products_ranked AS
WITH product_sales AS (
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    SUM(oi.qty) AS unidades_vendidas,
    SUM(oi.qty * oi.unit_price) AS revenue_total,
    ROUND(AVG(oi.unit_price), 2) AS precio_promedio
  FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN categories c ON c.id = p.category_id
  WHERE p.active = true
  GROUP BY p.id, p.name, c.name
)
SELECT
  product_id,
  product_name,
  category_name,
  COALESCE(unidades_vendidas, 0) AS unidades_vendidas,
  COALESCE(revenue_total, 0) AS revenue_total,
  precio_promedio,
  RANK() OVER (ORDER BY revenue_total DESC) AS ranking_revenue,
  RANK() OVER (ORDER BY unidades_vendidas DESC) AS ranking_unidades
FROM product_sales
ORDER BY ranking_revenue;


-- =========================================================================================
-- vw_inventory_risk
-- Productos con stock bajo y porcentaje de riesgo
-- Grain: 1 fila por producto
-- Métricas: stock_actual, unidades_vendidas_mes, dias_inventario
-- Campo calculado: nivel_riesgo (CASE), porcentaje_riesgo
-- =========================================================================================

CREATE OR REPLACE VIEW vw_inventory_risk AS
WITH sales_last_month AS (
  SELECT
    oi.product_id,
    SUM(oi.qty) AS qty_vendida
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND o.status_id = 2
  GROUP BY oi.product_id
)
SELECT
  p.id AS product_id,
  p.name AS product_name,
  c.id AS category_id,
  c.name AS category_name,
  p.stock AS stock_actual,
  COALESCE(s.qty_vendida, 0) AS unidades_vendidas_mes,
  CASE
    WHEN COALESCE(s.qty_vendida, 0) = 0 THEN NULL
    ELSE ROUND(p.stock::NUMERIC / NULLIF(s.qty_vendida, 0) * 30, 1)
  END AS dias_inventario,
  CASE
    WHEN p.stock = 0 THEN 100
    WHEN COALESCE(s.qty_vendida, 0) = 0 THEN 0
    ELSE ROUND((1 - (p.stock::NUMERIC / NULLIF(s.qty_vendida * 2, 0))) * 100, 2)
  END AS porcentaje_riesgo,
  CASE
    WHEN p.stock = 0 THEN 'CRÍTICO'
    WHEN p.stock < 10 THEN 'ALTO'
    WHEN p.stock < 30 THEN 'MEDIO'
    ELSE 'BAJO'
  END AS nivel_riesgo
FROM products p
JOIN categories c ON c.id = p.category_id
LEFT JOIN sales_last_month s ON s.product_id = p.id
WHERE p.active = true
  AND (p.stock < 50 OR COALESCE(s.qty_vendida, 0) > p.stock)
ORDER BY porcentaje_riesgo DESC NULLS LAST;



-- =========================================================================================
-- vw_customer_value
-- Valor de vida del cliente (CLV)
-- Grain: 1 fila por cliente
-- Métricas: total_gastado, num_ordenes, gasto_promedio, ultima_compra
-- Campo calculado: gasto_promedio = total_gastado / num_ordenes, estado_cliente (CASE)
-- =========================================================================================

CREATE OR REPLACE VIEW vw_customer_value AS
SELECT
  c.id AS customer_id,
  c.name AS customer_name,
  c.email AS customer_email,
  COUNT(DISTINCT o.id) AS num_ordenes,
  COALESCE(SUM(p.paid_amount), 0) AS total_gastado,
  COALESCE(ROUND(AVG(p.paid_amount), 2), 0) AS gasto_promedio,
  MAX(o.created_at) AS ultima_compra,
  CASE
    WHEN COALESCE(SUM(p.paid_amount), 0) > 500 THEN 'VIP'
    WHEN COUNT(DISTINCT o.id) >= 5 THEN 'FRECUENTE'
    WHEN MAX(o.created_at) < CURRENT_DATE - INTERVAL '60 days' THEN 'INACTIVO'
    ELSE 'NUEVO'
  END AS estado_cliente
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status_id = 2
LEFT JOIN payments p ON p.order_id = o.id
GROUP BY c.id, c.name, c.email
HAVING COUNT(DISTINCT o.id) > 0 OR COALESCE(SUM(p.paid_amount), 0) > 0
ORDER BY total_gastado DESC;


-- =========================================================================================
-- vw_payment_mix
-- Distribución de pagos por método
-- Grain: 1 fila por método de pago
-- Métricas: total_pagado, num_transacciones, monto_promedio, porcentaje
-- Campo calculado: porcentaje (usando Window Function), monto_promedio
-- =========================================================================================

CREATE OR REPLACE VIEW vw_payment_mix AS
SELECT
  m.id AS method_id,
  m.name AS method_name,
  COUNT(p.id) AS num_transacciones,
  COALESCE(SUM(p.paid_amount), 0) AS total_pagado,
  COALESCE(ROUND(AVG(p.paid_amount), 2), 0) AS monto_promedio,
  ROUND(
    COALESCE(SUM(p.paid_amount), 0) * 100.0 /
    NULLIF(SUM(SUM(p.paid_amount)) OVER (), 0),
    2
  ) AS porcentaje
FROM methods m
LEFT JOIN payments p ON p.method_id = m.id
GROUP BY m.id, m.name
ORDER BY total_pagado DESC;
