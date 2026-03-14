-- ============================================================
-- CUTSY CAFÉ POS — DATABASE SCHEMA
-- Supabase / PostgreSQL
-- ============================================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE order_type AS ENUM ('dine-in', 'take-out', 'online');
CREATE TYPE reservation_status AS ENUM ('pending', 'declined', 'accepted');
CREATE TYPE material_unit AS ENUM ('g', 'ml', 'unit');
CREATE TYPE payment_method AS ENUM ('cash', 'gcash', 'other');
CREATE TYPE inventory_log_type AS ENUM ('stock_in', 'stock_out');
CREATE TYPE action_type AS ENUM (
  'LOGIN', 'LOGOUT', 'INVENTORY', 'PROCESS_SALE',
  'UPDATE_PRODUCT', 'MANAGE_USER', 'UPDATE_TAX',
  'UPDATE_PRICING', 'GENERATE_REPORT'
);
CREATE TYPE feedback_category AS ENUM ('Service', 'Food', 'Place');

-- USERS
CREATE TABLE users (
  user_id       SERIAL PRIMARY KEY,
  user_fname    VARCHAR(255) NOT NULL,
  user_sname    VARCHAR(255) NOT NULL,
  user_contact  VARCHAR(11),
  user_email    VARCHAR(255) UNIQUE,
  user_username VARCHAR(255) UNIQUE NOT NULL,
  user_password VARCHAR(255) NOT NULL,
  user_role     user_role NOT NULL DEFAULT 'customer',
  user_isactive BOOLEAN DEFAULT TRUE,
  user_created  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES
CREATE TABLE categories (
  category_id          SERIAL PRIMARY KEY,
  category_name        VARCHAR(150) NOT NULL,
  category_description TEXT,
  category_isactive    BOOLEAN DEFAULT TRUE,
  category_created     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS
CREATE TABLE products (
  product_id           SERIAL PRIMARY KEY,
  category_id          INT REFERENCES categories(category_id) ON DELETE SET NULL,
  product_name         VARCHAR(150) NOT NULL,
  product_price        DECIMAL(10,2) NOT NULL,
  product_image_url    TEXT,
  product_has_points   BOOLEAN DEFAULT FALSE,
  product_is_featured  BOOLEAN DEFAULT FALSE,
  product_is_available BOOLEAN DEFAULT TRUE,
  product_created      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RAW MATERIALS INVENTORY
CREATE TABLE raw_materials_inventory (
  material_id            SERIAL PRIMARY KEY,
  material_name          VARCHAR(255) NOT NULL,
  material_unit          material_unit NOT NULL,
  material_stock         DECIMAL(10,2) DEFAULT 0,
  material_reorder_level DECIMAL(10,2),
  material_updated       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCT RECIPE
CREATE TABLE product_recipe (
  recipe_id         SERIAL PRIMARY KEY,
  product_id        INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  material_id       INT NOT NULL REFERENCES raw_materials_inventory(material_id) ON DELETE RESTRICT,
  quantity_required DECIMAL(10,2) NOT NULL,
  UNIQUE(product_id, material_id)
);

-- TAX SETTINGS
CREATE TABLE tax_settings (
  tax_id             SERIAL PRIMARY KEY,
  tax_name           VARCHAR(255) NOT NULL,
  tax_rate           DECIMAL(5,4) NOT NULL,
  tax_isactive       BOOLEAN DEFAULT TRUE,
  tax_effective_date TIMESTAMP,
  tax_updated        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RESERVATIONS
CREATE TABLE reservations (
  reservation_id      SERIAL PRIMARY KEY,
  user_id             INT REFERENCES users(user_id) ON DELETE SET NULL,
  guest_fname         VARCHAR(255),
  guest_sname         VARCHAR(255),
  guest_contact       VARCHAR(11),
  guest_quantity      SMALLINT CHECK (guest_quantity > 0 AND guest_quantity <= 50),
  reservation_date    TIMESTAMP,
  reservation_status  reservation_status DEFAULT 'pending',
  reservation_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDERS
CREATE TABLE orders (
  order_id       SERIAL PRIMARY KEY,
  user_id        INT REFERENCES users(user_id) ON DELETE SET NULL,
  reservation_id INT REFERENCES reservations(reservation_id) ON DELETE SET NULL,
  order_type     order_type NOT NULL DEFAULT 'dine-in',
  order_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  order_status   order_status DEFAULT 'pending',
  order_amount   DECIMAL(10,2)
);

-- ORDER ITEMS
CREATE TABLE order_items (
  order_item_id       SERIAL PRIMARY KEY,
  product_id          INT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
  order_id            INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  order_item_quantity INT NOT NULL CHECK (order_item_quantity > 0),
  order_price         DECIMAL(10,2) NOT NULL
);

-- TRANSACTIONS
CREATE TABLE transactions (
  transaction_id    SERIAL PRIMARY KEY,
  order_id          INT NOT NULL REFERENCES orders(order_id),
  tax_id            INT NOT NULL REFERENCES tax_settings(tax_id),
  gross_amount      DECIMAL(10,2),
  tax_rate          DECIMAL(5,4),
  tax_amount        DECIMAL(10,2),
  net_amount        DECIMAL(10,2),
  payment_method    payment_method NOT NULL,
  cash              DECIMAL(10,2),
  change            DECIMAL(10,2),
  claim_code        VARCHAR(255) UNIQUE,
  potential_points  INT DEFAULT 0,
  points_is_claimed BOOLEAN DEFAULT FALSE,
  transaction_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REWARDS
CREATE TABLE rewards (
  reward_id      SERIAL PRIMARY KEY,
  user_id        INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  point_count    INT DEFAULT 0,
  total_redeemed INT DEFAULT 0,
  last_purchase  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POINTS CLAIM LOG
CREATE TABLE points_claim_log (
  claim_id       SERIAL PRIMARY KEY,
  transaction_id INT REFERENCES transactions(transaction_id),
  user_id        INT REFERENCES users(user_id),
  reward_id      INT REFERENCES rewards(reward_id),
  points_earned  INT DEFAULT 0,
  claim_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVENTORY LOGS
CREATE TABLE inventory_logs (
  inventory_log_id   SERIAL PRIMARY KEY,
  material_id        INT REFERENCES raw_materials_inventory(material_id),
  user_id            INT REFERENCES users(user_id),
  type               inventory_log_type NOT NULL,
  qty_change         DECIMAL(10,2) NOT NULL,
  balance_after      DECIMAL(10,2) NOT NULL,
  inventory_log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ACTIVITY LOGS
CREATE TABLE activity_logs (
  activity_id      SERIAL PRIMARY KEY,
  user_id          INT REFERENCES users(user_id),
  action_type      action_type NOT NULL,
  activity_details TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FEEDBACKS
CREATE TABLE feedbacks (
  feedback_id    SERIAL PRIMARY KEY,
  user_id        INT REFERENCES users(user_id) ON DELETE SET NULL,
  transaction_id INT REFERENCES transactions(transaction_id) ON DELETE SET NULL,
  rating         SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comments       TEXT,
  category       feedback_category,
  feedback_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
