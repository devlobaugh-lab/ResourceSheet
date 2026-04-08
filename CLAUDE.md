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
npm test             # Run all Vitest tests (vitest run)
npm run test:watch   # Watch mode — use this during TDD
npm run test:coverage # Coverage report

# Database (requires local Supabase running)
supabase start       # Start local Supabase (Docker required)
supabase stop        # Stop local Supabase
npm run db:push      # Apply migrations to local DB
npm run db:reset     # Reset DB and re-run all migrations
npm run db:setup     # Reset DB and create admin user in one step
npm run db:generate  # Regenerate TypeScript types from local schema -> src/types/database.types.ts

# Game data — use content cache import, not seed scripts
# Seasons, drivers, car parts, and boosts are populated via the admin
# content cache import UI (/admin → Content Cache). seed.sql is intentionally
# empty; the db:seed:* scripts below exist but are not the intended workflow.
npm run db:seed:seasons    # (legacy) seed seasons
npm run db:seed:car-parts  # (legacy) seed car parts
npm run db:seed:drivers    # (legacy) seed drivers
npm run db:seed:boosts     # (legacy) seed boosts
```

## Environment Variables

`.env.local` is required for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>
SUPABASE_SERVICE_ROLE_KEY=<local service role key>
```

## TDD Workflow

All changes must follow Red/Green/Refactor:

1. **Red** — Write a failing test that describes the desired behavior. Run it and confirm it fails for the right reason.
2. **Green** — Write the minimum production code needed to make the test pass. No more.
3. **Refactor** — Clean up code while keeping tests green.

**Rules:**
- Never write production code without a failing test first.
- Run `npm run test:watch` during development for tight feedback.
- Tests live colocated with the code they test: `foo.ts` → `foo.test.ts` in the same directory.
- For React components, use `@testing-library/react` — test behavior, not implementation details.
- For pure functions (utils, sorting, validation), use plain `describe`/`it` with `expect`.
- Global mocks for Supabase clients and Next.js router are pre-configured in `src/test/setup.ts`.

## Architecture

See [`docs/LLM_CONTEXT.md`](docs/LLM_CONTEXT.md) for full architecture reference: data model, DB schema, Supabase client usage, API patterns, validation, hooks, auth, and key file map.
