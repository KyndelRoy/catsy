# Catsy Project Structure

This document provides a visualization and overview of the platform's directory structure.

## File Tree

```text
.
├── catsy_db_documentation.md   # SQL database documentation
├── catsy_db.sql               # Database schema and seed data
├── PROJECT_STRUCTURE.md       # This file (Project overview)
└── web/                       # Main web application (React + Vite)
    ├── public/                # Static assets (favicon, icons)
    ├── src/                   # Source code
    │   ├── admin/             # Admin dashboard logic and pages
    │   │   ├── components/    # Admin-specific UI components
    │   │   ├── lib/           # Utility functions, API clients, and theme configuration
    │   │   └── pages/         # Dashboard views (Inventory, Orders, Reservations, etc.)
    │   ├── customer/          # Customer-facing app components
    │   ├── index.css          # Global design system (Vanilla CSS)
    │   └── main.jsx           # App entry point
    ├── README.md              # Web-specific setup and configuration
    ├── package.json           # Project dependencies and scripts
    └── vite.config.js         # Vite build tool configuration
```

## Key Directories

### `web/src/admin`
Contains the administrative dashboard. It is broken down into modular components and specialized pages for managing every aspect of the coffee shop, from inventory to tax reports.

### `web/src/admin/lib`
Houses core logic like `api.js` for Supabase interactions and `theme.js` for managing the platform's visual design tokens.

### `web/src/customer`
Future location for customer-facing features, currently housing the main `Customer.jsx` layout.

### `web/index.css`
The heart of the design system. Uses Vanilla CSS variables to ensure a consistent, themeable look and feel across the platform.
