CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(40) NOT NULL
);

CREATE TABLE channels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(40) NOT NULL
);

CREATE TABLE status (
  id SERIAL PRIMARY KEY,
  name VARCHAR(40) NOT NULL
);

CREATE TABLE methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(40) NOT NULL
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  category_id INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  stock INT NOT NULL,
  active BOOLEAN NOT NULL,
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  email VARCHAR(50)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  status_id INT NOT NULL,
  channel_id INT NOT NULL,
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_orders_status
    FOREIGN KEY (status_id) REFERENCES status(id),
  CONSTRAINT fk_orders_channel
    FOREIGN KEY (channel_id) REFERENCES channels(id)
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  method_id INT NOT NULL,
  paid_amount NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_payments_method
    FOREIGN KEY (method_id) REFERENCES methods(id)
);