# Catsy Web - Admin Dashboard

Professional Admin Dashboard for Catsy Coffee, built with **React**, **Vite**, and **Vanilla CSS**. This project is integrated with **Supabase** for real-time data management.

## 🚀 Getting Started

### 1. Installation
Install the project dependencies using npm:
```bash
cd web
npm install
```

### 2. Running Locally
Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### 3. Building for Production
Create an optimized production build:
```bash
npm run build
```

---

## 🔑 API Configuration & Security

To keep the project secure, sensitive API keys should be stored in an environment file rather than being hardcoded in the source code.

### Where to put your API Keys
1. Create a file named `.env` in the `web/` directory.
2. Add your Supabase credentials following this format:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

> [!IMPORTANT]
> **Security Reminder**: Never commit your `.env` file to GitHub. The root `.gitignore` is already configured to ignore this file.

### How to use them in the code
In Vite projects, you access these variables using `import.meta.env`:
```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
```

Currently, the project is configured in `web/src/admin/lib/api.js`. It is recommended to switch from hardcoded strings to these environment variables before deploying.

---

## 📂 Project Structure

- `src/admin/`: Contains all admin-specific logic and components.
  - `components/`: Reusable UI elements (Buttons, Icons, Cards).
  - `pages/`: Individual dashboard views (Dashboard, Orders, Inventory, etc.).
  - `lib/`: Utility functions, theme tokens, and the Supabase API client.
- `src/assets/`: Static assets like images and icons.
- `src/index.css`: Global styling and design system.
- `seed.js`: Script to populate the Supabase database with mock data.
