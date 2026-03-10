# Development Setup

## Prerequisites

- Node.js 18+
- npm
- Docker
- Supabase CLI (v1.226.4+)

## Steps

### 1. Clone and install

```bash
git clone <repo-url>
cd ResourceSheet
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<secret key from supabase status>
```

### 3. Start local Supabase

```bash
supabase start
```

After startup, `supabase status` shows the keys under **Authentication Keys**:

```
╭──────────────────────────────────────────────────────────────╮
│ 🔑 Authentication Keys                                       │
├─────────────┬────────────────────────────────────────────────┤
│ Publishable │ sb_publishable_...   ← NEXT_PUBLIC_SUPABASE_ANON_KEY
│ Secret      │ sb_secret_...        ← SUPABASE_SERVICE_ROLE_KEY
╰─────────────┴────────────────────────────────────────────────╯
```

### 4. Set up the database

```bash
npm run db:setup
```

This runs `supabase db reset` (applies all migrations + `supabase/seed.sql`) then creates the local admin user.

**Admin credentials (local only):**
- Email: `thomas.lobaugh@gmail.com`
- Password: `password123`

### 5. Start the dev server

```bash
npm run dev
```

App: http://localhost:3000 — Supabase Studio: http://127.0.0.1:54323

---

## Database commands

| Command | What it does |
|---|---|
| `npm run db:setup` | Reset DB, apply migrations, create admin user |
| `npm run db:reset` | Reset DB and apply migrations only (no admin user) |
| `npm run db:push` | Apply pending migrations without resetting |
| `npm run db:generate` | Regenerate `src/types/database.types.ts` from local schema |
| `supabase start` | Start local Supabase stack |
| `supabase stop` | Stop local Supabase stack |
| `supabase status` | Show running URLs and auth keys |

---

## Known issues

### PostgreSQL version mismatch after CLI upgrade

If the Supabase CLI is upgraded and the local Docker volume contains PG15 data, `supabase start` will fail with:

```
database files are incompatible with server
The data directory was initialized by PostgreSQL version 15, which is not compatible with this version 17.6.
```

Fix: delete the old volumes and restart.

```bash
# Stop Supabase (ignore errors if already stopped)
supabase stop

# Find and remove stuck containers if needed
docker rm -f $(docker ps -aq --filter label=com.supabase.cli.project=ResourceSheet)

# Delete the old volumes
docker volume rm $(docker volume ls --filter label=com.supabase.cli.project=ResourceSheet -q)

# Start fresh (PG17 will initialize clean)
supabase start

# Restore DB
npm run db:setup
```

Data imported via the app's admin import UI will need to be re-imported after this.

---

## Seeding catalog data

`npm run db:setup` only creates the admin user and baseline schema. Catalog data (drivers, car parts, boosts) is imported through the app's **Admin → Import** UI using backup files.

The following `package.json` seed scripts are stubs and do not currently have backing files:

- `npm run db:seed:car-parts`
- `npm run db:seed:drivers`
- `npm run db:seed:boosts`

Use `npm run db:seed:seasons` to seed season data from the script at `scripts/database/seed_seasons.js`.

---

## File structure

```
src/
├── app/
│   ├── api/          # API route handlers
│   ├── admin/        # Admin pages
│   └── ...           # Feature pages
├── components/
│   ├── ui/           # Base UI components
│   └── auth/         # Auth components
├── hooks/            # useApi.ts — all TanStack Query hooks
├── lib/              # supabase.ts, validation.ts
└── types/            # database.ts (canonical types)

supabase/
├── migrations/       # Schema migrations (source of truth)
├── seed.sql          # Baseline seed (admin user + season)
└── config.toml       # Supabase local config

scripts/database/     # One-off seeding and utility scripts
external_data/        # Raw game data files for import
```

---

**Last updated:** March 2026
