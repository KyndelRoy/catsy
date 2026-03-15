# Catsy Coffee — DB Reference v4
**Platform:** Supabase (PostgreSQL 15+)

---

## 1. System Overview
Three surfaces: **customer portal** (reservations, orders, loyalty, account), **staff POS** (orders, payments, tables, inventory), **admin panel** (config, CMS, users, notifications). DB is single source of truth. Auth delegated to Supabase Auth — no passwords stored.

---

## 2. Architecture Principles

**2.1 Auth Delegation** — `public.users` mirrors `auth.users` via Trigger 1. Link: `users.auth_id = auth.users.id`.

**2.2 Trigger-Owned Fields** — Never set these from app code:

| Column | Table | Trigger |
|--------|-------|---------|
| `order_amount` | orders | T3 |
| `potential_points` | transactions | T11 |
| `material_updated` | raw_materials_inventory | T6 |
| `table_updated` | cafe_tables | T8 |
| `updated_at` | cms_content | T12 |
| `points_is_claimed` | transactions | T5 |
| `material_is_deficit` | raw_materials_inventory | T4 |

**2.3 Append-Only Tables** — `inventory_logs` and `activity_logs`: no UPDATE/DELETE ever.

**2.4 Soft vs Hard Delete (users)** — Soft: `user_isactive = FALSE` (preferred when FK children exist). Hard: admin-only; Trigger 13 deletes from `auth.users`, invalidating all sessions. App must check RESTRICT children first.

**2.5 Notifications** — `user_id = NULL` = broadcast (all admin/staff). Non-null = targeted. Triggers 4, 9, 10 all broadcast.

---

## 3. Enums

| Enum | Values |
|------|--------|
| `user_role` | `customer`, `staff`, `admin` |
| `order_status` | `pending`, `completed`, `failed`, `cancelled` |
| `order_type` | `dine-in`, `take-out`, `pick-up` |
| `reservation_status` | `pending`, `accepted`, `declined`, `cancelled` |
| `material_unit` | `g`, `ml`, `L`, `KG`, `unit` |
| `payment_method` | `cash`, `gcash`, `other` |
| `inventory_log_type` | `stock_in`, `stock_out` |
| `table_status` | `available`, `occupied`, `reserved`, `unavailable` |
| `notification_type` | `low_stock` (T4), `negative_feedback` (T9), `new_reservation` (T10), `general` |
| `action_type` | `LOGIN`, `LOGOUT`, `INVENTORY`, `PROCESS_SALE`, `UPDATE_PRODUCT`, `MANAGE_USER`, `UPDATE_TAX`, `UPDATE_PRICING`, `GENERATE_REPORT` |
| `feedback_category` | `Service`, `Food`, `Place` |

---

## 4. Table Reference

### 4.1 `users`
| Column | Type | Notes |
|--------|------|-------|
| `user_id` | SERIAL PK | |
| `auth_id` | UUID UNIQUE NOT NULL | FK to auth.users |
| `user_fname` | VARCHAR(255) NOT NULL | |
| `user_sname` | VARCHAR(255) NOT NULL | |
| `user_contact` | VARCHAR(11) | Optional PH mobile |
| `user_email` | VARCHAR(255) UNIQUE NOT NULL | |
| `user_username` | VARCHAR(255) UNIQUE NOT NULL | |
| `user_role` | user_role DEFAULT 'customer' | |
| `user_isactive` | BOOLEAN DEFAULT TRUE | Soft-delete flag |
| `user_created` | TIMESTAMPTZ DEFAULT NOW() | |

Rows created by T1 only. Hard delete blocked if feedbacks/points_claim_log/reward_redemptions exist.

---

### 4.2 `categories`
| Column | Type | Notes |
|--------|------|-------|
| `category_id` | SERIAL PK | |
| `category_name` | VARCHAR(150) NOT NULL | |
| `category_description` | TEXT | |
| `category_isactive` | BOOLEAN DEFAULT TRUE | Hides from public when FALSE |
| `category_created` | TIMESTAMPTZ DEFAULT NOW() | |

`products.category_id` → SET NULL on delete. Deleting category does not delete products.

---

