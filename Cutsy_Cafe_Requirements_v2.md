# Cutsy Cafe POS System — Requirements Specification

---

## 1. Business Requirements

- **Payment First Policy:** All online orders and reservations require payment before processing. No exceptions.
- **No Refund Policy:** Once a payment is made, no refunds will be issued under any circumstances.
- **Reward System:** Point-based system. Customers earn fixed points per product purchased (e.g., Latte = 1 point). Points can be redeemed for free products from the reward pool (e.g., Spanish Latte = 9 points). If the customer does not have sufficient points, they cannot claim the reward. No monetary discounts are offered; free products are the only reward form.
- **Invoice / Receipt:** Each transaction generates a unique invoice code. This code is used by customers to claim reward points and leave a review. The terms *invoice* and *receipt* refer to the same document.
- **Dine-In Style:** Table service is the standard business policy for dine-in. Orders may be held before payment for dine-in transactions.

---

## 2. User Roles Overview

The POS system serves three distinct roles. Each role has a defined scope of access.

| Role | Access |
|---|---|
| Admin | Full access to all system functions including management, POS, and the admin panel. |
| Staff | Access to the Point of Sale application and the customer portal. Cannot access the admin panel. |
| Customer | Access is restricted to the customer-facing portal only. |

---

## 3. Functional Requirements

### 3.1 Customer Requirements

#### 3.1.1 Login and Sign-Up

Customers may create an account or sign in to the web portal. New accounts start with zero reward points.

Required sign-up fields:

- First Name
- Last Name
- Email
- Username

#### 3.1.2 View Website and Menu

Customers may browse the website and view the menu without logging in.

#### 3.1.3 View Vacancy Status

Customers may view the live vacancy status of the cafe, including available time slots and seats.

#### 3.1.4 Reservation

Customers may reserve a table either as a guest or as a logged-in user.

**Guest Reservation Process:**

1. Input First Name, Last Name, Email, and Party Size.
2. Select arrival time from a 30-minute interval dropdown (e.g., 5:30–6:00, 6:00–6:30). Reservations are limited to the current day only.
3. Choose and finalize orders. At least one product must be purchased to reserve a seat.
4. Wait for staff approval.
5. Complete payment within 10 minutes of approval. Orders not paid within this window are automatically cancelled. Customer is notified of the cancellation via email.
6. Receive invoice via email. The invoice code may later be used to retroactively claim reward points by creating an account, as long as the code has not expired.

**Logged-In Reservation Process:**

Customer information is auto-filled. The same process applies: select order, wait for staff approval, pay within 10 minutes, and receive an invoice. Reward points are automatically credited to the account after successful payment.

**Additional Reservation Rules:**

- Reservations are limited to the current day only. No advance reservations for future dates.
- Maximum party size is 8. Larger groups must make separate reservations.
- Seat assignment is handled manually by staff.
- Availability is managed on a first-come, first-served basis.
- A slot is considered full when the total reserved party size meets or exceeds the remaining seat capacity. For example, if only 4 seats remain (two 2-seater tables), a party of 5 or more cannot be accommodated for that slot.
- Customers may cancel their reservation only while it remains unpaid.

#### 3.1.5 Order Pick-Up

Customers may place pre-orders for pick-up online. Payment is required before the order is confirmed.

**Pick-Up Status Flow:** `pending → approved → awaiting payment → paid → ready → completed / cancelled`

**Pick-Up Time Options:**

- **ASAP:** Order ready in approximately 15 minutes.
- **Scheduled:** Customer selects a specific time from a 15-minute interval dropdown.

After a successful payment, the customer receives an invoice as their order reference. Customers are notified of pick-up order status updates via email.

#### 3.1.6 Reward System

Customers must have an account to view or earn reward points.

**Earning Points:**

- Points are fixed per product (e.g., Coffee = 1 point). The points value is defined by the admin per product.
- Logged-in customers earn points automatically upon successful payment.
- Points can also be claimed retroactively by inputting the unique invoice code into a logged-in account. This is available to guests who later create an account.
- Each invoice code is valid for one-time use only and becomes void after redemption. The code expires 3 days from the date of issue.

**Redeeming Points:**

- Each redeemable product has a defined point cost set by the admin. Customers must have sufficient points to claim a reward.
- Upon redemption, the customer receives a reward voucher code valid for 2 days.
- Reward vouchers can only be claimed in person. Online redemption is not supported.
- Voucher codes are voided after the 2-day validity window.

