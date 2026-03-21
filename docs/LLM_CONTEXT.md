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
src/lib/track-rotation-constants.ts  ROTATION_SERIES_INDICES ([9,10,11]) and ROTATION_TRACK_NAMES list
src/hooks/useApi.ts            all TanStack Query hooks (getAuthHeaders exported here too)
src/contexts/SeasonContext.tsx useSeasonContext — activeSeasonId, activeSeason, seasons, setActiveSeason
src/components/auth/AuthContext.tsx   useAuth() hook — user, session, signIn, signOut
src/app/api/                   all API route handlers
src/app/track-rotations/       public track rotation schedule page
src/app/admin/track-rotations/ admin UI for managing rotation sets and schedule
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

boosts           name text, icon text?, boost_stats jsonb?

seasons          name text, is_active bool

tracks           name text, alt_name text?, laps int, driver_track_stat text,
                 car_track_stat text,
                 min_weather_factor int?, max_weather_factor int?, weather_freq int?
                 NOTE: season membership lives in track_seasons, not here.
                 Same track name across different seasons = intentionally distinct rows.
                 One track row per (name, season) — duplicates within a season are a bug.

track_seasons    track_id text FK tracks ON DELETE CASCADE,
                 season_id uuid FK seasons ON DELETE CASCADE,
                 is_active bool DEFAULT true
                 UNIQUE(track_id, season_id)

track_rotation_sets      id uuid PK, set_number int UNIQUE (1–7),
                         series_data jsonb  -- keys "9","10","11"; each an array of
                         {track: string, weather: "dry"|"wet"|"mixed"}

track_rotation_schedule  id uuid PK, rotation_set_id uuid FK track_rotation_sets,
                         start_date date, end_date date
                         INDEX on (start_date, end_date)

collections      (referenced by drivers/car_parts via collection_id)

boost_icon_data      icon_name text UNIQUE, custom_name text?, is_free bool
                     Links by icon_name (= boosts.icon) — no UUID FK, so data can be
                     imported before boosts are seeded. Replaces old boost_custom_names
                     table and the former boosts.is_free column.

series_data          index int, entry_fee int, win_flags int, loss_flags int,
                     win_rep int, flags_to_unlock int, max_flags int,
                     track_ids uuid[], track_names text[], track_info jsonb?,
                     bot_loadout jsonb?, ai_car_loadouts jsonb?,
                     season_id uuid? FK seasons

ai_track_loadouts    track_name text, difficulty text, team_name text, driver_slot int,
                     overtaking int, blocking int, qualifying int, tyre_use int,
                     race_start int, car_parts jsonb?, season_id uuid? FK seasons

team_driver_names    team_name text, driver_slot int, driver_name text

track_name_aliases   system_name text UNIQUE, display_name text
                     Maps content-cache track names to user-facing display names
                     (e.g. "Americas" → "Austin"). No FK to tracks — keyed by name string.
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

user_track_guides   user_id uuid, track_id uuid FK tracks, season_id uuid? FK seasons,
                    gp_level int,
                    driver_1_id uuid?, driver_2_id uuid?, driver_1_boost_id uuid?,
                    driver_2_boost_id uuid?, alt_driver_ids uuid[]?, alt_boost_ids uuid[]?,
                    suggested_drivers uuid[]?, suggested_boosts uuid[]?, free_boost_id uuid?,
                    saved_setup_id uuid?, setup_notes text?, dry_strategy text?,
                    wet_strategy text?, driver_1_dry_strategy text?, driver_1_wet_strategy text?,
                    driver_2_dry_strategy text?, driver_2_wet_strategy text?, notes text?
                    UNIQUE(user_id, track_id, season_id, gp_level)
                    NOTE: season_id NULL on pre-migration rows; guides are season-scoped

user_track_guide_drivers   track_guide_id uuid FK user_track_guides, driver_id uuid,
                           recommended_boost_id uuid?, track_strategy text?