### 4.3 `products`
| Column | Type | Notes |
|--------|------|-------|
| `product_id` | SERIAL PK | |
| `category_id` | INT FK→categories SET NULL | |
| `product_name` | VARCHAR(150) NOT NULL | |
| `product_description` | TEXT | |
| `product_price` | DECIMAL(10,2) >= 0 | Config-time price; historical price in order_items |
| `product_image_url` | TEXT | |
| `product_has_points` | BOOLEAN DEFAULT FALSE | |
| `product_points_value` | INT DEFAULT 0 >= 0 | |
| `product_is_featured` | BOOLEAN DEFAULT FALSE | |
| `product_is_available` | BOOLEAN DEFAULT TRUE | |
| `product_created` | TIMESTAMPTZ DEFAULT NOW() | |

Check: `product_has_points = TRUE OR product_points_value = 0`. Retire products via `product_is_available = FALSE` (hard delete blocked by order_items RESTRICT).

---

### 4.4 `cafe_tables`
| Column | Type | Notes |
|--------|------|-------|
| `table_id` | SERIAL PK | |
| `table_name` | VARCHAR(50) NOT NULL | |
| `table_seats` | SMALLINT > 0 | |
| `table_status` | table_status DEFAULT 'available' | |
| `table_isactive` | BOOLEAN DEFAULT TRUE | |
| `table_updated` | TIMESTAMPTZ | T8-managed, do not set manually |

Public can read active tables without auth.

---

### 4.5 `raw_materials_inventory`
| Column | Type | Notes |
|--------|------|-------|
| `material_id` | SERIAL PK | |
| `material_name` | VARCHAR(255) NOT NULL | |
| `material_unit` | material_unit NOT NULL | |
| `material_stock` | DECIMAL(10,2) DEFAULT 0 | Can go negative (by design) |
| `material_is_deficit` | BOOLEAN DEFAULT FALSE | TRUE when stock < 0; T4-managed |
| `material_reorder_level` | DECIMAL(10,2) >= 0, nullable | NULL = no low-stock alert |
| `material_updated` | TIMESTAMPTZ | T6-managed |

Negative stock is allowed — models real-world overage. `material_is_deficit` flags for staff review.

---

### 4.6 `product_recipe`
| Column | Type | Notes |
|--------|------|-------|
| `recipe_id` | SERIAL PK | |
| `product_id` | INT NOT NULL FK→products CASCADE | |
| `material_id` | INT NOT NULL FK→raw_materials_inventory RESTRICT | |
| `quantity_required` | DECIMAL(10,2) > 0 | Per unit consumed |

UNIQUE(product_id, material_id). Product with no recipe rows = no inventory deduction on order. Deleting a material used in recipes is blocked.

---

### 4.7 `tax_settings`
| Column | Type | Notes |
|--------|------|-------|
| `tax_id` | SERIAL PK | |
| `tax_name` | VARCHAR(255) NOT NULL | |
| `tax_rate` | DECIMAL(5,4) 0–1 | e.g., 0.12 = 12% |
| `tax_isactive` | BOOLEAN DEFAULT TRUE | |
| `tax_effective_date` | TIMESTAMPTZ | Optional |
| `tax_updated` | TIMESTAMPTZ DEFAULT NOW() | |

On transaction, snapshot both `tax_id` and `tax_rate` into transactions row for historical accuracy.

---

### 4.8 `operating_hours`
| Column | Type | Notes |
|--------|------|-------|
| `hours_id` | SERIAL PK | |
| `day_of_week` | SMALLINT 0–6 UNIQUE | 0=Sun, 6=Sat |
| `open_time` | TIME | NULL when closed |
| `close_time` | TIME | NULL when closed |
| `is_open` | BOOLEAN DEFAULT TRUE | |
| `hours_updated` | TIMESTAMPTZ DEFAULT NOW() | |

Seed exactly 7 rows via `ON CONFLICT (day_of_week) DO UPDATE`. Publicly readable without auth.

---

### 4.9 `reservations`
| Column | Type | Notes |
|--------|------|-------|
| `reservation_id` | SERIAL PK | |
| `user_id` | INT FK→users SET NULL, nullable | NULL = guest |
| `table_id` | INT FK→cafe_tables SET NULL, nullable | Assigned by staff on acceptance |
| `guest_fname/sname/email/contact` | VARCHAR | Required for guests |
| `guest_quantity` | SMALLINT 1–50 NOT NULL | |
| `reservation_date` | TIMESTAMPTZ NOT NULL | |
| `reservation_status` | reservation_status DEFAULT 'pending' | |
| `reservation_notes` | TEXT | |
| `reservation_created` | TIMESTAMPTZ DEFAULT NOW() | |

`table_id` = NULL at submission; staff assigns on acceptance. T10 broadcasts `new_reservation` on every INSERT. Guest `guest_email` required for e-invoice.

---

