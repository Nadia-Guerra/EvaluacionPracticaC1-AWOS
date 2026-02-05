INSERT INTO categories (name) VALUES
('Bebidas'),
('Panadería'),
('Snacks');

INSERT INTO channels(name) VALUES
('Mostrador'),
('Delivery'),
('En linea');

INSERT INTO status (name) VALUES
('Pendiente'),
('Pagado'),
('Cancelado');

INSERT INTO methods(name)VALUES
('Efectivo'),
('Transferencia'),
('Tarjeta');

INSERT INTO products(name, category_id, price, stock, active) VALUES
('Cafe', 1, 79.00, 45, true),
('Concha', 2, 15.00, 30, true),
('Galletas Oreo', 3, 24.00, 60, true);

INSERT INTO customers(name, email) VALUES
('Emilia', 'emigouzz@gmail.com'),
('Emma', 'reyesemma@gmail.com'),
('Alicia', 'aliperez@gmail.com');


INSERT INTO orders (customer_id, created_at, status_id, channel_id) VALUES
(1, '2026-09-01 10:15', 1, 1),
(2, '2026-09-02 11:00', 1, 2),
(3, '2026-09-03 12:25', 2, 3);

INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES
(1, 1, 1, 79.00),
(1, 3, 2, 24.00),
(2, 2, 1, 15.00),
(3, 1, 2, 79.00);

INSERT INTO payments (order_id, method_id, paid_amount) VALUES
(1, 1, 91.00),
(2, 2, 45.00),
(3, 2, 115.00);