user_gp_guides   user_id uuid, name text, start_date date?, gp_level int,
                 notes text?, weekend_strategy_same bool, season_id uuid? FK seasons

user_gp_guide_tracks   gp_guide_id uuid FK user_gp_guides ON DELETE CASCADE,
                       track_id uuid? FK tracks ON DELETE SET NULL,
                       race_number int, race_type 'qualifying'|'opening'|'final',
                       is_wet bool, is_ready bool,
                       driver_1_id uuid?, driver_2_id uuid?, driver_1_boost_id uuid?,
                       driver_2_boost_id uuid?, alt_driver_ids uuid[]?, alt_boost_ids uuid[]?,
                       saved_setup_id uuid?, setup_notes text?, driver_1_tire_strategy text?,
                       driver_2_tire_strategy text?, strategy_notes text?
                       NOTE: track_id ON DELETE SET NULL preserves guide rows when tracks are re-imported

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
Season, Profile, Boost, BoostIconData, UserBoost
Driver, CarPart, UserDriver, UserCarPart
Track, UserTrackGuide, UserTrackGuideDriver
UserGpGuide, UserGpGuideTrack, UserGpGuideResult
AITrackLoadout, TeamDriverName, UserCustomDriver
TrackRotationSet, TrackRotationScheduleEntry

// Track rotation composite types
RotationWeather          // 'dry' | 'wet' | 'mixed'
RotationTrackEntry       // { track: string; weather: RotationWeather }
RotationSeriesData       // Record<string, RotationTrackEntry[]>  (keys "9","10","11")
RotationTrackEntryWithInfo  // RotationTrackEntry + laps?, driver_track_stat?, car_track_stat?
TrackRotationView        // { schedule, rotation_set, series: [{series_index, series_number, tracks}] }

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

## Two Season Concepts

The app distinguishes two separate season ideas:

| Concept | Meaning | DB field |
|---|---|---|
| **Game season** | The season the game is currently running; the target for all content-cache imports | `seasons.is_active = true` |
| **Viewing season** | The season the user has selected to browse in the app (can be historical) | `profiles.active_season_id` |

A content cache file always represents the **game season's** data. The import always targets `is_active` season by default. The `season_filter` form field only controls which series numbers of *drivers/car parts/boosts* are pulled — it does not affect which season tracks, series data, or AI loadouts are tagged to.

---

## Season Context (client components)

```typescript
import { useSeason } from '@/contexts/SeasonContext'
const { activeSeasonId, activeSeason, seasons, isLoading, setActiveSeason } = useSeason()
```

- `activeSeasonId` — the user's **viewing season** (user preference `profiles.active_season_id` → globally `is_active` → null). This is NOT necessarily the current game season.
- `activeSeason` — full `Season` object for the viewing season, or null
- `seasons` — all seasons
- `setActiveSeason(id)` — persists to `profiles.active_season_id` via `PUT /api/profiles/[id]` and updates local state optimistically

**Convention:** page components read `activeSeasonId` from context and pass it as a filter to hooks. Do **not** bake context reads into `useApi.ts` hooks.

**Tracks page:** when `activeSeasonId` is null, the tracks page shows "Select a season to view tracks" — it does NOT fall back to all tracks.

### Season-aware hooks

| Hook | Filter param |
|------|-------------|
| `useUserDrivers(filters)` | `season_id` |
| `useUserCarParts(filters)` | `season_id` |
| `useCarParts(filters)` | `season_id` |
| `useTracks(filters)` | `season_id` |
| `useUserCarSetups(filters)` | `season_id` |
| `useGpGuides(filters)` | `season_id` |
| `useSeries(filters)` | `season_id` |

### Season-aware API endpoints

| Endpoint | season_id support |
|----------|-------------------|
| `GET /api/gp-guides` | query param |
| `POST /api/gp-guides` | request body |
| `GET /api/setups` | query param |
| `POST /api/setups` | request body |
| `GET /api/series` | query param — filters `series_data` and fallback track lookup via `track_seasons` |
| `GET /api/tracks` | query param — filters via `track_seasons` junction |
| `GET /api/track-guides` | query param |
| `POST /api/track-guides` | request body |
| `GET /api/ai-loadouts` | query param |
| `GET /api/ai-loadouts/track/[trackName]/[difficulty]` | query param |
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

