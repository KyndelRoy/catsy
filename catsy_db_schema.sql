-- CATSY COFFEE — DATABASE SCHEMA
-- Supabase / PostgreSQL
-- Supabase Auth compatible — no stored passwords

-- ENUMS
CREATE TYPE user_role           AS ENUM ('customer', 'staff', 'admin');
CREATE TYPE order_status        AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE order_type          AS ENUM ('dine-in', 'take-out', 'online');
CREATE TYPE reservation_status  AS ENUM ('pending', 'declined', 'accepted');
CREATE TYPE material_unit       AS ENUM ('g', 'ml', 'unit');
CREATE TYPE payment_method      AS ENUM ('cash', 'gcash', 'other');
CREATE TYPE inventory_log_type  AS ENUM ('stock_in', 'stock_out');
CREATE TYPE action_type         AS ENUM (
  'LOGIN',
  'LOGOUT',
  'INVENTORY',
  'PROCESS_SALE',
  'UPDATE_PRODUCT',
  'MANAGE_USER',
  'UPDATE_TAX',
  'UPDATE_PRICING',
  'GENERATE_REPORT'
);
CREATE TYPE feedback_category AS ENUM ('Service', 'Food', 'Place');

-- USERS
-- auth_id links to Supabase auth.users.id (UUID)
-- user_password is intentionally removed — Supabase Auth owns it
CREATE TABLE users (
  user_id       SERIAL PRIMARY KEY,
  auth_id       UUID UNIQUE NOT NULL,                       -- FK to auth.users.id
  user_fname    VARCHAR(255) NOT NULL,
  user_sname    VARCHAR(255) NOT NULL,
  user_contact  VARCHAR(11),
  user_email    VARCHAR(255) UNIQUE NOT NULL,
  user_username VARCHAR(255) UNIQUE NOT NULL,
  user_role     user_role NOT NULL DEFAULT 'customer',
  user_isactive BOOLEAN NOT NULL DEFAULT TRUE,
  user_created  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE categories (
  category_id          SERIAL PRIMARY KEY,
  category_name        VARCHAR(150) NOT NULL,
  category_description TEXT,
  category_isactive    BOOLEAN NOT NULL DEFAULT TRUE,
  category_created     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  product_id           SERIAL PRIMARY KEY,
  category_id          INT REFERENCES categories(category_id) ON DELETE SET NULL,
  product_name         VARCHAR(150) NOT NULL,
  product_price        DECIMAL(10,2) NOT NULL CHECK (product_price >= 0),
  product_image_url    TEXT,
  product_has_points   BOOLEAN NOT NULL DEFAULT FALSE,
  product_is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  product_is_available BOOLEAN NOT NULL DEFAULT TRUE,
  product_created      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RAW MATERIALS INVENTORY
CREATE TABLE raw_materials_inventory (
  material_id            SERIAL PRIMARY KEY,
  material_name          VARCHAR(255) NOT NULL,
  material_unit          material_unit NOT NULL,
  material_stock         DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (material_stock >= 0),
  material_reorder_level DECIMAL(10,2) CHECK (material_reorder_level >= 0),
  material_updated       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCT RECIPE
-- Maps which raw materials are needed per product and how much
CREATE TABLE product_recipe (
  recipe_id         SERIAL PRIMARY KEY,
  product_id        INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  material_id       INT NOT NULL REFERENCES raw_materials_inventory(material_id) ON DELETE RESTRICT,
  quantity_required DECIMAL(10,2) NOT NULL CHECK (quantity_required > 0),
  UNIQUE (product_id, material_id)
);

-- TAX SETTINGS
CREATE TABLE tax_settings (
  tax_id             SERIAL PRIMARY KEY,
  tax_name           VARCHAR(255) NOT NULL,
  tax_rate           DECIMAL(5,4) NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 1),
  tax_isactive       BOOLEAN NOT NULL DEFAULT TRUE,
  tax_effective_date TIMESTAMPTZ,
  tax_updated        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RESERVATIONS
-- user_id is nullable — allows walk-in / guest reservations

CREATE TABLE reservations (
  reservation_id      SERIAL PRIMARY KEY,
  user_id             INT REFERENCES users(user_id) ON DELETE SET NULL,
  guest_fname         VARCHAR(255),
  guest_sname         VARCHAR(255),
  guest_contact       VARCHAR(11),
  guest_quantity      SMALLINT NOT NULL CHECK (guest_quantity > 0 AND guest_quantity <= 50),
  reservation_date    TIMESTAMPTZ NOT NULL,
  reservation_status  reservation_status NOT NULL DEFAULT 'pending',
  reservation_notes   TEXT,
  reservation_created TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS
-- order_amount is computed by trigger — do not insert manually
CREATE TABLE orders (
  order_id       SERIAL PRIMARY KEY,
  user_id        INT REFERENCES users(user_id) ON DELETE SET NULL,
  reservation_id INT REFERENCES reservations(reservation_id) ON DELETE SET NULL,
  order_type     order_type NOT NULL DEFAULT 'dine-in',
  order_date     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  order_status   order_status NOT NULL DEFAULT 'pending',
  order_amount   DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (order_amount >= 0)
);

-- ORDER ITEMS
CREATE TABLE order_items (
  order_item_id       SERIAL PRIMARY KEY,
  order_id            INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id          INT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
  order_item_quantity INT NOT NULL CHECK (order_item_quantity > 0),
  order_price         DECIMAL(10,2) NOT NULL CHECK (order_price >= 0)
);

-- TRANSACTIONS
-- One transaction per order
-- claim_code is a unique code given to the customer for points redemption
CREATE TABLE transactions (
  transaction_id    SERIAL PRIMARY KEY,
  order_id          INT NOT NULL UNIQUE REFERENCES orders(order_id),
  tax_id            INT NOT NULL REFERENCES tax_settings(tax_id),
  gross_amount      DECIMAL(10,2) NOT NULL CHECK (gross_amount >= 0),
  tax_rate          DECIMAL(5,4) NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 1),
  tax_amount        DECIMAL(10,2) NOT NULL CHECK (tax_amount >= 0),
  net_amount        DECIMAL(10,2) NOT NULL CHECK (net_amount >= 0),
  payment_method    payment_method NOT NULL,
  cash              DECIMAL(10,2) CHECK (cash >= 0),
  change            DECIMAL(10,2) CHECK (change >= 0),
  claim_code        VARCHAR(255) UNIQUE,
  potential_points  INT NOT NULL DEFAULT 0 CHECK (potential_points >= 0),
  points_is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  transaction_date  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REWARDS
-- One row per user — created automatically on user signup via trigger
CREATE TABLE rewards (
  reward_id      SERIAL PRIMARY KEY,
  user_id        INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  point_count    INT NOT NULL DEFAULT 0 CHECK (point_count >= 0),
  total_redeemed INT NOT NULL DEFAULT 0 CHECK (total_redeemed >= 0),
  last_purchase  TIMESTAMPTZ
);

-- POINTS CLAIM LOG
-- Records each time a customer claims points from a transaction
CREATE TABLE points_claim_log (
  claim_id       SERIAL PRIMARY KEY,
  transaction_id INT NOT NULL REFERENCES transactions(transaction_id) ON DELETE RESTRICT,
  user_id        INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  reward_id      INT NOT NULL REFERENCES rewards(reward_id) ON DELETE RESTRICT,
  points_earned  INT NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
  claim_date     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INVENTORY LOGS
-- Append-only log of every stock change
CREATE TABLE inventory_logs (
  inventory_log_id   SERIAL PRIMARY KEY,
  material_id        INT NOT NULL REFERENCES raw_materials_inventory(material_id) ON DELETE RESTRICT,
  user_id            INT REFERENCES users(user_id) ON DELETE SET NULL,
  log_type           inventory_log_type NOT NULL,
  qty_change         DECIMAL(10,2) NOT NULL,
  balance_after      DECIMAL(10,2) NOT NULL CHECK (balance_after >= 0),
  inventory_log_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ACTIVITY LOGS
-- Append-only audit trail of staff/admin actions
CREATE TABLE activity_logs (
  activity_id      SERIAL PRIMARY KEY,
  user_id          INT REFERENCES users(user_id) ON DELETE SET NULL,
  action_type      action_type NOT NULL,
  activity_details TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FEEDBACKS
-- Tied to a transaction — one feedback per transaction per user
CREATE TABLE feedbacks (
  feedback_id    SERIAL PRIMARY KEY,
  user_id        INT REFERENCES users(user_id) ON DELETE SET NULL,
  transaction_id INT REFERENCES transactions(transaction_id) ON DELETE SET NULL,
  rating         SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments       TEXT,
  category       feedback_category NOT NULL,
  feedback_date  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, transaction_id)
);

-- INDEXES
CREATE INDEX idx_users_auth_id         ON users(auth_id);
CREATE INDEX idx_users_email           ON users(user_email);
CREATE INDEX idx_products_category     ON products(category_id);
CREATE INDEX idx_products_available    ON products(product_is_available);
CREATE INDEX idx_order_items_order     ON order_items(order_id);
CREATE INDEX idx_order_items_product   ON order_items(product_id);
CREATE INDEX idx_orders_user           ON orders(user_id);
CREATE INDEX idx_orders_status         ON orders(order_status);
CREATE INDEX idx_orders_date           ON orders(order_date);
CREATE INDEX idx_transactions_order    ON transactions(order_id);
CREATE INDEX idx_transactions_date     ON transactions(transaction_date);
CREATE INDEX idx_reservations_user     ON reservations(user_id);
CREATE INDEX idx_reservations_date     ON reservations(reservation_date);
CREATE INDEX idx_inventory_logs_mat    ON inventory_logs(material_id);
CREATE INDEX idx_activity_logs_user    ON activity_logs(user_id);
CREATE INDEX idx_points_claim_user     ON points_claim_log(user_id);

-- TRIGGERS

-- ------------------------------------------------------------
-- TRIGGER 1: Auto-create users row on Supabase Auth signup
-- Fires when Supabase inserts into auth.users
-- Creates the matching public.users profile row
-- Creates the matching rewards row (see Trigger 2)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    auth_id,
    user_fname,
    user_sname,
    user_email,
    user_username,
    user_role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'customer'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_auth_user();


-- ------------------------------------------------------------
-- TRIGGER 2: Auto-create rewards row when a new user is created
-- Fires after INSERT on public.users
-- Every customer starts with a rewards record at 0 points
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user_rewards()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.rewards (user_id, point_count, total_redeemed)
  VALUES (NEW.user_id, 0, 0);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_rewards
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_rewards();


-- ------------------------------------------------------------
-- TRIGGER 3: Recalculate order_amount when order items change
-- Fires after INSERT, UPDATE, or DELETE on order_items
-- Keeps orders.order_amount always in sync — never set it manually
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION recalculate_order_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id INT;
BEGIN
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);

  UPDATE public.orders
  SET order_amount = (
    SELECT COALESCE(SUM(order_item_quantity * order_price), 0)
    FROM public.order_items
    WHERE order_id = v_order_id
  )
  WHERE order_id = v_order_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_order_amount();


-- ------------------------------------------------------------
-- TRIGGER 4: Deduct raw materials stock when order is completed
-- Fires when orders.order_status changes to 'completed'
-- Deducts material stock via product_recipe quantities
-- Inserts a stock_out row into inventory_logs for each material
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION deduct_inventory_on_order_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item        RECORD;
  v_recipe      RECORD;
  v_new_stock   DECIMAL(10,2);
BEGIN
  IF NEW.order_status = 'completed' AND OLD.order_status <> 'completed' THEN

    FOR v_item IN
      SELECT product_id, order_item_quantity
      FROM public.order_items
      WHERE order_id = NEW.order_id
    LOOP

      FOR v_recipe IN
        SELECT material_id, quantity_required
        FROM public.product_recipe
        WHERE product_id = v_item.product_id
      LOOP

        UPDATE public.raw_materials_inventory
        SET
          material_stock  = material_stock - (v_recipe.quantity_required * v_item.order_item_quantity),
          material_updated = NOW()
        WHERE material_id = v_recipe.material_id
        RETURNING material_stock INTO v_new_stock;

        INSERT INTO public.inventory_logs (
          material_id,
          user_id,
          log_type,
          qty_change,
          balance_after
        ) VALUES (
          v_recipe.material_id,
          NEW.user_id,
          'stock_out',
          -(v_recipe.quantity_required * v_item.order_item_quantity),
          v_new_stock
        );

      END LOOP;
    END LOOP;

  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_completed
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION deduct_inventory_on_order_complete();


-- ------------------------------------------------------------
-- TRIGGER 5: Add potential points to rewards when transaction is created
-- Fires after INSERT on transactions
-- Only processes rows where potential_points > 0
-- Updates the user's rewards point_count and last_purchase
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_transaction_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id INT;
BEGIN
  IF NEW.potential_points > 0 THEN

    SELECT user_id INTO v_user_id
    FROM public.orders
    WHERE order_id = NEW.order_id;

    IF v_user_id IS NOT NULL THEN
      UPDATE public.rewards
      SET
        point_count   = point_count + NEW.potential_points,
        last_purchase = NOW()
      WHERE user_id = v_user_id;
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_transaction_created
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_transaction_points();


-- ------------------------------------------------------------
-- TRIGGER 6: Update material_updated timestamp on stock change
-- Fires after UPDATE on raw_materials_inventory
-- Keeps material_updated always accurate without manual tracking
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_material_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.material_updated = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_material_stock_change
  BEFORE UPDATE ON public.raw_materials_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_material_timestamp();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable on all tables, then define per-role policies
-- ============================================================

ALTER TABLE users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories               ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials_inventory  ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recipe           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_settings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_claim_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks                ENABLE ROW LEVEL SECURITY;

-- Helper: get the internal user_id from the current Supabase Auth session
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.users WHERE auth_id = auth.uid();
$$;

-- Helper: get the role of the current authenticated user
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_role FROM public.users WHERE auth_id = auth.uid();
$$;

-- ------------------------------------------------------------
-- USERS policies
-- ------------------------------------------------------------

-- Users can read their own profile
CREATE POLICY "users: read own"
  ON users FOR SELECT
  USING (auth_id = auth.uid());

-- Users can update their own profile (not role, not auth_id)
CREATE POLICY "users: update own"
  ON users FOR UPDATE
  USING (auth_id = auth.uid());

-- Admins can read all users
CREATE POLICY "users: admin read all"
  ON users FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

-- Admins can update any user
CREATE POLICY "users: admin update all"
  ON users FOR UPDATE
  USING (get_current_user_role() = 'admin');

-- New user rows are inserted by the trigger (SECURITY DEFINER) only
CREATE POLICY "users: no direct insert"
  ON users FOR INSERT
  WITH CHECK (FALSE);

-- ------------------------------------------------------------
-- CATEGORIES policies
-- ------------------------------------------------------------

-- Anyone (including unauthenticated) can read active categories
CREATE POLICY "categories: public read active"
  ON categories FOR SELECT
  USING (category_isactive = TRUE);

-- Admins can do everything
CREATE POLICY "categories: admin all"
  ON categories FOR ALL
  USING (get_current_user_role() = 'admin');

-- ------------------------------------------------------------
-- PRODUCTS policies
-- ------------------------------------------------------------

-- Anyone can read available products
CREATE POLICY "products: public read available"
  ON products FOR SELECT
  USING (product_is_available = TRUE);

-- Admins can do everything
CREATE POLICY "products: admin all"
  ON products FOR ALL
  USING (get_current_user_role() = 'admin');

-- ------------------------------------------------------------
-- RAW MATERIALS policies
-- ------------------------------------------------------------

-- Staff and admin can read
CREATE POLICY "materials: staff read"
  ON raw_materials_inventory FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

-- Admin can do everything
CREATE POLICY "materials: admin all"
  ON raw_materials_inventory FOR ALL
  USING (get_current_user_role() = 'admin');

-- ------------------------------------------------------------
-- PRODUCT RECIPE policies
-- ------------------------------------------------------------

-- Staff and admin can read
CREATE POLICY "recipe: staff read"
  ON product_recipe FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

-- Admin can do everything
CREATE POLICY "recipe: admin all"
  ON product_recipe FOR ALL
  USING (get_current_user_role() = 'admin');

-- ------------------------------------------------------------
-- TAX SETTINGS policies
-- ------------------------------------------------------------

-- Staff and admin can read
CREATE POLICY "tax: staff read"
  ON tax_settings FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

-- Admin can do everything
CREATE POLICY "tax: admin all"
  ON tax_settings FOR ALL
  USING (get_current_user_role() = 'admin');

-- ------------------------------------------------------------
-- RESERVATIONS policies
-- ------------------------------------------------------------

-- Customers can read their own reservations
CREATE POLICY "reservations: read own"
  ON reservations FOR SELECT
  USING (user_id = get_current_user_id());

-- Customers can create reservations
CREATE POLICY "reservations: customer insert"
  ON reservations FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

-- Staff and admin can read all reservations
CREATE POLICY "reservations: staff read all"
  ON reservations FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

-- Staff and admin can update reservation status
CREATE POLICY "reservations: staff update"
  ON reservations FOR UPDATE
  USING (get_current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------
-- ORDERS policies
-- ------------------------------------------------------------

-- Customers can read their own orders
CREATE POLICY "orders: read own"
  ON orders FOR SELECT
  USING (user_id = get_current_user_id());

-- Customers can create orders
CREATE POLICY "orders: customer insert"
  ON orders FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

-- Staff and admin can read all orders
CREATE POLICY "orders: staff read all"
  ON orders FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

-- Staff and admin can update orders (e.g. change status)
CREATE POLICY "orders: staff update"
  ON orders FOR UPDATE
  USING (get_current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------
-- ORDER ITEMS policies
-- ------------------------------------------------------------

-- Customers can read items for their own orders
CREATE POLICY "order_items: read own orders"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT order_id FROM public.orders WHERE user_id = get_current_user_id()
    )
  );

-- Customers can insert items into their own orders
CREATE POLICY "order_items: customer insert"
  ON order_items FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT order_id FROM public.orders WHERE user_id = get_current_user_id()
    )
  );

-- Staff and admin can read and update all order items
CREATE POLICY "order_items: staff all"
  ON order_items FOR ALL
  USING (get_current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------
-- TRANSACTIONS policies
-- ------------------------------------------------------------

-- Customers can read their own transactions
CREATE POLICY "transactions: read own"
  ON transactions FOR SELECT
  USING (
    order_id IN (
      SELECT order_id FROM public.orders WHERE user_id = get_current_user_id()
    )
  );

-- Staff and admin can read and insert all transactions
CREATE POLICY "transactions: staff all"
  ON transactions FOR ALL
  USING (get_current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------
-- REWARDS policies
-- ------------------------------------------------------------

-- Customers can read their own rewards
CREATE POLICY "rewards: read own"
  ON rewards FOR SELECT
  USING (user_id = get_current_user_id());

-- Staff and admin can read all rewards
CREATE POLICY "rewards: staff read all"
  ON rewards FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

-- Rewards rows are inserted by trigger only
CREATE POLICY "rewards: no direct insert"
  ON rewards FOR INSERT
  WITH CHECK (FALSE);

-- ------------------------------------------------------------
-- POINTS CLAIM LOG policies
-- ------------------------------------------------------------

-- Customers can read their own claim history
CREATE POLICY "points_claim_log: read own"
  ON points_claim_log FOR SELECT
  USING (user_id = get_current_user_id());

-- Staff and admin can read all
CREATE POLICY "points_claim_log: staff read all"
  ON points_claim_log FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

-- Staff can insert (when processing a claim)
CREATE POLICY "points_claim_log: staff insert"
  ON points_claim_log FOR INSERT
  WITH CHECK (get_current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------
-- INVENTORY LOGS policies
-- ------------------------------------------------------------

-- Staff and admin can read all inventory logs
CREATE POLICY "inventory_logs: staff read"
  ON inventory_logs FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

-- Inventory logs are inserted by trigger or admin only
CREATE POLICY "inventory_logs: admin insert"
  ON inventory_logs FOR INSERT
  WITH CHECK (get_current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------
-- ACTIVITY LOGS policies
-- ------------------------------------------------------------

-- Only admin can read activity logs
CREATE POLICY "activity_logs: admin read"
  ON activity_logs FOR SELECT
  USING (get_current_user_role() = 'admin');

-- Staff and admin can insert activity logs
CREATE POLICY "activity_logs: staff insert"
  ON activity_logs FOR INSERT
  WITH CHECK (get_current_user_role() IN ('admin', 'staff'));

-- ------------------------------------------------------------
-- FEEDBACKS policies
-- ------------------------------------------------------------

-- Anyone can read feedback (public reviews)
CREATE POLICY "feedbacks: public read"
  ON feedbacks FOR SELECT
  USING (TRUE);

-- Authenticated customers can submit feedback
CREATE POLICY "feedbacks: customer insert"
  ON feedbacks FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

-- Admin can manage all feedbacks
CREATE POLICY "feedbacks: admin all"
  ON feedbacks FOR ALL
  USING (get_current_user_role() = 'admin');
