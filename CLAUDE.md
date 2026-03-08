# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check without emitting

# Testing
npm test             # Run all Jest tests

# Database (requires local Supabase running)
supabase start       # Start local Supabase (Docker required)
supabase stop        # Stop local Supabase
npm run db:push      # Apply migrations to local DB
npm run db:reset     # Reset DB and re-run all migrations
npm run db:generate  # Regenerate TypeScript types from local schema -> src/types/database.types.ts

# Seeding
npm run db:seed:seasons    # Seed seasons data
npm run db:seed:car-parts  # Seed car parts
npm run db:seed:drivers    # Seed drivers
npm run db:seed:boosts     # Seed boosts
```

## Environment Variables

`.env.local` is required for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>
SUPABASE_SERVICE_ROLE_KEY=<local service role key>
```

## Architecture

### Tech Stack

- **Next.js 14** (App Router) — frontend + API routes
- **Supabase** — PostgreSQL, Auth, Row-Level Security
- **TanStack Query v5** — client-side data fetching/caching
- **Zod** — runtime validation on API routes
- **Tailwind CSS** — styling

### Data Model Overview

The DB has two categories:

- **Global/catalog data** (shared): `drivers`, `car_parts`, `boosts`, `seasons`, `tracks`, `series`, `collections`
- **Per-user data** (RLS-protected): `user_items`, `user_boosts`, `user_car_setups`, `user_track_guides`, `user_gp_guide_results`

`card_type` on catalog items: `0 = car part`, `1 = driver`

### Supabase Clients

Three distinct clients in `src/lib/supabase.ts`:

- `supabaseAdmin` — service role, full DB access, use only in API routes
- `supabase` — anon key client, RLS enforced, for browser use
- `createServerSupabaseClient()` / `createAuthenticatedSupabaseClient(request)` — cookie-based session clients for API routes that need user auth

### API Layer

All data access goes through Next.js API routes in `src/app/api/`. Clients never call Supabase directly for mutations — they go through these routes. Route handlers use `supabaseAdmin` for catalog reads and `createServerSupabaseClient()` for user-specific reads/writes.

Input validation uses Zod schemas defined in `src/lib/validation.ts`. Error responses follow the shape `{ error: { code: string, message: string } }`.

### Frontend Data Fetching

`src/hooks/useApi.ts` contains all TanStack Query hooks (e.g., `useDrivers`, `useUserDrivers`, `useBoosts`). These are the primary interface for components to fetch data. Auth headers are attached via `getAuthHeaders()` which reads the JWT from `localStorage`.

### Authentication

`AuthContext` (`src/components/auth/AuthContext.tsx`) provides `useAuth()` hook with `user`, `session`, `signIn`, `signOut`, etc. Auth state is managed client-side via Supabase's JS client. `ProtectedRoute` wraps pages that require login.

Admin check: `profiles.is_admin` column — admin routes in `src/app/admin/` and `src/app/api/admin/` check this.

### Providers Hierarchy

```text
QueryClientProvider
  └── AuthProvider
        └── ToastProvider
              └── CollectionsProvider
```

### Key Directories

- `src/app/api/` — all REST API endpoints
- `src/app/data-input/` — spreadsheet-style bulk data entry (tabs: Drivers, Parts, Boosts)
- `src/app/gp-guides/` — GP guide creation and management
- `src/app/compare/` — side-by-side comparison tools
- `src/lib/` — Supabase clients, validation schemas, utilities
- `src/hooks/` — TanStack Query hooks
- `src/types/database.ts` — canonical TypeScript types (use this, not `database.types.ts`)
- `supabase/migrations/` — all DB migration files (timestamped SQL)
- `scripts/database/` — one-off seeding and maintenance scripts
- `external_data/` — raw external game data files for import
