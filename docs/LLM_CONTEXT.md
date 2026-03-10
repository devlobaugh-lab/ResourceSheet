# Codebase Context — F1 Resource Manager

> Token-optimized reference for LLM assistants. Prefer this over reading multiple source files.

---

## Key File Map

```
src/types/database.ts          canonical types — import ALL types from here
src/types/api.ts               API response types (PaginationMeta, etc.)
src/lib/supabase.ts            supabaseAdmin, supabase, createServerSupabaseClient(), createAuthenticatedSupabaseClient()
src/lib/validation.ts          Zod schemas for all API inputs
src/lib/logger.ts              Logger class + global logger instance; call logger.overrideConsole() to suppress bare console.* in prod
src/lib/console-init.ts        side-effect module — imports logger and calls overrideConsole() (imported by layout.tsx for client)
src/instrumentation.ts         Next.js server instrumentation — calls logger.overrideConsole() at server startup
src/lib/utils.ts               shared utilities incl. getRarityDisplay, getCollectionRarityDisplay, getRarityBackground
src/lib/rarityUtils.ts         additional rarity helpers (getRarityStyles, getRarityOptions)
src/hooks/useApi.ts            all TanStack Query hooks (getAuthHeaders exported here too)
src/contexts/SeasonContext.tsx useSeasonContext — activeSeasonId, activeSeason, seasons, setActiveSeason
src/components/auth/AuthContext.tsx   useAuth() hook — user, session, signIn, signOut
src/app/api/                   all API route handlers
supabase/migrations/           SQL migration files (source of truth for DB schema)
scripts/database/              seeding scripts (not production code)
external_data/                 raw game data files for import
```

---

## Database Schema (compact)

All tables have `id uuid PK`, `created_at timestamptz`, `updated_at timestamptz` unless noted.

### Catalog tables (global, no RLS)

```
drivers          name text, rarity int, series int, season_id uuid?, icon text?,
                 cc_price int?, num_duplicates_after_unlock int?, collection_id text?,
                 visual_override text?, collection_sub_name text?, min_gp_tier int?,
                 tag_name text?, ordinal int?, stats_per_level jsonb?

car_parts        name text, rarity int, series int, season_id uuid?, icon text?,
                 cc_price int?, num_duplicates_after_unlock int?, collection_id text?,
                 visual_override text?, collection_sub_name text?, car_part_type int,
                 stats_per_level jsonb?
                 [API also attaches collection_theme from collections table, same as drivers]

boosts           name text, icon text?, boost_stats jsonb?, is_free bool

seasons          name text, is_active bool

tracks           name text, alt_name text?, laps int, driver_track_stat text,
                 car_track_stat text, season_id uuid NOT NULL

collections      (referenced by drivers/car_parts via collection_id)

boost_custom_names   boost_id uuid FK boosts, custom_name text

ai_track_loadouts    track_name text, difficulty text, team_name text, driver_slot int,
                     overtaking int, blocking int, qualifying int, tyre_use int,
                     race_start int, car_parts jsonb?

team_driver_names    team_name text, driver_slot int, driver_name text
```

### User tables (RLS: user_id = auth.uid())

