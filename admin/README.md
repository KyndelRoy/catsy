# Catsy Admin Panel

The admin dashboard for managing the Catsy Coffee shop. Built with React, Vite, and TailwindCSS.

This app connects to the same FastAPI backend used by `catsy-web` and `catsy-mobile`. It runs on its own port (5174) so you can use it alongside the customer-facing web app.

---

## What This App Does

The admin panel lets staff and admins manage daily coffee shop operations:

| Page             | What it does                                                    |
|------------------|-----------------------------------------------------------------|
| **Dashboard**    | See today's sales, active reservations, stock alerts, and notifications at a glance |
| **Products**     | Add, edit, delete products. Upload images. Bulk actions. Link materials to products |
| **Inventory**    | Track raw materials (beans, milk, cups, etc.) with stock levels and reorder alerts |
| **Reservations** | View reservations in list or calendar view. Create walk-in bookings. Confirm/cancel/complete |
| **Notifications**| System alerts for low stock, new bookings, cancellations, out-of-stock products |
| **Analysis**     | ML-powered charts: demand forecasting, revenue prediction, stock depletion, recommendations |

---

## Prerequisites

Before you start, make sure you have these installed on your computer:

| Tool         | Minimum Version | How to check            | How to install                          |
|--------------|-----------------|-------------------------|-----------------------------------------|
| **Node.js**  | 18 or higher    | `node --version`        | https://nodejs.org (download the LTS version) |
| **npm**      | 9 or higher     | `npm --version`         | Comes with Node.js automatically        |
| **Git**      | Any version     | `git --version`         | https://git-scm.com                     |

You also need the **catsy-backend** server running. See the main project `README.md` in the root CATSY folder for backend setup.

---

## Setup (First Time Only)

Open a terminal and follow these steps one by one.

### 1. Navigate to the admin folder

```bash
cd catsy-admin
```

If you're in the root CATSY folder, this takes you into the admin app directory.

### 2. Install dependencies

```bash
npm install
```

This downloads all the libraries the app needs. It creates a `node_modules` folder — don't touch or delete this folder manually.

This step only needs to be done once (or again if someone adds new packages).

### 3. Set up environment variables

Create a file called `.env` in the `catsy-admin` folder:

```bash
# catsy-admin/.env
VITE_API_URL=http://127.0.0.1:8000
```

This tells the admin app where to find the backend server. If your backend runs on a different address or port, change this value.

> **Important:** Never share or commit your `.env` file to Git. It's already in `.gitignore`.

### 4. Start the app

```bash
npm run dev
```

You should see output like:

```
VITE ready in 139 ms
  ➜  Local:   http://localhost:5174/
```

Open **http://localhost:5174** in your browser. You'll see the login page.

---

## How to Use

### Logging In

Use the same admin/staff credentials from the Catsy system. Enter your email and password on the login page.

Only users with `admin` or `staff` roles can log in. Customer accounts will be rejected.

### Development Admin Account

For local development and testing, you can use the built-in dev admin user:

- Email: `admin@catsy.com`
- Password: `admin123`

This account is hard-coded in `authService.js` and should be removed or changed before deploying to production.

### Navigating

- **Desktop**: Use the dark sidebar on the left to switch between pages
- **Mobile/Tablet**: Use the bottom tab bar at the bottom of the screen
- The sidebar can be collapsed by clicking the arrow icon at the top

### Header Bar

The top bar has four controls (from left to right):

| Control              | What it does                                      |
|----------------------|---------------------------------------------------|
| **Search icon**      | Click to open a search bar that filters the current page |
| **Sun/Moon icon**    | Toggle between light mode and dark mode           |
| **Bell icon**        | Shows recent notifications. Red badge = unread count |
| **User icon**        | Shows your name and a sign-out button             |

### Dark Mode

Click the sun/moon icon in the header to switch themes. Your preference is saved automatically — it will remember your choice next time you open the app.

---

## Project Structure

Here's what each folder and file does:

```
catsy-admin/
├── public/                    # Static files (images, favicon)
├── src/                       # All source code lives here
│   ├── main.jsx               # App entry point — sets up providers and router
│   ├── App.jsx                # Defines all page routes
│   ├── index.css              # Global styles, theme colors, fonts
│   │
│   ├── layouts/               # Shared UI that wraps every page
│   │   ├── AdminLayout.jsx    # Main shell: sidebar + header + content area
│   │   ├── Sidebar.jsx        # Left sidebar navigation (desktop)
│   │   ├── Header.jsx         # Top bar: search, theme toggle, bell, profile
│   │   └── MobileBottomNav.jsx# Bottom tab bar (mobile/tablet)
│   │
│   ├── pages/                 # One file per page/screen
│   │   ├── LoginPage.jsx      # Login form
│   │   ├── DashboardPage.jsx  # Overview with stat cards + reservations
│   │   ├── ProductsPage.jsx   # Product table with filters and bulk actions
│   │   ├── InventoryPage.jsx  # Material stock management table
│   │   ├── ReservationsPage.jsx # List + calendar views for bookings
│   │   ├── NotificationsPage.jsx # System notification feed
│   │   └── AnalysisPage.jsx   # ML charts and predictions
│   │
│   ├── components/            # Reusable UI pieces (buttons, modals, etc.)
│   │   ├── ui/                # Generic: Button, Input, Modal, Table, etc.
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── products/          # Product table, form, bulk actions
│   │   ├── inventory/         # Material table, form, stock alerts
│   │   ├── reservations/      # Reservation table, calendar, form
│   │   ├── notifications/     # Notification list, bell dropdown
│   │   └── analysis/          # Chart components (demand, revenue, stock)
│   │
│   ├── services/              # API communication
│   │   ├── api.js             # Base HTTP client (handles auth headers, errors)
│   │   └── authService.js     # Login API call
│   │
│   ├── context/               # Global state shared across all pages
│   │   ├── AuthContext.jsx    # Who is logged in (user data, login/logout)
│   │   ├── ThemeContext.jsx   # Dark/light mode toggle
│   │   └── NotificationContext.jsx # Notification list and unread count
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── useAuth.js         # Shortcut to access auth context
│   │
│   └── utils/                 # Helper functions
│       ├── formatters.js      # Date/currency formatting (planned)
│       ├── validators.js      # Form validation (planned)
│       └── constants.js       # Shared constants (planned)
│
├── .env                       # Environment variables (API URL)
├── index.html                 # HTML shell that loads the React app
├── package.json               # Project config and dependency list
├── vite.config.js             # Vite bundler settings (port, plugins)
└── eslint.config.js           # Code linting rules
```