### 4.10 `orders`
| Column | Type | Notes |
|--------|------|-------|
| `order_id` | SERIAL PK | |
| `user_id` | INT FK→users SET NULL, nullable | NULL = anonymous/walk-in |
| `reservation_id` | INT FK→reservations SET NULL, nullable | |
| `order_type` | order_type DEFAULT 'dine-in' | |
| `order_date` | TIMESTAMPTZ DEFAULT NOW() | |
| `scheduled_pickup_time` | TIMESTAMPTZ | Only for pick-up orders |
| `order_status` | order_status DEFAULT 'pending' | |
| `order_amount` | DECIMAL(10,2) DEFAULT 0 >= 0 | T3-managed |

Transition to `completed` triggers T4 (inventory deduction). Only do this after payment confirmed.

---

### 4.11 `order_items`
| Column | Type | Notes |
|--------|------|-------|
| `order_item_id` | SERIAL PK | |
| `order_id` | INT NOT NULL FK→orders CASCADE | |
| `product_id` | INT NOT NULL FK→products RESTRICT | |
| `order_item_quantity` | INT > 0 NOT NULL | |
| `order_price` | DECIMAL(10,2) >= 0 NOT NULL | Price snapshot at order time |

Any change fires T3 (recalculates order_amount). Order delete cascades to items; product delete blocked.

---

### 4.12 `transactions`
| Column | Type | Notes |
|--------|------|-------|
| `transaction_id` | SERIAL PK | |
| `order_id` | INT UNIQUE NOT NULL FK→orders | 1:1 with orders |
| `tax_id` | INT NOT NULL FK→tax_settings | |
| `gross_amount` | DECIMAL(10,2) >= 0 | Pre-tax |
| `tax_rate` | DECIMAL(5,4) 0–1 | Snapshot at sale time |
| `tax_amount` | DECIMAL(10,2) >= 0 | |
| `net_amount` | DECIMAL(10,2) >= 0 | After-tax |
| `payment_method` | payment_method NOT NULL | |
| `cash` | DECIMAL(10,2) >= 0, nullable | Cash payments only |
| `change` | DECIMAL(10,2) >= 0, nullable | |
| `claim_code` | VARCHAR(255) UNIQUE, nullable | Receipt code for points claiming |
| `potential_points` | INT DEFAULT 0 >= 0 | T11-managed (BEFORE INSERT) |
| `points_is_claimed` | BOOLEAN DEFAULT FALSE | T5-managed; never set directly |
| `transaction_date` | TIMESTAMPTZ DEFAULT NOW() | |

Pass `0` or `DEFAULT` for `potential_points`. `claim_code` is printed on receipt.

---

### 4.13 `rewards`
| Column | Type | Notes |
|--------|------|-------|
| `reward_id` | SERIAL PK | |
| `user_id` | INT UNIQUE NOT NULL FK→users CASCADE | 1:1 with customers |
| `point_count` | INT DEFAULT 0 >= 0 | T5 credits, T7 debits |
| `total_redeemed` | INT DEFAULT 0 >= 0 | Lifetime points spent |
| `last_purchase` | TIMESTAMPTZ | Updated by T5 on claim |

Created by T2 on customer registration. Never manually inserted.

---

### 4.14 `points_claim_log`
| Column | Type | Notes |
|--------|------|-------|
| `claim_id` | SERIAL PK | |
| `transaction_id` | INT UNIQUE NOT NULL FK→transactions RESTRICT | One claim per receipt |
| `user_id` | INT NOT NULL FK→users RESTRICT | |
| `reward_id` | INT NOT NULL FK→rewards RESTRICT | |
| `points_earned` | INT DEFAULT 0 >= 0 | |
| `claim_date` | TIMESTAMPTZ DEFAULT NOW() | |

UNIQUE on `transaction_id` prevents double-claiming. Insert triggers T5 (credits points, sets `points_is_claimed`). Two insert paths: staff POS scan or customer self-service (RLS policy P-1 validates ownership + unclaimed).

---

### 4.15 `reward_products`
| Column | Type | Notes |
|--------|------|-------|
| `reward_product_id` | SERIAL PK | |
| `product_id` | INT NOT NULL FK→products CASCADE | UNIQUE — one reward entry per product |
| `points_required` | INT > 0 | Cost in points |
| `reward_is_available` | BOOLEAN DEFAULT TRUE | Toggle visibility |
| `reward_created` | TIMESTAMPTZ DEFAULT NOW() | |

---

