# Zap Thoung Café — POS

A point-of-sale console for Zap Thoung Café: admin login, a live dashboard, menu
management, and an order/POS screen — built with Next.js (App Router), Prisma, and
SQLite.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Prisma 6** + **SQLite** (file-based DB, zero config — swap the datasource for
  Postgres/MySQL later without touching app code)
- Custom cookie-based auth (`bcryptjs` + `jose` JWT), no third-party auth service
- Tailwind CSS v4, hand-rolled UI primitives (no component library dependency)
- `recharts` for the dashboard revenue chart

## Getting started

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npm run db:seed          # seeds the full Zap Thoung menu + an admin user
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

### Default admin login

Seeded from `.env` (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`):

- **Email:** `hassantahir0000@gmail.com`
- **Password:** `ZapThoung@2026`

Change `SEED_ADMIN_PASSWORD` in `.env` and re-run `npm run db:seed` to update it, or
just change your password by editing the user in Prisma Studio (`npm run db:studio`).

**Change `AUTH_SECRET` in `.env` before deploying anywhere real** — it signs the
session cookie.

## Project structure

- `src/app/(app)/dashboard` — stats, revenue trend, top sellers, recent orders
- `src/app/(app)/pos` — the order-taking screen (menu grid + cart)
- `src/app/(app)/orders` — order list + per-order detail/receipt with status flow
- `src/app/(app)/menu` — category & menu item CRUD with price variants
- `src/lib/actions` — Server Actions (auth, menu, orders) — all writes go through
  these, never through client-side fetches to hand-rolled API routes
- `prisma/schema.prisma` — data model
- `prisma/seed.ts` — seeds categories, items, price variants, and the admin user
  from the photographed menu

## Notes on the data model

Menu items can have multiple price variants (e.g. Small/Medium/Large, Single/Family,
6 pcs/12 pcs, or a single "Regular" price) — see `MenuItemVariant` in the schema.
Orders snapshot the item name, variant label, and unit price at the time of sale, so
renaming or repricing a menu item later doesn't change historical order totals.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build / start |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the menu + admin user |
| `npm run db:studio` | Open Prisma Studio to browse/edit data |
| `npm run lint` | ESLint |
