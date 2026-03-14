# Catsy Web - Admin Dashboard

Professional Admin Dashboard for Catsy Coffee built with React, Vite, and Vanilla CSS, integrated with Supabase.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Environment Variables

For security, API keys must be stored in a `.env` file in the `web/` directory.

Add the following to `.env`:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

## Project Structure

- `src/admin/`: Admin logic, components, and pages.
- `src/index.css`: Design system and global styles.
- `seed.js`: Database seeding script for mock data.