## Admin Import / Export

### System Backup (`GET /api/admin/export/system` → `POST /api/admin/import/system`)

Export format (version `1.1`):

```json
{
  "version": "1.1",
  "exportType": "systemData",
  "exportedAt": "<ISO timestamp>",
  "data": {
    "seasons": [...],
    "trackNameAliases": [...],
    "boostIconData": [{ "icon_name": "...", "custom_name": "...", "is_free": false }],
    "users": [
      { "email": "...", "username": "...", "is_admin": false, "is_active": true }
    ]
  }
}
```

**User accounts on import:** The system import creates missing auth users via `auth.admin.createUser` with `email_confirm: true` and no password (users must use "forgot password" to set one). Existing users (matched by email) have their profiles upserted. This means a full restore workflow after `db:reset` is:
1. Import system backup → recreates auth users + profiles
2. Import user data backup → resolves UUIDs by email (now guaranteed to find them)

### User Data Backup (`GET /api/admin/export/users` → `POST /api/admin/import/users`)

Export format (version `1.1`):

```json
{
  "version": "1.1",
  "exportType": "allUsersData",
  "exportedAt": "<ISO timestamp>",
  "users": [
    {
      "userId": "<uuid at export time>",
      "email": "<auth email>",
      "username": "...",
      "active_season_id": null,
      "data": { "userDrivers": [...], "userCarParts": [...], ... }
    }
  ]
}
```

**UUID resolution on import:** After a DB reset, `auth.users` gets new UUIDs. The import route resolves the correct current UUID by `email` — it does **not** trust the backed-up `userId`. If `email` is missing or doesn't match any current auth user, that user entry is skipped and an error is recorded. All inserts/updates use the resolved current UUID.

**GP guide fields:** `guideData` includes `season_id` and `is_ready`. Guides missing `season_id` are invisible on the GP Guides page when the user has an active season set.

**Track guide update path:** On UPDATE (guide already exists), the old `user_id` from the backup is stripped and replaced with the resolved current `userId` to prevent UUID corruption on repeated imports.

**Backward compatibility:** Version `1.0` exports (no `email` field) will fail to resolve and skip all users. Re-export with the current code before resetting if you need a usable backup.

### Content Cache Import (`POST /api/admin/content-cache/upload`)

Processes `content_cache.json` from the game. Import behaviour by table:

| Table | Strategy | Notes |
|---|---|---|
| `drivers`, `car_parts` | Change-detection upsert | New items inserted; `season_id` **always updated** (force field) regardless of `allow_modifications`; all other fields updated only if `allow_modifications=true` |
| `boosts`, `collections` | Change-detection upsert | New items inserted; existing items updated only if `allow_modifications=true` |
| `tracks` | Upsert by `id` | **Never deletes rows.** Existing tracks are updated in-place; new tracks are inserted. Season membership is written separately to `track_seasons` (upsert on `track_id,season_id`). User data linked to existing track IDs is never disrupted. |
| `series_data`, `ai_track_loadouts` | Season-scoped full refresh (delete rows for target season + insert) | Tagged with `season_id`; delete/insert is scoped to the imported season so other seasons' data is preserved |

**Target season for import:** The import always defaults to the `is_active = true` season from the DB (the current game season). An admin can optionally override this via the "Target Game Season" dropdown on the import page (passes `target_season_id` in the form) — use only for testing a future/pre-release season. The target season controls both where tracks/series_data/AI loadouts are tagged *and* which drivers/car parts are included: the server derives the season number from the resolved target season's name (e.g. "Season 6" → `6`) and uses it to filter `item.season` on drivers and car parts. If the season name contains no parseable number, the filter falls back to importing all configured seasons. There is no separate client-side series filter.

