-- ============================================================
-- CATSY COFFEE — DATABASE SCHEMA v5 (FULL)
-- Supabase / PostgreSQL
-- Supabase Auth compatible — no stored passwords
-- ============================================================
-- CHANGELOG v4 → v5
--  [ID-1] users.user_id         SERIAL → UUID (gen_random_uuid)
--  [ID-2] orders.order_id       SERIAL → UUID (gen_random_uuid)
--  [ID-3] transactions.transaction_id  SERIAL → UUID (gen_random_uuid)
--           All three eliminate enumeration risk and hide
--           business intelligence from sequential IDs.
--  [CC]   transactions.claim_code  — added generate_claim_code()
--           function + set as column DEFAULT so codes are always
--           auto-generated; app no longer needs to supply one.
--  [COL1] orders.order_updated         — new timestamp column
--           auto-maintained by Trigger 14.
--  [COL2] reservations.reservation_updated — new timestamp column
--           auto-maintained by Trigger 15.
--  [COL3] cms_content.created_at       — was missing; only
--           updated_at existed before.
--  [COL4] reward_redemptions.processed_by — tracks which staff
--           member processed the redemption.
--  [CHK1] orders — CHECK: scheduled_pickup_time must be NULL
--           for non pick-up orders.
--  [CHK2] transactions — CHECK: cash/change must be populated
--           for cash payments and NULL for all other methods.
--  [IDX1] transactions(points_is_claimed) — new index.
--  [IDX2] points_claim_log(reward_id)    — new index.
--  [TRG14] Auto-update orders.order_updated on change.
--  [TRG15] Auto-update reservations.reservation_updated on change.
--  [DES]  Design gap noted: reward redemptions do not deduct
--           inventory — fix recommended for v6 (see bottom).
-- ============================================================


-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role           AS ENUM ('customer', 'staff', 'admin');
CREATE TYPE order_status        AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE order_type          AS ENUM ('dine-in', 'take-out', 'pick-up');
CREATE TYPE reservation_status  AS ENUM ('pending', 'declined', 'accepted', 'cancelled');
CREATE TYPE material_unit       AS ENUM ('g', 'ml', 'unit', 'L', 'KG');
CREATE TYPE payment_method      AS ENUM ('cash', 'gcash', 'other');
CREATE TYPE inventory_log_type  AS ENUM ('stock_in', 'stock_out');
CREATE TYPE table_status        AS ENUM ('available', 'occupied', 'reserved', 'unavailable');
CREATE TYPE notification_type   AS ENUM ('low_stock', 'negative_feedback', 'new_reservation', 'general');
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


-- ============================================================
-- CLAIM CODE GENERATOR  [CC]
-- Produces codes like: RCPT-A3F2C9B1E47D
-- Used as the DEFAULT for transactions.claim_code.
-- ============================================================

CREATE OR REPLACE FUNCTION generate_claim_code()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT 'RCPT-' || UPPER(REPLACE(gen_random_uuid()::TEXT, '-', ''))::VARCHAR(12);
$$;


-- ============================================================
-- USERS  [ID-1]
-- user_id is now UUID — no sequential enumeration risk.
-- auth_id links to Supabase auth.users.id (UUID).
-- No stored passwords — Supabase Auth owns credentials.
-- ============================================================