```
user_drivers     user_id uuid, driver_id uuid FK drivers, level int, card_count int
                 UNIQUE(user_id, driver_id)

user_car_parts   user_id uuid, car_part_id uuid FK car_parts, level int, card_count int
                 UNIQUE(user_id, car_part_id)

user_boosts      user_id uuid, boost_id uuid FK boosts, level int, count int
                 UNIQUE(user_id, boost_id)

user_car_setups  user_id uuid, name text, notes text?, series_filter int,
                 bonus_percentage int, brake_id uuid?, gearbox_id uuid?,
                 rear_wing_id uuid?, front_wing_id uuid?, suspension_id uuid?,
                 engine_id uuid?,  [all FK car_parts]
                 season_id uuid? FK seasons

user_track_guides   user_id uuid, track_id uuid FK tracks, gp_level int,
                    driver_1_id uuid?, driver_2_id uuid?, driver_1_boost_id uuid?,
                    driver_2_boost_id uuid?, alt_driver_ids uuid[]?, alt_boost_ids uuid[]?,
                    suggested_drivers uuid[]?, suggested_boosts uuid[]?, free_boost_id uuid?,
                    saved_setup_id uuid?, setup_notes text?, dry_strategy text?,
                    wet_strategy text?, driver_1_dry_strategy text?, driver_1_wet_strategy text?,
                    driver_2_dry_strategy text?, driver_2_wet_strategy text?, notes text?
                    UNIQUE(user_id, track_id, gp_level)

user_track_guide_drivers   track_guide_id uuid FK user_track_guides, driver_id uuid,
                           recommended_boost_id uuid?, track_strategy text?

user_gp_guides   user_id uuid, name text, start_date date?, gp_level int,
                 notes text?, weekend_strategy_same bool, season_id uuid? FK seasons

user_gp_guide_tracks   gp_guide_id uuid FK user_gp_guides, track_id uuid?, race_number int,
                       race_type 'qualifying'|'opening'|'final', is_wet bool, is_ready bool,
                       driver_1_id uuid?, driver_2_id uuid?, driver_1_boost_id uuid?,
                       driver_2_boost_id uuid?, alt_driver_ids uuid[]?, alt_boost_ids uuid[]?,
                       saved_setup_id uuid?, setup_notes text?, driver_1_tire_strategy text?,
                       driver_2_tire_strategy text?, strategy_notes text?

user_gp_guide_results  gp_guide_id uuid, track_id uuid, results_notes text?

user_custom_drivers   user_id uuid, name text, overtaking int, blocking int,
                      qualifying int, tyre_use int, race_start int, car_parts jsonb?
```

### System table

```
profiles   id uuid (= auth.users.id), email text?, username text?,
           is_admin bool, is_active bool, active_season_id uuid? FK seasons
```

---

## Type Imports

Always import from `@/types/database`. Key named exports:

```typescript
// Table row types
Season, Profile, Boost, BoostCustomName, UserBoost
Driver, CarPart, UserDriver, UserCarPart
Track, UserTrackGuide, UserTrackGuideDriver
UserGpGuide, UserGpGuideTrack, UserGpGuideResult
AITrackLoadout, TeamDriverName, UserCustomDriver

// View types (catalog + user data merged)
DriverView, CarPartView, BoostView, BoostWithCustomName
UserCarSetup, UserCarSetupWithParts

// DriverView and CarPartView include collection fields attached by the API:
//   collection_theme?: string | null   (from collections.theme)
//   collection_ordinal?: number | null (DriverView only)
// Use collection_theme + collection_sub_name for SE rarity display.

// Utility
Tables<'table_name'>   // Row type
Inserts<'table_name'>  // Insert type
Updates<'table_name'>  // Update type
StatsPerLevel, BoostStats, SeriesWithTracks, SeriesData
```

---

## Rarity Display Utilities

`src/lib/utils.ts` — import from here for all rarity display in components:

```typescript
import { getRarityDisplay, getCollectionRarityDisplay, getRarityBackground } from '@/lib/utils'

// Non-SE drivers (rarity 1–4)
getRarityDisplay(driver.rarity)              // → "Common" | "Rare" | "Epic" | "Legendary"

// SE drivers (rarity 5) — pass collection fields
getCollectionRarityDisplay(
  driver.collection_theme ?? null,
  driver.collection_sub_name ?? null
)
// → "HotProspects-2" | "PodiumStars" | "Special Edition" (fallback)
```

**Rule:** Always branch on `rarity === 5`:
- rarity 1–4: `getRarityDisplay(rarity)`
- rarity 5: `getCollectionRarityDisplay(collection_theme, collection_sub_name)`

`src/lib/rarityUtils.ts` — provides `getRarityStyles(rarity)` (CSS classes) and `getRarityOptions()` (fetches `/api/rarity-options`). Do not use its `getRarityDisplay` — it has different rarity label names.

---

## Supabase Client Selection

```typescript
import { supabaseAdmin, createServerSupabaseClient, createAuthenticatedSupabaseClient } from '@/lib/supabase'

supabaseAdmin                          // catalog reads, admin ops — any API route
createServerSupabaseClient()           // user auth check via cookie — server-only
createAuthenticatedSupabaseClient(req) // user RLS queries in API routes
```

**Rule:** `supabaseAdmin` bypasses RLS. Use it only in API routes, never expose to browser.

---

## API Route Patterns