### 4.16 `reward_redemptions`
| Column | Type | Notes |
|--------|------|-------|
| `redemption_id` | SERIAL PK | |
| `user_id` | INT NOT NULL FK→users RESTRICT | |
| `reward_product_id` | INT NOT NULL FK→reward_products RESTRICT | |
| `points_spent` | INT > 0 | |
| `redeemed_at` | TIMESTAMPTZ DEFAULT NOW() | |

Staff-only INSERT (customer presents QR, staff scans). T7 deducts points. `CHECK(point_count >= 0)` on rewards is final safety net.

---

### 4.17 `inventory_logs` (append-only)
| Column | Type | Notes |
|--------|------|-------|
| `inventory_log_id` | SERIAL PK | |
| `material_id` | INT NOT NULL FK→raw_materials_inventory RESTRICT | |
| `user_id` | INT FK→users SET NULL | NULL for trigger-generated entries |
| `log_type` | inventory_log_type NOT NULL | |
| `qty_change` | DECIMAL(10,2) NOT NULL | Positive=in, negative=out |
| `balance_after` | DECIMAL(10,2) NOT NULL | May be negative |
| `inventory_log_time` | TIMESTAMPTZ DEFAULT NOW() | |

Auto stock_out rows from T4. Manual stock_in from staff/admin.

---

### 4.18 `activity_logs` (append-only)
| Column | Type | Notes |
|--------|------|-------|
| `activity_id` | SERIAL PK | |
| `user_id` | INT FK→users SET NULL | SET NULL on deletion preserves log |
| `action_type` | action_type NOT NULL | |
| `activity_details` | TEXT | |
| `created_at` | TIMESTAMPTZ DEFAULT NOW() | |

App layer inserts; no triggers write here. Admin reads only.

---

### 4.19 `notifications`
| Column | Type | Notes |
|--------|------|-------|
| `notification_id` | SERIAL PK | |
| `user_id` | INT FK→users CASCADE, nullable | NULL = broadcast |
| `notification_type` | notification_type NOT NULL | |
| `title` | VARCHAR(255) NOT NULL | |
| `message` | TEXT NOT NULL | |
| `is_read` | BOOLEAN DEFAULT FALSE | Single flag — no per-reader state for broadcasts |
| `created_at` | TIMESTAMPTZ DEFAULT NOW() | |

Broadcasts readable by any admin/staff. Marking broadcast read affects all readers (known limitation — see §12.4).

---

### 4.20 `feedbacks`
| Column | Type | Notes |
|--------|------|-------|
| `feedback_id` | SERIAL PK | |
| `user_id` | INT NOT NULL FK→users RESTRICT | Authenticated only |
| `transaction_id` | INT FK→transactions SET NULL | |
| `rating` | SMALLINT 1–5 NOT NULL | |
| `comments` | TEXT | |
| `category` | feedback_category NOT NULL | |
| `feedback_date` | TIMESTAMPTZ DEFAULT NOW() | |

UNIQUE(user_id, transaction_id, category) — max 3 reviews per transaction. T9 broadcasts `negative_feedback` if rating ≤ 2, includes first 100 chars of comments.

---

### 4.21 `cms_content`
| Column | Type | Notes |
|--------|------|-------|
| `content_id` | SERIAL PK | |
| `content_key` | VARCHAR(100) UNIQUE NOT NULL | Stable frontend identifier |
| `content_title` | VARCHAR(255) | CMS display label |
| `content_body` | TEXT | |
| `content_type` | VARCHAR(50) DEFAULT 'text' | `text`, `html`, `markdown`, `image_url` |
| `is_published` | BOOLEAN DEFAULT TRUE | FALSE = draft, hidden from public |
| `updated_by` | INT FK→users SET NULL | |
| `updated_at` | TIMESTAMPTZ | T12-managed |

Pre-seeded keys: `home_hero_title`, `home_hero_subtitle`, `home_about_body` (published), `promo_banner` (draft), `footer_address` (published). No content versioning.

---

## 5. Entity Relationships (FK Table)