#### 3.1.7 View Purchase History

Purchase history is recorded when a customer has placed an online order (reservation or pick-up), or has inputted or scanned an invoice code to claim points. Leaving a rating and feedback is optional.

#### 3.1.8 View Live Location

Customers may view the cafe location on an online map. This feature is informational only and is not stored in the database.

#### 3.1.9 Reviews and Ratings

To leave a review, customers must input or scan the QR code from their invoice. A registered account is required to submit a rating.

**Rating Categories:**

- Product
- Place
- Service

Each category is rated on a scale of 1 to 5. A single visit may generate up to three review rows, one per category. Reviews are one-time per invoice; the code is voided after submission.

#### 3.1.10 Tax Handling

The system must apply tax calculations on all applicable transactions. The tax rate is a single fixed percentage configured by the admin (e.g., 12% VAT). The rate can be updated if legislation changes; historical rates are preserved for accurate invoice records. Tax is stored as a system-wide configuration.

#### 3.1.11 Payment Methods

- **In-Person (Dine-In / Take-Out):** Cash, Digital Wallet (GCash, PayMaya).
- **Online (Reservation / Pick-Up):** E-Wallet only (GCash, PayMaya). No cash payment accepted for online orders. Payment is required before the order is processed.

---

### 3.2 Staff Requirements

#### 3.2.1 Login

Staff must log in before accessing the POS application or the customer portal. Only an admin may create or modify staff accounts. Staff cannot access the admin panel.

#### 3.2.2 Process Orders

Staff shall process sales for each completed order and generate a receipt for every successful transaction.

#### 3.2.3 Order Modification

Staff may modify orders before they are finalized.

#### 3.2.4 Manage Reservations

Staff shall view, approve, and manage customer reservations. Upon approving a reservation, the 10-minute payment countdown begins. Staff are notified in-app of all new reservation requests.

#### 3.2.5 Update Table Availability

Staff may manually toggle tables between occupied and vacant. Seat assignment for reservations is also handled manually by staff. The cafe has one 6-seater table and five 2-seater tables (six tables total).

#### 3.2.6 View Inventory

Staff shall view current stock levels and receive in-app notifications when inventory falls below the low-stock threshold.

#### 3.2.7 View Order History and Transactions

Staff shall view past orders and transaction records.

#### 3.2.8 Manage Pick-Up Orders

Staff are notified in-app when a new pick-up order is received. Staff approve the order and update its status as it progresses through the flow: `pending → approved → awaiting payment → paid → ready → completed`.

#### 3.2.9 Validate Reward Vouchers

Staff shall validate customer reward voucher codes in person and process the associated free product as a zero-cost order. Inventory is deducted accordingly and the redemption is saved in the redemption history. Vouchers cannot be redeemed online.

---

### 3.3 Admin Requirements

#### 3.3.1 Login

The admin must log in before accessing the admin panel. The admin has full access to the admin panel, the POS, and the customer portal.

#### 3.3.2 Manage Operating Hours and Schedule

The admin may configure which days of the week the cafe is open or closed, and set the available hours for each day. Operating hours are toggled per day of the week. Per-date overrides for specific dates are not supported.

#### 3.3.3 Management (CRUD)

The admin shall perform full Create, Read, Update, and Delete operations on:

- **Products** — including size variants (Small, Medium, Large), each with its own price, and the points earned per unit.
- **Reward Pool** — the admin selects which products are redeemable and sets the point cost for each. Reward pool items are regular menu products tagged as redeemable.
- **Inventory / Ingredients** — including stock levels, units, and low-stock thresholds.
- **Staff Accounts** — only the admin may create or modify staff accounts.

#### 3.3.4 Notifications

The admin shall receive in-app notifications for:

- Low inventory stock alerts
- Negative customer feedback
- New reservation requests
- New pick-up orders

#### 3.3.5 View Transaction History

The admin shall have access to a complete view of all transaction history across all order types and channels.

---

## 4. System Rules and Business Logic

### 4.1 Order Status Flows

Each order type follows a defined status sequence:

| Order Type | Status Flow |
|---|---|
| Dine-In | `open → pending → paid → completed` |
| Take-Out | `open → pending → paid → completed` |
| Pick-Up | `pending → approved → awaiting payment → paid → ready → completed / cancelled` |
| Reservation | `pending → approved → awaiting payment → paid → completed / cancelled` |

