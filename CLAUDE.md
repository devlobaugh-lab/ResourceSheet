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
npm run db:setup     # Reset DB and create admin user in one step
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

See [`docs/LLM_CONTEXT.md`](docs/LLM_CONTEXT.md) for full architecture reference: data model, DB schema, Supabase client usage, API patterns, validation, hooks, auth, and key file map.