### Catalog read (no auth required)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { myFiltersSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const filters = myFiltersSchema.parse(Object.fromEntries(new URL(request.url).searchParams))
    let query = supabaseAdmin.from('table').select('*').order('name')
    // apply filters...
    const { data, error } = await query
    if (error) return NextResponse.json({ error: { code: 'DATABASE_ERROR', message: error.message } }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid params', details: error.errors } }, { status: 400 })
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
```

### Auth check (user session — supports both cookies and Bearer token)

```typescript
import { createAuthenticatedSupabaseClient } from '@/lib/supabase'

const supabase = createAuthenticatedSupabaseClient(request)
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user)
  return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
```

Use `createAuthenticatedSupabaseClient(request)` in all API routes. It handles both cookie-based sessions and `Authorization: Bearer <token>` headers, and delegates signature verification to Supabase server-side. Do **not** manually decode or trust JWT payloads.

Use `createServerSupabaseClient()` (no `request` arg) only in server components / actions where no `NextRequest` is available.

### Admin check (after auth check)

```typescript
const { data: profile } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).single()
if (!profile?.is_admin)
  return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
```

### User data write (RLS via supabaseAdmin with explicit user_id)

```typescript
const { data, error } = await supabaseAdmin
  .from('user_drivers')
  .upsert({ user_id: user.id, driver_id: body.driver_id, level: body.level }, { onConflict: 'user_id,driver_id' })
  .select()
  .single()
```

---

## Error Response Shape

All API errors follow this exact shape:

```typescript
{ error: { code: string, message: string, details?: unknown } }
```

Standard codes: `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `VALIDATION_ERROR` (400), `DATABASE_ERROR` (500), `INTERNAL_ERROR` (500)

---

## Validation (Zod)

Schemas live in `src/lib/validation.ts`. Key exports:

```
driversFiltersSchema      carPartsFiltersSchema     boostsFiltersSchema
createBoostSchema         updateBoostSchema
createSeasonSchema        updateSeasonSchema
createUserBoostSchema     updateUserBoostSchema
userAssetsFiltersSchema   paginationSchema          uuidSchema
```

Pattern: parse query params as `schema.parse(Object.fromEntries(searchParams))`, parse request body as `schema.parse(await request.json())`. Zod coerces string query params to numbers where needed.

---

## Frontend Hook Pattern

All hooks in `src/hooks/useApi.ts`. Pattern:

```typescript
export function useDrivers(filters?: DriversFilters) {
  return useQuery({
    queryKey: ['drivers', filters],
    queryFn: async () => {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams(/* filters */)
      const res = await fetch(`/api/drivers?${params}`, { headers })
      if (!res.ok) throw new Error('Failed to fetch drivers')
      return res.json() as Promise<{ data: DriverView[], pagination: PaginationMeta }>
    },
    staleTime: 10 * 60 * 1000, // 10 min for catalog data
  })
}
```

Mutation pattern:

```typescript
export function useUpdateUserDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/drivers/user`, { method: 'POST', headers, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Update failed')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user_drivers'] }),
  })
}
```

---

## Pagination Response Shape

List endpoints that paginate return:

```typescript
{ data: T[], pagination: { page: number, limit: number, total: number, totalPages: number } }
```

---

## Auth Context (client components)

```typescript
import { useAuth } from '@/components/auth/AuthContext'
const { user, session, signIn, signOut, loading } = useAuth()
```

`loading` is `true` until the initial session check (including `detectSessionInUrl` resolution) completes. Gate UI on `loading`, not on `!session`, to avoid prematurely blocking pages that receive hash tokens from email links.

Admin check in client code: `user` alone is not enough — fetch `/api/admin-check` which returns `{ isAdmin: boolean }`.

---

## Season Context (client components)

```typescript
import { useSeason } from '@/contexts/SeasonContext'
const { activeSeasonId, activeSeason, seasons, isLoading, setActiveSeason } = useSeason()
```

- `activeSeasonId` — the resolved working season (user preference → globally `is_active` → null)
- `activeSeason` — full `Season` object for the active season, or null
- `seasons` — all seasons
- `setActiveSeason(id)` — persists to `profiles.active_season_id` via `PUT /api/profiles/[id]` and updates local state optimistically

**Convention:** page components read `activeSeasonId` from context and pass it as a filter to hooks. Do **not** bake context reads into `useApi.ts` hooks.

### Season-aware hooks

| Hook | Filter param |
|------|-------------|
| `useUserDrivers(filters)` | `season_id` |
| `useUserCarParts(filters)` | `season_id` |
| `useCarParts(filters)` | `season_id` |
| `useTracks(filters)` | `season_id` |
| `useUserCarSetups(filters)` | `season_id` |
| `useGpGuides(filters)` | `season_id` |

### Season-aware API endpoints

| Endpoint | season_id support |
|----------|-------------------|
| `GET /api/gp-guides` | query param |
| `POST /api/gp-guides` | request body |
| `GET /api/setups` | query param |
| `POST /api/setups` | request body |
| `PUT /api/seasons/[id]` | atomically clears others when `is_active: true` |
| `PUT /api/profiles/[id]` | updates `active_season_id` |

---

## New-User Invite Email Flow

`supabaseAdmin` uses `createClient` from `@supabase/supabase-js`, which uses **implicit flow** (hash tokens). `resetPasswordForEmail` therefore delivers `#access_token=...` in the URL — not a `?code=` query param.