---

## How the Code Connects

Here's how data flows through the app, explained simply:

```
User clicks a page
        |
App.jsx routes to the right page (e.g., ProductsPage)
        |
The page calls a service function (e.g., productService.getAll())
        |
The service uses api.js to send an HTTP request to the backend
        |
api.js adds the auth token from localStorage automatically
        |
Backend responds with data (JSON)
        |
The page displays the data in a table/card/chart
```

### Contexts (Global State)

Contexts let you share data across every page without passing it manually:

- **AuthContext** — Stores who's logged in. Every page can check `user` to know the current admin. Login saves to `localStorage` so you stay logged in after refresh.
- **ThemeContext** — Stores dark/light preference. The header toggle calls `toggleTheme()`, which adds/removes the `dark` class on `<html>`.
- **NotificationContext** — Stores the notification list and unread count. The header bell reads `unreadCount` from here.

### Routing

Routes are defined in `App.jsx`:

| URL Path          | Page                | Auth Required |
|-------------------|---------------------|---------------|
| `/login`          | LoginPage           | No            |
| `/`               | DashboardPage       | Yes           |
| `/products`       | ProductsPage        | Yes           |
| `/inventory`      | InventoryPage       | Yes           |
| `/reservations`   | ReservationsPage    | Yes           |
| `/notifications`  | NotificationsPage   | Yes           |
| `/analysis`       | AnalysisPage        | Yes           |

All authenticated pages are wrapped in `<ProtectedRoute>`, which redirects to `/login` if no user is found.

---

## Available Commands

Run these from the `catsy-admin` folder:

| Command           | What it does                                          |
|-------------------|-------------------------------------------------------|
| `npm run dev`     | Start the development server (auto-reloads on save)   |
| `npm run build`   | Build for production (output goes to `dist/` folder)  |
| `npm run preview` | Preview the production build locally                  |
| `npm run lint`    | Check code for style issues                           |

---

## Tech Stack

| Technology        | Version | What it does                                    |
|-------------------|---------|-------------------------------------------------|
| React             | 19      | UI framework — builds the interface from components |
| Vite              | 7       | Development server and build tool — fast hot reload |
| TailwindCSS       | 4       | Utility CSS classes — style without writing CSS files |
| React Router DOM  | 7       | Client-side routing — navigate between pages without reload |
| Lucide React      | 0.577   | Icon library — all the icons in the sidebar, buttons, etc. |
| Recharts          | 3       | Chart library — interactive graphs on the Analysis page |

---

## Ports

| App            | Port  | URL                        |
|----------------|-------|----------------------------|
| catsy-backend  | 8000  | http://localhost:8000      |
| catsy-web      | 5173  | http://localhost:5173      |
| **catsy-admin**| **5174** | **http://localhost:5174** |

All three can run at the same time. The admin and web apps both talk to the same backend.

---

## Running Everything Together

Open 3 terminals (or 4 if you also want the mobile app):

```bash
# Terminal 1 — Backend (must start first)
cd catsy-backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2 — Customer Web App
cd catsy-web
npm run dev

# Terminal 3 — Admin Panel
cd catsy-admin
npm run dev
```

---

## Troubleshooting

### "npm install" fails
- Make sure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Login doesn't work
- Make sure the backend is running on port 8000
- Check that `.env` has the correct `VITE_API_URL`
- Make sure you're using an admin or staff account, not a customer account

### Page is blank or shows errors
- Open browser DevTools (F12) and check the Console tab for error messages
- Make sure all dependencies are installed: `npm install`

### Dark mode looks broken
- Hard-refresh the page: Ctrl + Shift + R (or Cmd + Shift + R on Mac)

### Port 5174 is already in use
- Another process is using that port. Either stop it, or change the port in `vite.config.js`:
  ```js
  server: {
    port: 5175  // change to any available port
  }
  ```

---

## Implementation Phases

This project is being built in stages:

- [x] **Phase 1: Foundation** — Project setup, layout, routing, auth, theme toggle
- [ ] **Phase 2: Core Pages** — Connect products, inventory, dashboard to real backend data
- [ ] **Phase 3: Reservations & Notifications** — Calendar view, walk-in bookings, notification triggers, SSE
- [ ] **Phase 4: Analysis & ML** — Demand forecasting, revenue prediction, stock depletion charts
