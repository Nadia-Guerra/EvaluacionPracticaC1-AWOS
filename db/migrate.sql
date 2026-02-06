-- =========================================================================================
-- migrate.sql
-- Migraciones incrementales posteriores al schema inicial
-- =========================================================================================

-- 1. Índice para mejorar consultas de reportes por fecha
CREATE INDEX IF NOT EXISTS idx_orders_created_at
ON orders(created_at);

-- 2. Índice para acelerar joins entre payments y orders
CREATE INDEX IF NOT EXISTS idx_payments_order_id
ON payments(order_id);

-- 3. Asegurar que las VIEWS críticas existan (recreación controlada)

DROP VIEW IF EXISTS vw_payment_mix;
CREATE VIEW vw_payment_mix AS
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
GROUP BY m.id, m.name;