CREATE TABLE users (
  user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       UUID UNIQUE NOT NULL,
  user_fname    VARCHAR(255) NOT NULL,
  user_sname    VARCHAR(255) NOT NULL,
  user_contact  VARCHAR(11),
  user_email    VARCHAR(255) UNIQUE NOT NULL,
  user_username VARCHAR(255) UNIQUE NOT NULL,
  user_role     user_role NOT NULL DEFAULT 'customer',
  user_isactive BOOLEAN NOT NULL DEFAULT TRUE,
  user_created  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
  category_id          SERIAL PRIMARY KEY,
  category_name        VARCHAR(150) NOT NULL,
  category_description TEXT,
  category_isactive    BOOLEAN NOT NULL DEFAULT TRUE,
  category_created     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- PRODUCTS
-- product_has_points    — marks this product as points-eligible
-- product_points_value  — fixed points awarded per unit sold
-- ============================================================

CREATE TABLE products (
  product_id           SERIAL PRIMARY KEY,
  category_id          INT REFERENCES categories(category_id) ON DELETE SET NULL,
  product_name         VARCHAR(150) NOT NULL,
  product_description  TEXT,
  product_price        DECIMAL(10,2) NOT NULL CHECK (product_price >= 0),
  product_image_url    TEXT,
  product_has_points   BOOLEAN NOT NULL DEFAULT FALSE,
  product_points_value INT NOT NULL DEFAULT 0
                         CHECK (product_points_value >= 0)
                         CHECK (product_has_points = TRUE OR product_points_value = 0),
  product_is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  product_is_available BOOLEAN NOT NULL DEFAULT TRUE,
  product_created      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- CAFE TABLES
-- table_updated is auto-maintained by Trigger 8.
-- ============================================================

CREATE TABLE cafe_tables (
  table_id       SERIAL PRIMARY KEY,
  table_name     VARCHAR(50) NOT NULL,
  table_seats    SMALLINT NOT NULL CHECK (table_seats > 0),
  table_status   table_status NOT NULL DEFAULT 'available',
  table_isactive BOOLEAN NOT NULL DEFAULT TRUE,
  table_updated  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- RAW MATERIALS INVENTORY
-- material_stock may go negative (deficit allowed — flagged).
-- ============================================================

CREATE TABLE raw_materials_inventory (
  material_id            SERIAL PRIMARY KEY,
  material_name          VARCHAR(255) NOT NULL,
  material_unit          material_unit NOT NULL,
  material_stock         DECIMAL(10,2) NOT NULL DEFAULT 0,
  material_is_deficit    BOOLEAN NOT NULL DEFAULT FALSE,
  material_reorder_level DECIMAL(10,2) CHECK (material_reorder_level >= 0),
  material_updated       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- PRODUCT RECIPE
-- ============================================================

CREATE TABLE product_recipe (
  recipe_id         SERIAL PRIMARY KEY,
  product_id        INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  material_id       INT NOT NULL REFERENCES raw_materials_inventory(material_id) ON DELETE RESTRICT,
  quantity_required DECIMAL(10,2) NOT NULL CHECK (quantity_required > 0),
  UNIQUE (product_id, material_id)
);


-- ============================================================
-- TAX SETTINGS
-- Only one row may have tax_isactive = TRUE at a time.
-- Enforced by partial unique index idx_one_active_tax.  [FIX-TAX]
-- ============================================================

CREATE TABLE tax_settings (
  tax_id             SERIAL PRIMARY KEY,
  tax_name           VARCHAR(255) NOT NULL,
  tax_rate           DECIMAL(5,4) NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 1),
  tax_isactive       BOOLEAN NOT NULL DEFAULT TRUE,
  tax_effective_date TIMESTAMPTZ,
  tax_updated        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- OPERATING HOURS
-- open_time must be before close_time when is_open = TRUE.  [FIX-HRS]
-- ============================================================

CREATE TABLE operating_hours (
  hours_id      SERIAL PRIMARY KEY,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time     TIME,
  close_time    TIME,
  is_open       BOOLEAN NOT NULL DEFAULT TRUE,
  hours_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (day_of_week),
  CONSTRAINT chk_hours_when_open                             -- [FIX-HRS]
    CHECK (
      is_open = FALSE
      OR (open_time IS NOT NULL AND close_time IS NOT NULL AND open_time < close_time)
    )
);


-- ============================================================
-- RESERVATIONS
-- user_id nullable — allows guest reservations.
-- Guest identity (fname + email) required when user_id is NULL. [FIX-GUEST]
-- reservation_updated auto-maintained by Trigger 15.  [COL2]
-- ============================================================

CREATE TABLE reservations (
  reservation_id      SERIAL PRIMARY KEY,
  user_id             UUID REFERENCES users(user_id) ON DELETE SET NULL,
  table_id            INT REFERENCES cafe_tables(table_id) ON DELETE SET NULL,
  guest_fname         VARCHAR(255),
  guest_sname         VARCHAR(255),
  guest_email         VARCHAR(255),
  guest_contact       VARCHAR(11),
  guest_quantity      SMALLINT NOT NULL CHECK (guest_quantity > 0 AND guest_quantity <= 50),
  reservation_date    TIMESTAMPTZ NOT NULL,
  reservation_status  reservation_status NOT NULL DEFAULT 'pending',
  reservation_notes   TEXT,
  reservation_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reservation_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),    -- [COL2]
  CONSTRAINT chk_reservation_identity                       -- [FIX-GUEST]
    CHECK (
      user_id IS NOT NULL
      OR (guest_fname IS NOT NULL AND guest_email IS NOT NULL)
    )
);


-- ============================================================
-- ORDERS  [ID-2]
-- order_id is now UUID.
-- order_amount    auto-computed by Trigger 3.
-- order_updated   auto-maintained by Trigger 14.  [COL1]
-- scheduled_pickup_time must be NULL for non pick-up orders. [CHK1]
-- ============================================================

CREATE TABLE orders (
  order_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(user_id) ON DELETE SET NULL,
  reservation_id        INT REFERENCES reservations(reservation_id) ON DELETE SET NULL,
  order_type            order_type NOT NULL DEFAULT 'dine-in',
  order_date            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_pickup_time TIMESTAMPTZ,
  order_status          order_status NOT NULL DEFAULT 'pending',
  order_amount          DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (order_amount >= 0),
  order_updated         TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- [COL1]
  CONSTRAINT chk_pickup_time_only_for_pickup                 -- [CHK1]
    CHECK (order_type = 'pick-up' OR scheduled_pickup_time IS NULL)
);


-- ============================================================
-- ORDER ITEMS
-- ============================================================

CREATE TABLE order_items (
  order_item_id       SERIAL PRIMARY KEY,
  order_id            UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id          INT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
  order_item_quantity INT NOT NULL CHECK (order_item_quantity > 0),
  order_price         DECIMAL(10,2) NOT NULL CHECK (order_price >= 0)
);


-- ============================================================
-- TRANSACTIONS  [ID-3]
-- transaction_id is now UUID.
-- claim_code DEFAULT calls generate_claim_code().  [CC]
-- cash/change CHECK enforces correct fields per payment method. [CHK2]
-- ============================================================

CREATE TABLE transactions (
  transaction_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL UNIQUE REFERENCES orders(order_id),
  tax_id            INT NOT NULL REFERENCES tax_settings(tax_id),
  gross_amount      DECIMAL(10,2) NOT NULL CHECK (gross_amount >= 0),
  tax_rate          DECIMAL(5,4) NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 1),
  tax_amount        DECIMAL(10,2) NOT NULL CHECK (tax_amount >= 0),
  net_amount        DECIMAL(10,2) NOT NULL CHECK (net_amount >= 0),
  payment_method    payment_method NOT NULL,
  cash              DECIMAL(10,2) CHECK (cash >= 0),
  change            DECIMAL(10,2) CHECK (change >= 0),
  claim_code        VARCHAR(255) UNIQUE DEFAULT generate_claim_code(),  -- [CC]
  potential_points  INT NOT NULL DEFAULT 0 CHECK (potential_points >= 0),
  points_is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  transaction_date  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cash_fields_by_method                       -- [CHK2]
    CHECK (
      (payment_method = 'cash'  AND cash IS NOT NULL AND change IS NOT NULL)
      OR
      (payment_method <> 'cash' AND cash IS NULL     AND change IS NULL)
    )
);


-- ============================================================
-- REWARDS
-- One row per customer — created automatically by Trigger 2.
-- ============================================================

CREATE TABLE rewards (
  reward_id      SERIAL PRIMARY KEY,
  user_id        UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  point_count    INT NOT NULL DEFAULT 0 CHECK (point_count >= 0),
  total_redeemed INT NOT NULL DEFAULT 0 CHECK (total_redeemed >= 0),
  last_purchase  TIMESTAMPTZ
);


-- ============================================================
-- POINTS CLAIM LOG
-- UNIQUE (transaction_id) — a receipt can only be claimed once.
-- ============================================================

CREATE TABLE points_claim_log (
  claim_id       SERIAL PRIMARY KEY,
  transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(transaction_id) ON DELETE RESTRICT,
  user_id        UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  reward_id      INT NOT NULL REFERENCES rewards(reward_id) ON DELETE RESTRICT,
  points_earned  INT NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
  claim_date     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- REWARD PRODUCTS
-- ============================================================

CREATE TABLE reward_products (
  reward_product_id   SERIAL PRIMARY KEY,
  product_id          INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  points_required     INT NOT NULL CHECK (points_required > 0),
  reward_is_available BOOLEAN NOT NULL DEFAULT TRUE,
  reward_created      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id)
);


-- ============================================================
-- REWARD REDEMPTIONS
-- processed_by — tracks which staff processed the redemption. [COL4]
-- ============================================================

CREATE TABLE reward_redemptions (
  redemption_id     SERIAL PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  reward_product_id INT NOT NULL REFERENCES reward_products(reward_product_id) ON DELETE RESTRICT,
  points_spent      INT NOT NULL CHECK (points_spent > 0),
  processed_by      UUID REFERENCES users(user_id) ON DELETE SET NULL,  -- [COL4]
  redeemed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- INVENTORY LOGS
-- ============================================================

CREATE TABLE inventory_logs (
  inventory_log_id   SERIAL PRIMARY KEY,
  material_id        INT NOT NULL REFERENCES raw_materials_inventory(material_id) ON DELETE RESTRICT,
  user_id            UUID REFERENCES users(user_id) ON DELETE SET NULL,
  log_type           inventory_log_type NOT NULL,
  qty_change         DECIMAL(10,2) NOT NULL,
  balance_after      DECIMAL(10,2) NOT NULL,
  inventory_log_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- ACTIVITY LOGS
-- ============================================================

CREATE TABLE activity_logs (
  activity_id      SERIAL PRIMARY KEY,
  user_id          UUID REFERENCES users(user_id) ON DELETE SET NULL,
  action_type      action_type NOT NULL,
  activity_details TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- NOTIFICATIONS
-- user_id NULL = broadcast (all admin/staff see it).
-- ============================================================

CREATE TABLE notifications (
  notification_id   SERIAL PRIMARY KEY,
  user_id           UUID REFERENCES users(user_id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  title             VARCHAR(255) NOT NULL,
  message           TEXT NOT NULL,
  is_read           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- FEEDBACKS
-- UNIQUE (user_id, transaction_id, category) — 1 row per category
-- per visit (up to 3 rows per transaction).
-- ============================================================

CREATE TABLE feedbacks (
  feedback_id    SERIAL PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  transaction_id UUID REFERENCES transactions(transaction_id) ON DELETE SET NULL,
  rating         SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments       TEXT,
  category       feedback_category NOT NULL,
  feedback_date  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, transaction_id, category)
);


-- ============================================================
-- CMS CONTENT
-- created_at — new column tracking first insert.  [COL3]
-- updated_at — auto-maintained by Trigger 12.
-- ============================================================

CREATE TABLE cms_content (
  content_id    SERIAL PRIMARY KEY,
  content_key   VARCHAR(100) NOT NULL UNIQUE,
  content_title VARCHAR(255),
  content_body  TEXT,
  content_type  VARCHAR(50) NOT NULL DEFAULT 'text'
                  CHECK (content_type IN ('text', 'html', 'markdown', 'image_url')),
  is_published  BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by    UUID REFERENCES users(user_id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- [COL3]
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_auth_id             ON users(auth_id);
CREATE INDEX idx_users_email               ON users(user_email);
CREATE INDEX idx_products_category         ON products(category_id);
CREATE INDEX idx_products_available        ON products(product_is_available);
CREATE INDEX idx_order_items_order         ON order_items(order_id);
CREATE INDEX idx_order_items_product       ON order_items(product_id);
CREATE INDEX idx_orders_user               ON orders(user_id);
CREATE INDEX idx_orders_status             ON orders(order_status);
CREATE INDEX idx_orders_date               ON orders(order_date);
CREATE INDEX idx_transactions_order        ON transactions(order_id);
CREATE INDEX idx_transactions_date         ON transactions(transaction_date);
CREATE INDEX idx_transactions_claim_code   ON transactions(claim_code);
CREATE INDEX idx_transactions_claimed      ON transactions(points_is_claimed);  -- [IDX1]
CREATE INDEX idx_reservations_user         ON reservations(user_id);
CREATE INDEX idx_reservations_date         ON reservations(reservation_date);
CREATE INDEX idx_inventory_logs_mat        ON inventory_logs(material_id);
CREATE INDEX idx_activity_logs_user        ON activity_logs(user_id);
CREATE INDEX idx_points_claim_user         ON points_claim_log(user_id);
CREATE INDEX idx_points_claim_reward       ON points_claim_log(reward_id);      -- [IDX2]
CREATE INDEX idx_cafe_tables_status        ON cafe_tables(table_status);
CREATE INDEX idx_notifications_user        ON notifications(user_id);
CREATE INDEX idx_notifications_read        ON notifications(is_read);
CREATE INDEX idx_reward_redemptions_user   ON reward_redemptions(user_id);
CREATE INDEX idx_feedbacks_user            ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_transaction     ON feedbacks(transaction_id);
CREATE INDEX idx_cms_content_key           ON cms_content(content_key);
CREATE INDEX idx_cms_content_published     ON cms_content(is_published);
CREATE INDEX idx_recipe_material           ON product_recipe(material_id);      -- [FIX-IDX]

-- Only one tax rate may be active at a time.  [FIX-TAX]
CREATE UNIQUE INDEX idx_one_active_tax ON tax_settings(tax_isactive)
  WHERE tax_isactive = TRUE;


-- ============================================================
-- TRIGGERS
-- ============================================================

-- ------------------------------------------------------------
-- TRIGGER 1: Auto-create users row on Supabase Auth signup
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
-- TRIGGER 2: Auto-create rewards row for new customers
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user_rewards()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_role = 'customer' THEN
    INSERT INTO public.rewards (user_id, point_count, total_redeemed)
    VALUES (NEW.user_id, 0, 0);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_rewards
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_rewards();


-- ------------------------------------------------------------
-- TRIGGER 3: Recalculate order_amount when order items change
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION recalculate_order_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
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
-- TRIGGER 4: Deduct raw materials when order is completed
-- Also broadcasts low_stock notification when stock drops
-- below material_reorder_level.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION deduct_inventory_on_order_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item             RECORD;
  v_recipe           RECORD;
  v_new_stock        DECIMAL(10,2);
  v_mat_name         VARCHAR(255);
  v_reorder_lvl      DECIMAL(10,2);
  v_already_notified BOOLEAN;
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
          material_stock      = material_stock - (v_recipe.quantity_required * v_item.order_item_quantity),
          material_is_deficit = (material_stock - (v_recipe.quantity_required * v_item.order_item_quantity)) < 0,
          material_updated    = NOW()
        WHERE material_id = v_recipe.material_id
        RETURNING material_stock, material_name, material_reorder_level
          INTO v_new_stock, v_mat_name, v_reorder_lvl;

        INSERT INTO public.inventory_logs (
          material_id, user_id, log_type, qty_change, balance_after
        ) VALUES (
          v_recipe.material_id,
          NEW.user_id,
          'stock_out',
          -(v_recipe.quantity_required * v_item.order_item_quantity),
          v_new_stock
        );

        IF v_reorder_lvl IS NOT NULL AND v_new_stock < v_reorder_lvl THEN
          SELECT EXISTS (
            SELECT 1 FROM public.notifications
            WHERE notification_type = 'low_stock'
              AND is_read = FALSE
              AND message LIKE '%' || v_mat_name || '%'
          ) INTO v_already_notified;

          IF NOT v_already_notified THEN
            INSERT INTO public.notifications (user_id, notification_type, title, message)
            VALUES (
              NULL,
              'low_stock',
              'Low Stock Alert',
              'Stock for "' || v_mat_name || '" has dropped to '
                || v_new_stock::TEXT || ' and is below the reorder level of '
                || v_reorder_lvl::TEXT || '.'
            );
          END IF;
        END IF;

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
-- TRIGGER 5: Credit points when a receipt code is claimed
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_points_claim()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.rewards
  SET
    point_count   = point_count + NEW.points_earned,
    last_purchase = NOW()
  WHERE reward_id = NEW.reward_id;

  UPDATE public.transactions
  SET points_is_claimed = TRUE
  WHERE transaction_id = NEW.transaction_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_points_claimed
  AFTER INSERT ON public.points_claim_log
  FOR EACH ROW
  EXECUTE FUNCTION handle_points_claim();


-- ------------------------------------------------------------
-- TRIGGER 6: Auto-update material_updated timestamp on stock change
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


-- ------------------------------------------------------------
-- TRIGGER 7: Deduct points + deduct raw materials when a reward is redeemed
-- Points are deducted from rewards.point_count.
-- Raw materials are deducted from raw_materials_inventory using the
-- redeemed product's recipe — same logic as Trigger 4 for paid orders.
-- A stock_out entry is written to inventory_logs for each ingredient.
-- Low-stock notification is broadcast if stock drops below reorder level.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_reward_redemption()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id       INT;
  v_recipe           RECORD;
  v_new_stock        DECIMAL(10,2);
  v_mat_name         VARCHAR(255);
  v_reorder_lvl      DECIMAL(10,2);
  v_already_notified BOOLEAN;
BEGIN
  -- 1. Deduct loyalty points
  UPDATE public.rewards
  SET
    point_count    = point_count - NEW.points_spent,
    total_redeemed = total_redeemed + NEW.points_spent
  WHERE user_id = NEW.user_id;

  -- 2. Resolve which product is being redeemed
  SELECT product_id INTO v_product_id
  FROM public.reward_products
  WHERE reward_product_id = NEW.reward_product_id;

  -- 3. Deduct each ingredient in that product's recipe
  FOR v_recipe IN
    SELECT material_id, quantity_required
    FROM public.product_recipe
    WHERE product_id = v_product_id
  LOOP

    UPDATE public.raw_materials_inventory
    SET
      material_stock      = material_stock - v_recipe.quantity_required,
      material_is_deficit = (material_stock - v_recipe.quantity_required) < 0,
      material_updated    = NOW()
    WHERE material_id = v_recipe.material_id
    RETURNING material_stock, material_name, material_reorder_level
      INTO v_new_stock, v_mat_name, v_reorder_lvl;

    -- 4. Write inventory log entry (processed_by = staff who redeemed)
    INSERT INTO public.inventory_logs (
      material_id, user_id, log_type, qty_change, balance_after
    ) VALUES (
      v_recipe.material_id,
      NEW.processed_by,
      'stock_out',
      -v_recipe.quantity_required,
      v_new_stock
    );

    -- 5. Broadcast low-stock alert if needed (same dedup guard as Trigger 4)
    IF v_reorder_lvl IS NOT NULL AND v_new_stock < v_reorder_lvl THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notifications
        WHERE notification_type = 'low_stock'
          AND is_read = FALSE
          AND message LIKE '%' || v_mat_name || '%'
      ) INTO v_already_notified;

      IF NOT v_already_notified THEN
        INSERT INTO public.notifications (user_id, notification_type, title, message)
        VALUES (
          NULL,
          'low_stock',
          'Low Stock Alert',
          'Stock for "' || v_mat_name || '" has dropped to '
            || v_new_stock::TEXT || ' and is below the reorder level of '
            || v_reorder_lvl::TEXT || '.'
        );
      END IF;
    END IF;

  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_reward_redeemed
  AFTER INSERT ON public.reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_reward_redemption();


-- ------------------------------------------------------------
-- TRIGGER 8: Auto-update table_updated timestamp on status change
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_table_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.table_updated = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_table_status_change
  BEFORE UPDATE ON public.cafe_tables
  FOR EACH ROW
  EXECUTE FUNCTION update_table_timestamp();


-- ------------------------------------------------------------
-- TRIGGER 9: Broadcast negative feedback notification
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_negative_feedback()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.rating <= 2 THEN
    INSERT INTO public.notifications (user_id, notification_type, title, message)
    VALUES (
      NULL,
      'negative_feedback',
      'Negative Feedback Received',
      'A customer left a ' || NEW.rating::TEXT || '-star '
        || NEW.category::TEXT || ' review'
        || CASE
             WHEN NEW.comments IS NOT NULL AND NEW.comments <> ''
             THEN ': "' || LEFT(NEW.comments, 100) || '"'
             ELSE '.'
           END
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_feedback_submitted
  AFTER INSERT ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION notify_negative_feedback();


-- ------------------------------------------------------------
-- TRIGGER 10: Broadcast new reservation notification
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_new_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
BEGIN
  IF NEW.guest_fname IS NOT NULL THEN
    v_name := NEW.guest_fname || ' ' || COALESCE(NEW.guest_sname, '');
  ELSIF NEW.user_id IS NOT NULL THEN
    SELECT user_fname || ' ' || user_sname INTO v_name
    FROM public.users WHERE user_id = NEW.user_id;
  ELSE
    v_name := 'Unknown';
  END IF;

  INSERT INTO public.notifications (user_id, notification_type, title, message)
  VALUES (
    NULL,
    'new_reservation',
    'New Reservation',
    'Reservation from ' || TRIM(v_name)
      || ' for ' || NEW.guest_quantity::TEXT || ' guest(s)'
      || ' on ' || TO_CHAR(NEW.reservation_date, 'Mon DD, YYYY HH12:MI AM') || '.'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_reservation_created
  AFTER INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_reservation();


-- ------------------------------------------------------------
-- TRIGGER 11: Auto-compute potential_points on transaction insert
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION compute_potential_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_computed_points INT;
BEGIN
  SELECT COALESCE(SUM(oi.order_item_quantity * p.product_points_value), 0)
  INTO v_computed_points
  FROM public.order_items oi
  JOIN public.products p ON p.product_id = oi.product_id
  WHERE oi.order_id = NEW.order_id
    AND p.product_has_points = TRUE;

  NEW.potential_points := v_computed_points;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_transaction_insert
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION compute_potential_points();


-- ------------------------------------------------------------
-- TRIGGER 12: Auto-update cms_content.updated_at on edit
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_cms_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_cms_content_change
  BEFORE UPDATE ON public.cms_content
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_timestamp();


-- ------------------------------------------------------------
-- TRIGGER 13: Sync hard delete to auth.users  [P-3]
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_user_hard_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = OLD.auth_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_user_hard_deleted
  AFTER DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_hard_delete();


-- ------------------------------------------------------------
-- TRIGGER 14: Auto-update orders.order_updated on change  [COL1]
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_order_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.order_updated = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_change
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_timestamp();


-- ------------------------------------------------------------
-- TRIGGER 15: Auto-update reservations.reservation_updated  [COL2]
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_reservation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.reservation_updated = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_reservation_change
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_reservation_timestamp();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories               ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_tables              ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials_inventory  ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recipe           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_settings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_hours          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_claim_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications            ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content              ENABLE ROW LEVEL SECURITY;


-- Helper: resolve internal user_id from current Supabase Auth session
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.users WHERE auth_id = auth.uid();
$$;

-- Helper: resolve role of current authenticated user
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

CREATE POLICY "users: read own"
  ON users FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "users: update own"
  ON users FOR UPDATE
  USING (auth_id = auth.uid());

CREATE POLICY "users: admin read all"
  ON users FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "users: admin update all"
  ON users FOR UPDATE
  USING (get_current_user_role() = 'admin');

CREATE POLICY "users: admin delete"
  ON users FOR DELETE
  USING (get_current_user_role() = 'admin');

-- Inserts handled exclusively by Trigger 1 (SECURITY DEFINER)
CREATE POLICY "users: no direct insert"
  ON users FOR INSERT
  WITH CHECK (FALSE);


-- ------------------------------------------------------------
-- CATEGORIES policies
-- ------------------------------------------------------------

CREATE POLICY "categories: public read active"
  ON categories FOR SELECT
  USING (category_isactive = TRUE);

CREATE POLICY "categories: admin all"
  ON categories FOR ALL
  USING (get_current_user_role() = 'admin');


-- ------------------------------------------------------------
-- PRODUCTS policies
-- ------------------------------------------------------------

CREATE POLICY "products: public read available"
  ON products FOR SELECT
  USING (product_is_available = TRUE);

CREATE POLICY "products: admin all"
  ON products FOR ALL
  USING (get_current_user_role() = 'admin');


-- ------------------------------------------------------------
-- CAFE TABLES policies
-- ------------------------------------------------------------

CREATE POLICY "cafe_tables: public read active"
  ON cafe_tables FOR SELECT
  USING (table_isactive = TRUE);

CREATE POLICY "cafe_tables: staff update"
  ON cafe_tables FOR UPDATE
  USING (get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "cafe_tables: admin all"
  ON cafe_tables FOR ALL
  USING (get_current_user_role() = 'admin');


-- ------------------------------------------------------------
-- RAW MATERIALS policies
-- ------------------------------------------------------------

CREATE POLICY "materials: staff read"
  ON raw_materials_inventory FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "materials: admin all"
  ON raw_materials_inventory FOR ALL
  USING (get_current_user_role() = 'admin');


-- ------------------------------------------------------------
-- PRODUCT RECIPE policies
-- ------------------------------------------------------------

CREATE POLICY "recipe: staff read"
  ON product_recipe FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "recipe: admin all"
  ON product_recipe FOR ALL
  USING (get_current_user_role() = 'admin');


-- ------------------------------------------------------------
-- TAX SETTINGS policies
-- ------------------------------------------------------------

CREATE POLICY "tax: staff read"
  ON tax_settings FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "tax: admin all"
  ON tax_settings FOR ALL
  USING (get_current_user_role() = 'admin');


-- ------------------------------------------------------------
-- OPERATING HOURS policies
-- ------------------------------------------------------------

CREATE POLICY "operating_hours: public read"
  ON operating_hours FOR SELECT
  USING (TRUE);

CREATE POLICY "operating_hours: admin all"
  ON operating_hours FOR ALL
  USING (get_current_user_role() = 'admin');


-- ------------------------------------------------------------
-- RESERVATIONS policies
-- ------------------------------------------------------------

CREATE POLICY "reservations: read own"
  ON reservations FOR SELECT
  USING (user_id = get_current_user_id());

CREATE POLICY "reservations: customer insert"
  ON reservations FOR INSERT
  WITH CHECK (user_id = get_current_user_id() OR user_id IS NULL);

CREATE POLICY "reservations: staff read all"
  ON reservations FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "reservations: staff update"
  ON reservations FOR UPDATE
  USING (get_current_user_role() IN ('admin', 'staff'));


-- ------------------------------------------------------------
-- ORDERS policies
-- ------------------------------------------------------------

CREATE POLICY "orders: read own"
  ON orders FOR SELECT
  USING (user_id = get_current_user_id());

-- Customers insert their own online/pick-up orders.
CREATE POLICY "orders: customer insert"
  ON orders FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

-- Staff insert walk-in POS orders (user_id may be NULL for  [FIX-POS]
-- anonymous cash customers who have no account).
CREATE POLICY "orders: staff insert"
  ON orders FOR INSERT
  WITH CHECK (get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "orders: staff read all"
  ON orders FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "orders: staff update"
  ON orders FOR UPDATE
  USING (get_current_user_role() IN ('admin', 'staff'));


-- ------------------------------------------------------------
-- ORDER ITEMS policies
-- ------------------------------------------------------------

CREATE POLICY "order_items: read own orders"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT order_id FROM public.orders WHERE user_id = get_current_user_id()
    )
  );

CREATE POLICY "order_items: customer insert"
  ON order_items FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT order_id FROM public.orders WHERE user_id = get_current_user_id()
    )
  );

CREATE POLICY "order_items: staff all"
  ON order_items FOR ALL
  USING (get_current_user_role() IN ('admin', 'staff'));


-- ------------------------------------------------------------
-- TRANSACTIONS policies
-- ------------------------------------------------------------

CREATE POLICY "transactions: read own"
  ON transactions FOR SELECT
  USING (
    order_id IN (
      SELECT order_id FROM public.orders WHERE user_id = get_current_user_id()
    )
  );

CREATE POLICY "transactions: staff all"
  ON transactions FOR ALL
  USING (get_current_user_role() IN ('admin', 'staff'));


-- ------------------------------------------------------------
-- REWARDS policies
-- ------------------------------------------------------------

CREATE POLICY "rewards: read own"
  ON rewards FOR SELECT
  USING (user_id = get_current_user_id());

CREATE POLICY "rewards: staff read all"
  ON rewards FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

-- Inserts handled exclusively by Trigger 2 (SECURITY DEFINER)
CREATE POLICY "rewards: no direct insert"
  ON rewards FOR INSERT
  WITH CHECK (FALSE);


-- ------------------------------------------------------------
-- POINTS CLAIM LOG policies
-- ------------------------------------------------------------

CREATE POLICY "points_claim_log: read own"
  ON points_claim_log FOR SELECT
  USING (user_id = get_current_user_id());

CREATE POLICY "points_claim_log: staff read all"
  ON points_claim_log FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

-- [P-1] Customer self-service OR staff/admin POS scan
CREATE POLICY "points_claim_log: customer or staff insert"
  ON points_claim_log FOR INSERT
  WITH CHECK (
    get_current_user_role() IN ('admin', 'staff')
    OR (
      get_current_user_role() = 'customer'
      AND user_id = get_current_user_id()
      AND transaction_id IN (
        SELECT t.transaction_id
        FROM transactions t
        JOIN orders o ON o.order_id = t.order_id
        WHERE o.user_id = get_current_user_id()
      )
      AND NOT EXISTS (
        SELECT 1 FROM transactions
        WHERE transaction_id = points_claim_log.transaction_id
          AND points_is_claimed = TRUE
      )
    )
  );


-- ------------------------------------------------------------
-- REWARD PRODUCTS policies
-- ------------------------------------------------------------

CREATE POLICY "reward_products: public read available"
  ON reward_products FOR SELECT
  USING (reward_is_available = TRUE);

CREATE POLICY "reward_products: admin all"
  ON reward_products FOR ALL
  USING (get_current_user_role() = 'admin');


-- ------------------------------------------------------------
-- REWARD REDEMPTIONS policies
-- ------------------------------------------------------------

CREATE POLICY "reward_redemptions: read own"
  ON reward_redemptions FOR SELECT
  USING (user_id = get_current_user_id());

CREATE POLICY "reward_redemptions: staff read all"
  ON reward_redemptions FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

-- Staff/admin processes the redemption after scanning customer QR
CREATE POLICY "reward_redemptions: staff insert"
  ON reward_redemptions FOR INSERT
  WITH CHECK (get_current_user_role() IN ('admin', 'staff'));


-- ------------------------------------------------------------
-- INVENTORY LOGS policies
-- ------------------------------------------------------------

CREATE POLICY "inventory_logs: staff read"
  ON inventory_logs FOR SELECT
  USING (get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "inventory_logs: admin insert"
  ON inventory_logs FOR INSERT
  WITH CHECK (get_current_user_role() IN ('admin', 'staff'));


-- ------------------------------------------------------------
-- ACTIVITY LOGS policies
-- ------------------------------------------------------------

CREATE POLICY "activity_logs: admin read"
  ON activity_logs FOR SELECT
  USING (get_current_user_role() = 'admin');

CREATE POLICY "activity_logs: staff insert"
  ON activity_logs FOR INSERT
  WITH CHECK (get_current_user_role() IN ('admin', 'staff'));


-- ------------------------------------------------------------
-- NOTIFICATIONS policies
-- ------------------------------------------------------------

CREATE POLICY "notifications: read own or broadcast"
  ON notifications FOR SELECT
  USING (
    user_id = get_current_user_id()
    OR (user_id IS NULL AND get_current_user_role() IN ('admin', 'staff'))
  );

CREATE POLICY "notifications: staff insert"
  ON notifications FOR INSERT
  WITH CHECK (get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "notifications: mark read"
  ON notifications FOR UPDATE
  USING (user_id = get_current_user_id());


-- ------------------------------------------------------------
-- FEEDBACKS policies
-- ------------------------------------------------------------

CREATE POLICY "feedbacks: public read"
  ON feedbacks FOR SELECT
  USING (TRUE);

CREATE POLICY "feedbacks: customer insert"
  ON feedbacks FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "feedbacks: admin all"
  ON feedbacks FOR ALL
  USING (get_current_user_role() = 'admin');


-- ------------------------------------------------------------
-- CMS CONTENT policies
-- ------------------------------------------------------------

CREATE POLICY "cms: public read published"
  ON cms_content FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "cms: admin all"
  ON cms_content FOR ALL
  USING (get_current_user_role() = 'admin');


-- ============================================================
-- REALTIME
-- Enables live frontend updates for reservations and
-- notifications via Supabase Realtime subscriptions.
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;


-- ============================================================
-- CMS SEED DATA
-- ============================================================

INSERT INTO cms_content (content_key, content_title, content_body, content_type, is_published)
VALUES
  ('home_hero_title',     'Home — hero heading',      'Welcome to Catsy Coffee',              'text', TRUE),
  ('home_hero_subtitle',  'Home — hero subheading',   'Brewed with love, served with care.',   'text', TRUE),
  ('home_about_body',     'About section body',       'We are a cozy café in the heart of the city.', 'text', TRUE),
  ('promo_banner',        'Promo banner',             NULL,                                    'text', FALSE),
  ('footer_address',      'Footer address line',      NULL,                                    'text', TRUE)
ON CONFLICT (content_key) DO NOTHING;


-- ============================================================
-- END OF SCHEMA v5 (patched)
-- ============================================================