| Child Column | Parent | On Delete |
|---|---|---|
| `products.category_id` | categories | SET NULL |
| `product_recipe.product_id` | products | CASCADE |
| `product_recipe.material_id` | raw_materials_inventory | RESTRICT |
| `orders.user_id` | users | SET NULL |
| `orders.reservation_id` | reservations | SET NULL |
| `order_items.order_id` | orders | CASCADE |
| `order_items.product_id` | products | RESTRICT |
| `transactions.order_id` | orders | implicit RESTRICT |
| `rewards.user_id` | users | CASCADE |
| `points_claim_log.transaction_id` | transactions | RESTRICT |
| `points_claim_log.user_id` | users | RESTRICT |
| `points_claim_log.reward_id` | rewards | RESTRICT |
| `reward_products.product_id` | products | CASCADE |
| `reward_redemptions.user_id` | users | RESTRICT |
| `reward_redemptions.reward_product_id` | reward_products | RESTRICT |
| `inventory_logs.material_id` | raw_materials_inventory | RESTRICT |
| `inventory_logs.user_id` | users | SET NULL |
| `activity_logs.user_id` | users | SET NULL |
| `notifications.user_id` | users | CASCADE |
| `feedbacks.user_id` | users | RESTRICT |
| `feedbacks.transaction_id` | transactions | SET NULL |
| `reservations.user_id` | users | SET NULL |
| `reservations.table_id` | cafe_tables | SET NULL |
| `cms_content.updated_by` | users | SET NULL |

---

## 6. Trigger Reference

All triggers: `SECURITY DEFINER`.

| # | Table | Event | Condition | Action |
|---|-------|-------|-----------|--------|
| T1 | auth.users | AFTER INSERT | — | Creates public.users row from metadata; role='customer' |
| T2 | public.users | AFTER INSERT | role='customer' | Creates rewards row (point_count=0) |
| T3 | order_items | AFTER I/U/D | — | Recalculates orders.order_amount = SUM(qty * price) |
| T4 | orders | AFTER UPDATE | status: any→completed | Deducts inventory per recipe, logs stock_out, fires low_stock notification if below reorder_level and no existing unread alert |
| T5 | points_claim_log | AFTER INSERT | — | rewards.point_count += points_earned; last_purchase = NOW(); transactions.points_is_claimed = TRUE |
| T6 | raw_materials_inventory | BEFORE UPDATE | — | Sets material_updated = NOW() |
| T7 | reward_redemptions | AFTER INSERT | — | rewards.point_count -= points_spent; total_redeemed += points_spent |
| T8 | cafe_tables | BEFORE UPDATE | — | Sets table_updated = NOW() |
| T9 | feedbacks | AFTER INSERT | rating <= 2 | Broadcasts negative_feedback notification |
| T10 | reservations | AFTER INSERT | — | Broadcasts new_reservation notification with name, party size, date |
| T11 | transactions | BEFORE INSERT | — | Computes potential_points = SUM(qty * points_value) for points-eligible items |
| T12 | cms_content | BEFORE UPDATE | — | Sets updated_at = NOW() |
| T13 | public.users | AFTER DELETE | — | Deletes auth.users row by auth_id; invalidates all sessions |

---

## 7. Business Logic Flows

### 7.1 Registration
`Supabase Auth signup → T1: public.users INSERT (role=customer) → T2: rewards INSERT (point_count=0)`

### 7.2 Order & Payment
`Create order → Add items (T3 updates order_amount each time) → Mark completed (T4 deducts inventory) → Insert transaction (T11 sets potential_points) → Print receipt with claim_code`

### 7.3 Inventory Deduction (T4)
For each order_item → each recipe row: `deduction = qty_required × item_qty` → update material_stock → log stock_out → if stock < reorder_level AND no unread low_stock alert → broadcast notification.

### 7.4 Points Earning
`Customer inputs claim_code → app validates ownership + points_is_claimed=FALSE → INSERT points_claim_log → T5: credits points, marks claimed`

Double-claim blocked by: UNIQUE(transaction_id), RLS P-1 checking points_is_claimed=FALSE, T5 having set it TRUE.

### 7.5 Reward Redemption
`Customer views rewards → generates QR → staff scans → app validates balance ≥ points_required → INSERT reward_redemptions → T7: deducts points`
CHECK(point_count >= 0) is DB-level safety net.

### 7.6 Reservation
- **Authenticated:** INSERT reservations (user_id set) → T10 broadcasts → customer pre-orders → staff accepts + assigns table
- **Guest:** INSERT reservations (user_id=NULL, guest_email required) → T10 broadcasts → system emails guest

### 7.7 Feedback
`Customer submits feedback → UNIQUE constraint limits to 1 per category per transaction → T9 broadcasts if rating ≤ 2`

---

## 8. Row-Level Security

Helper functions: `get_current_user_id()` → INT, `get_current_user_role()` → user_role.