- `redirectTo` must point to a **client-side page** (e.g. `/auth/update-password`), not a server route handler, because servers never see URL fragments.
- The client-side Supabase instance has `detectSessionInUrl: true`, which automatically exchanges the hash token on page load.
- `/auth/callback` (PKCE, server-side) is for OAuth and magic-link flows only — do not use it as the `redirectTo` for `resetPasswordForEmail`.
- `supabase/config.toml` must include an `[auth]` section with `additional_redirect_urls` that allows the full path (e.g. `http://localhost:3000/**`); without this Supabase strips the path from the redirect URL.

### Sequence

1. Admin POSTs to `/api/admin/users` → user created → `resetPasswordForEmail` called with `redirectTo: .../auth/update-password`
2. New user clicks email link → lands on `/auth/update-password` with `#access_token=...` in hash
3. `detectSessionInUrl` runs → session established → `loading` becomes `false`
4. Password form renders → user sets password → redirected to `/dashboard`

### Providers Hierarchy

```text
QueryClientProvider
  └── AuthProvider
        └── ToastProvider
              └── CollectionsProvider
                    └── SeasonProvider
```

---

## UI Components

### `Input` (`src/components/ui/Input.tsx`)

Props beyond standard `<input>` attributes:

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Renders a `<label>` above the input |
| `error` | `string` | Red error message below, red border |
| `helperText` | `string` | Gray helper text below (hidden when `error` set) |
| `leftIcon` | `ReactNode` | Icon inside left edge (`pl-10` applied automatically) |
| `rightIcon` | `ReactNode` | Icon inside right edge (`pr-10` applied automatically); hidden when clear button is active |
| `onClear` | `() => void` | When provided and `value` is non-empty, renders a clickable ✕ button on the right that calls this handler. Use on all search fields. |

---

## Logging & Console Suppression

All `console.*` output is suppressed in production via a global console override.

**Env var:** `NEXT_PUBLIC_LOG_LEVEL`
- Values: `debug` | `info` | `warn` | `error` | `off`
- Default in production (not set): `off` — all output suppressed
- Default in development (not set): `debug` — full output
- Set in `.env.local` as `NEXT_PUBLIC_LOG_LEVEL=debug` for local dev

**How it works:**
- `src/instrumentation.ts` overrides `globalThis.console` at server startup (covers API routes, server components)
- `src/lib/console-init.ts` is imported in `src/app/layout.tsx` and overrides console for the client bundle
- `logger` methods (`logger.debug`, `logger.info`, etc.) always use the captured native console — they are not affected by the override

**Use `logger` for new structured log calls; existing bare `console.*` calls are automatically filtered.**

---

## Adding a New Feature — Checklist

1. **DB**: add migration in `supabase/migrations/YYYYMMDDHHMMSS_name.sql`
2. **Types**: add row type to `src/types/database.ts` `Database` interface + named export
3. **Validation**: add Zod schema to `src/lib/validation.ts`
4. **API route**: `src/app/api/your-route/route.ts` — use patterns above
5. **Hook**: add to `src/hooks/useApi.ts`
6. **Page**: `src/app/your-page/page.tsx` — wrap with `<ProtectedRoute>` if auth required. Do **not** add a `min-h-screen bg-gray-50` outer wrapper — the root layout (`layout.tsx`) already provides both. Pages should return their inner container directly:

```tsx
// Correct
return (
  <ProtectedRoute>
    <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
      <Content />
    </div>
  </ProtectedRoute>
)

// Wrong — redundant, causes scrollbar issues
return (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
      <Content />
    </div>
  </div>
)
```