**Season resolution during import:** The route builds a `seasonIdMap` (season number → UUID) from the `seasons` table, ordered by `is_active DESC, created_at DESC`. When duplicate season names exist (e.g. a seeded row and an admin-created row both named "Season 6"), the active/most-recently-created season wins. This ensures drivers are assigned to the season the admin UI is currently showing.

**Seeding philosophy:** `supabase/seed.sql` is intentionally empty — no game data is seeded. Seasons, drivers, car parts, boosts, and tracks are all populated exclusively via the content cache import. The `db:seed:*` npm scripts are legacy and should not be used.

**Why tracks must upsert, not replace:** `user_track_guides.track_id` references `tracks.id` with `ON DELETE CASCADE` — deleting all tracks would wipe all track guides. `user_gp_guide_tracks.track_id` uses `ON DELETE SET NULL`, so those rows survive but lose their track association. Always use upsert for the `tracks` table.

**Track deduplication during import:** The import deduplicates tracks by name from the content cache (preferring the highest series index when the same name appears in multiple series). Before inserting, it checks ALL existing tracks in the DB by name to avoid creating a second row for the same named track. If a matching track exists but is not yet linked to the target season, a `track_seasons` row is created for it (rather than inserting a duplicate track row).

**Track season membership (many-to-many):** Tracks between seasons share the same name but are considered distinct (each season's content cache may have slightly different stats). Season membership is tracked in `track_seasons`; the `tracks` table has no `season_id` column. Each (track name, season) pair should have exactly one row in `track_seasons` — duplicates within a season are a data bug. When `GET /api/tracks?season_id=X` is called, the query goes through `track_seasons`.

### Import Error Visibility

Import errors are returned in `results.errors[]` and rendered in the admin page (`src/app/admin/page.tsx`) as a dismissible yellow panel below the backup cards. Previously only a count toast was shown.

---

## Track Rotations

Series 9–11 tracks rotate on a bi-weekly Wednesday cadence through 7 fixed sets (set_number 1–7). The schedule repeats cyclically.

### DB tables

- `track_rotation_sets` — 7 rows, one per set. `series_data` JSONB holds tracks per series: `{"9": [{track, weather}, ...], "10": [...], "11": [...]}`. Track names are the display/rotation names (may need alias lookup to match `tracks.name`).
- `track_rotation_schedule` — grows over time. Each row covers a date range and points to a set. Query: `.lte('start_date', date).gte('end_date', date)` to find the current rotation.

### API routes

- `GET /api/track-rotations?date=YYYY-MM-DD` — returns `TrackRotationView` (schedule entry + rotation set + enriched series tracks with laps/stats from `tracks` table). Date defaults to today.
- `GET /api/track-rotations/schedule` — all schedule entries with `rotation_set_number`
- `GET /api/admin/track-rotations/sets` — all 7 sets (admin auth)
- `PUT /api/admin/track-rotations/sets/[id]` — update a set's series_data (admin auth)
- `POST /api/admin/track-rotations/schedule` — add a schedule entry (admin auth)
- `PUT /api/admin/track-rotations/schedule/[id]` — update a schedule entry (admin auth)
- `DELETE /api/admin/track-rotations/schedule/[id]` — delete a schedule entry (admin auth)

### Hooks (`src/hooks/useApi.ts`)

```
useCurrentTrackRotation(date?)      → TrackRotationView
useTrackRotationSchedule()          → { data: TrackRotationScheduleEntry[] }
useAdminRotationSets()              → { data: TrackRotationSet[] }
useUpdateRotationSet()              mutation
useAdminRotationSchedule()          → { data: TrackRotationScheduleEntry[] }
useCreateRotationScheduleEntry()    mutation
useUpdateRotationScheduleEntry()    mutation
useDeleteRotationScheduleEntry()    mutation
```

### Track name matching

Rotation track names (e.g. "Montréal") may differ from `tracks.name` (e.g. "Montreal"). The API normalises both sides by stripping accents and lowercasing before matching, then falls back to `track_name_aliases`.

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
