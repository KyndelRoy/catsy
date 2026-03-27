# Cutsy Cafe POS System
# Tools and Technology Stack

This document lists every tool, library, and service required to build, run, and maintain the Cutsy Cafe POS system — from development through production.

## 1. Core Backend Services

| Tool | Purpose | Cost |
| --- | --- | --- |
| Supabase | PostgreSQL database, Auth, Edge Functions, Realtime, Storage, pg_cron, webhooks | Free tier (generous) |
| Resend | Transactional emails — invoices, order status updates, cancellations | Free (3,000 / mo) |
| PayMongo | GCash and PayMaya payment processing | Free sandbox; ~2–3.5% per transaction in prod |

## 2. Frontend — Customer Portal (Web)

| Tool | Purpose |
| --- | --- |
| Next.js | React framework — routing, SSR, API routes |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Pre-built accessible UI components (forms, modals, tables) |
| React Query | Server state management, caching, background refetching |
| Zustand | Client-side state — cart, active session |
| React Hook Form | Form handling — sign-up, reservation, checkout |
| Zod | Schema validation, pairs with React Hook Form |
| Supabase JS SDK | Auth, database queries, Realtime subscriptions |

## 3. Frontend — POS Application (Staff)

The POS lives in the same Next.js project as the customer portal under a separate route group (`/pos`), protected by role-based middleware.

| Tool | Purpose |
| --- | --- |
| Next.js | Same framework, /pos route group |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| React Query | Data fetching and cache management |
| Zustand | POS cart state, active order state |
| React Hook Form + Zod | Order forms and modifier inputs with validation |
| Supabase JS SDK | Auth, database, Realtime — live order queue updates |

## 4. Frontend — Admin Panel

The admin panel lives in the same Next.js project under the `/admin` route group, restricted to admin role only.

| Tool | Purpose |
| --- | --- |
| Next.js | Same project, /admin route group |
| Tailwind CSS | Styling |
| shadcn/ui | Tables, forms, dialogs |
| Recharts | Sales charts and inventory graphs |
| React Query | Data fetching |
| Supabase JS SDK | Auth and database |

## 5. QR Code — Invoice Generation and Scanning

| Tool | Purpose | Cost |
| --- | --- | --- |
| qrcode (npm) | Generate QR codes server-side for invoices | Free |
| html5-qrcode (npm) | Scan QR codes from the browser camera for point claiming and reviews | Free |

## 6. PDF Invoice Generation

| Tool | Purpose | Cost |
| --- | --- | --- |
| @react-pdf/renderer | Generate invoice PDFs to attach to customer emails | Free |

## 7. In-App Realtime Notifications

Handled entirely by Supabase Realtime. No additional tool is required. The application subscribes to the `notifications` table and the UI updates instantly when a new row is inserted. No polling needed.

## 8. Background Jobs and Automation

All background processing runs inside Supabase. No external job queue service is needed.

| Tool | Purpose |
| --- | --- |
| Supabase pg_cron | Auto-cancel orders after the 10-minute payment window expires |
| Supabase Database Webhooks | Trigger Edge Functions when order status changes |
| Supabase Edge Functions | Business logic that runs on events — send emails, void expired vouchers, deduct inventory |

## 9. Development Tools

| Tool | Purpose |
| --- | --- |
| VS Code | Code editor |
| Supabase CLI | Local development, database migrations, Edge Function testing |
| Bruno / Postman | API testing for PayMongo and Edge Functions |
| Git + GitHub | Version control |
| Vercel | Hosting for the Next.js application — auto-deploys from GitHub |
| ESLint + Prettier | Code quality and consistent formatting |
| TypeScript | Type safety across the entire project |
| pnpm | Package manager — faster than npm, better for monorepo structure |

## 10. Production Cost Summary

Everything is free to start. The following costs only apply in production.

| Tool | Purpose | Cost |
| --- | --- | --- |
| Supabase | Free up to 500MB DB and 2GB bandwidth | Free → $25/mo (Pro) |
| Resend | Free up to 3,000 emails per month | Free → $20/mo |
| PayMongo | Per successful transaction only. No monthly fee. | 2.5–3.5% per transaction |
| Vercel | Free for single developer. Pro needed for team access. | Free → $20/mo (Pro) |

At normal cafe volume the project will stay on the free tier of every service except PayMongo, which is unavoidable as it is charged per transaction.

## 11. Full Stack at a Glance

- **Frontend:** Next.js + Tailwind CSS + shadcn/ui
- **State Management:** React Query (server state) + Zustand (client state)
- **Backend / Database:** Supabase (PostgreSQL + Auth + Realtime + Edge Functions + pg_cron)
- **Email:** Resend via Supabase Edge Functions
- **Payments:** PayMongo (GCash + PayMaya)
- **PDF Invoices:** @react-pdf/renderer
- **QR Codes:** qrcode (generate) + html5-qrcode (scan)
- **Hosting:** Vercel
- **Language:** TypeScript throughout