For dine-in and take-out, orders are created by staff and may be held in an open state before payment. There is no advance approval step.

For pick-up and reservation orders, staff must approve before the customer is prompted to pay.

### 4.2 Payment Window

Once a pick-up or reservation order is approved by staff, the customer has 10 minutes to complete payment. If payment is not received within this window, the order is automatically cancelled and the customer is notified via email.

### 4.3 Seating and Capacity

The cafe has the following table configuration:

| Table | Seats |
|---|---|
| T1 | 6 |
| T2 | 2 |
| T3 | 2 |
| T4 | 2 |
| T5 | 2 |
| T6 | 2 |
| **Total** | **16** |

Reservation availability is determined by total remaining seat capacity for the selected time slot. If a party size exceeds the remaining available capacity, the reservation cannot be made. For example, if only two 2-seater tables are available (4 seats), the system will not accept a party of 5 or more.

A party spanning two table types (e.g., 7 people requiring the 6-seater and one 2-seater) may be assigned multiple tables at the staff's discretion. Staff assign tables manually.

Availability is first-come, first-served. Maximum party size per reservation is 8.

### 4.4 Products and Inventory

- Products support size variants: Small, Medium, and Large. Each size has its own independently configured price.
- Each product is linked to one or more inventory ingredients. A sale deducts the corresponding ingredient quantities.
- If an ingredient is insufficient at the time of sale, the order is still allowed to proceed, but the ingredient is flagged as a deficit.
- Products are grouped by category.

### 4.5 Reward System

- Points are fixed per product, defined by the admin.
- Points are credited automatically for logged-in customers upon successful payment.
- Retroactive point claiming is available by inputting a valid invoice code into a logged-in account. Invoice codes for point redemption expire 3 days from the date of issue.
- Each invoice code is one-time use and is voided after redemption.
- Reward vouchers are valid for 2 days and can only be redeemed in person at the cafe.
- Voucher redemption is processed by staff as a zero-cost order. Inventory is deducted and the redemption is logged in the redemption history.
- Only products tagged as redeemable by the admin appear in the reward pool. Each redeemable product has its own point cost.

### 4.6 Invoice and Reviews

- Scanning or inputting an invoice code triggers point crediting (if applicable) and prompts the customer to leave a review.
- If the order carries no points, the customer is still asked to leave a review.
- Ratings are required (1 to 5 scale). Written feedback is optional.
- Up to three review rows per transaction: one per category (Product, Place, Service).
- Each invoice code is one-time use. Once scanned or inputted, the code is voided.

### 4.7 Notifications

**In-App Notifications** (stored in database, shown in interface):

- Admin: low stock alerts, negative customer feedback, new reservations, new pick-up orders.
- Staff: low stock alerts, new reservations, new pick-up orders.

**Email Notifications** (sent by the application to the customer):

- Reservation confirmation and invoice after successful payment.
- Pick-up order status updates.
- Order cancellation (auto-cancel after 10-minute payment window expires).

### 4.8 Payment

- Online payments (reservation and pick-up): GCash and PayMaya only. No cash accepted.
- In-person payments (dine-in and take-out): Cash, GCash, and PayMaya.
- A payment transaction reference number (e.g., GCash or PayMaya reference) is stored for all digital payments.
- No refunds are issued under any circumstances once payment is completed.

### 4.9 Authentication and Access Control

- Supabase handles the database and all password management.
- Admin: full access to admin panel, POS, and customer portal.
- Staff: access to POS and customer portal. No access to the admin panel.
- Customer: access to the customer portal only.
- All primary key IDs are serial integers.

### 4.10 Cafe Table Reference

Physical table layout for reference:

| Table | Seats |
|---|---|
| T1 | 6 |
| T2 | 2 |
| T3 | 2 |
| T4 | 2 |
| T5 | 2 |
| T6 | 2 |
| **Total** | **16** |

---

## 5. Tooling

| Tool | Purpose |
|---|---|
| **Supabase** | PostgreSQL database, Auth, Edge Functions, Realtime, Storage, pg_cron, webhooks |
| **Resend** | Transactional emails (invoices, order status, cancellations) |
| **Paymongo** | GCash + Maya payment processing |