| Table | Anonymous | Customer | Staff | Admin |
|-------|-----------|----------|-------|-------|
| users | — | Own (R/U) | All (R) | All (R/U/D) |
| categories | Active (R) | Active (R) | Active (R) | Full |
| products | Available (R) | Available (R) | Available (R) | Full |
| cafe_tables | Active (R) | Active (R) | R + status update | Full |
| raw_materials_inventory | — | — | R | Full |
| product_recipe | — | — | R | Full |
| tax_settings | — | — | R | Full |
| operating_hours | R | R | R | Full |
| reservations | Insert (guest) | Own + Insert | All (R/U) | All |
| orders | — | Own + Insert | All (R/U) | All |
| order_items | — | Own orders (R/I) | All | All |
| transactions | — | Own orders (R) | All | All |
| rewards | — | Own (R) | R all | All |
| points_claim_log | — | Own + Insert (P-1) | All + Insert | All |
| reward_products | Available (R) | Available (R) | Available (R) | Full |
| reward_redemptions | — | Own (R) | R + Insert | All |
| inventory_logs | — | — | R + Insert | Full |
| activity_logs | — | — | Insert | R + Insert |
| notifications | — | — | Own/Broadcast (R/U) | Own/Broadcast (R/U) |
| feedbacks | R | R + Insert own | R | Full |
| cms_content | Published (R) | Published (R) | Published (R) | Full |

**Policy P-1 (points_claim_log customer insert):** user_id = self AND transaction belongs to own order AND points_is_claimed = FALSE.

---

## 9. Indexes

| Index | Table | Column(s) |
|-------|-------|-----------|
| idx_users_auth_id | users | auth_id |
| idx_users_email | users | user_email |
| idx_products_category | products | category_id |
| idx_products_available | products | product_is_available |
| idx_order_items_order | order_items | order_id |
| idx_order_items_product | order_items | product_id |
| idx_orders_user | orders | user_id |
| idx_orders_status | orders | order_status |
| idx_orders_date | orders | order_date |
| idx_transactions_order | transactions | order_id |
| idx_transactions_date | transactions | transaction_date |
| idx_transactions_claim_code | transactions | claim_code |
| idx_reservations_user | reservations | user_id |
| idx_reservations_date | reservations | reservation_date |
| idx_inventory_logs_mat | inventory_logs | material_id |
| idx_activity_logs_user | activity_logs | user_id |
| idx_points_claim_user | points_claim_log | user_id |
| idx_cafe_tables_status | cafe_tables | table_status |
| idx_notifications_user | notifications | user_id |
| idx_notifications_read | notifications | is_read |
| idx_reward_redemptions_user | reward_redemptions | user_id |
| idx_feedbacks_user | feedbacks | user_id |
| idx_feedbacks_transaction | feedbacks | transaction_id |
| idx_cms_content_key | cms_content | content_key |
| idx_cms_content_published | cms_content | is_published |

---

## 10. Constraints

### Check Constraints (non-obvious ones)
- `products`: `product_has_points = TRUE OR product_points_value = 0`
- `tax_settings.tax_rate`: 0–1
- `operating_hours.day_of_week`: 0–6
- `reservations.guest_quantity`: 1–50
- `feedbacks.rating`: 1–5
- `cms_content.content_type`: IN ('text','html','markdown','image_url')
- All monetary/qty columns: >= 0 or > 0 as appropriate

### Unique Constraints
`users`: auth_id, user_email, user_username | `operating_hours`: day_of_week | `transactions`: order_id, claim_code | `rewards`: user_id | `points_claim_log`: transaction_id | `product_recipe`: (product_id, material_id) | `reward_products`: product_id | `feedbacks`: (user_id, transaction_id, category) | `cms_content`: content_key

---

## 11. Design Decisions & Tradeoffs

| # | Decision | Rationale |
|---|----------|-----------|
| 12.1 | Denormalized price & tax_rate in transactions | Historical accuracy — future price/tax changes don't affect past records |
| 12.2 | Negative stock allowed | Busy café shouldn't reject orders at DB level; `material_is_deficit` flags for staff |
| 12.3 | 1:1 orders→transactions | No split payment support in v4; restructure needed if required |
| 12.4 | Single `is_read` for broadcasts | No per-reader state; marking read affects all — known limitation |
| 12.5 | Redemption is staff-gated | Prevents fraudulent self-service; physical presence required |
| 12.6 | Points require a claim_code | No points without a receipt; loyalty requires an account |
| 12.7 | No CMS versioning | Current value only; add `cms_content_revisions` table if needed |
| 12.8 | Guests excluded from rewards | Loyalty requires an authenticated account |