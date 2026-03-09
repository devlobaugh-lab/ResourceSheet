# F1 Resource Manager — API Route Inventory

All routes live under `/api/`. Auth-required routes expect the Supabase session cookie (set automatically by the browser client) or an `Authorization: Bearer <jwt>` header. Error responses follow `{ error: { code: string, message: string } }`.

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/auth/callback` | No | OAuth/magic-link callback handler |

---

## Catalog

Read-only catalog data shared across all users.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/drivers` | No | List all drivers; supports `season_id`, `rarity`, `series`, `search`, `owned_only`, `sort_by`, `sort_order`, `page`, `limit` |
| GET | `/api/drivers/[id]` | No | Get a single driver by ID |
| GET | `/api/drivers/user` | Yes | List drivers with user ownership data merged in |
| GET | `/api/car-parts` | No | List all car parts; supports `season_id`, `rarity`, `series`, `car_part_type`, `search`, `owned_only`, `sort_by`, `sort_order`, `page`, `limit` |
| GET | `/api/car-parts/[id]` | No | Get a single car part by ID |
| GET | `/api/car-parts/user` | Yes | List car parts with user ownership data merged in |
| GET | `/api/boosts` | No | List all boosts; supports `season_id`, `series`, `search`, `owned_only`, `sort_by`, `sort_order`, `page`, `limit` |
| GET | `/api/boosts/[id]` | No | Get a single boost by ID |
| GET | `/api/boosts/custom-names` | No | List all admin-assigned custom boost names |
| PUT | `/api/boosts/[id]/custom-name` | Yes (admin) | Set or update the custom name for a boost; body: `{ custom_name: string }` |
| GET | `/api/seasons` | No | List all seasons |
| GET | `/api/seasons/[id]` | No | Get a single season by ID |
| GET | `/api/tracks` | No | List all tracks |
| GET | `/api/tracks/[id]` | No | Get a single track by ID |
| GET | `/api/series` | No | List all series |
| GET | `/api/rarity-options` | No | List available rarity values (for filter dropdowns) |
| GET | `/api/team-driver-names` | No | List driver names grouped by team (for autocomplete) |

---

## User Data

Per-user data — all routes require authentication; RLS enforces data isolation.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/setups` | Yes | List user's saved car setups |
| POST | `/api/setups` | Yes | Create a car setup; body: `{ name, notes?, max_series, bonus_percent?, brake_id?, gearbox_id?, rear_wing_id?, front_wing_id?, suspension_id?, engine_id? }` |
| GET | `/api/setups/[id]` | Yes | Get a single setup |
| PUT | `/api/setups/[id]` | Yes | Update a setup |
| DELETE | `/api/setups/[id]` | Yes | Delete a setup |
| GET | `/api/track-guides` | Yes | List user's track guides; supports `track_id`, `gp_level` filters |
| POST | `/api/track-guides` | Yes | Create a track guide |
| GET | `/api/track-guides/[id]` | Yes | Get a single track guide |
| PUT | `/api/track-guides/[id]` | Yes | Update a track guide |
| DELETE | `/api/track-guides/[id]` | Yes | Delete a track guide |
| GET | `/api/gp-guides` | Yes | List user's GP guides |
| POST | `/api/gp-guides` | Yes | Create a GP guide |
| GET | `/api/gp-guides/[id]` | Yes | Get a single GP guide with all track slots |
| PUT | `/api/gp-guides/[id]` | Yes | Update a GP guide |
| DELETE | `/api/gp-guides/[id]` | Yes | Delete a GP guide |
| GET | `/api/gp-guides/[id]/tracks/[slotId]` | Yes | Get a track slot within a GP guide |
| PUT | `/api/gp-guides/[id]/tracks/[slotId]` | Yes | Update a track slot (drivers, setup, strategy) |
| DELETE | `/api/gp-guides/[id]/tracks/[slotId]` | Yes | Remove a track slot |
| GET | `/api/gp-guides/[id]/results/[trackId]` | Yes | Get saved results for a track in a GP guide |
| POST | `/api/gp-guides/[id]/results/[trackId]` | Yes | Save results for a track |
| POST | `/api/gp-guides/[id]/import/[trackId]` | Yes | Import an existing track guide into a GP guide slot |
| GET | `/api/user-boosts` | Yes | List user's boost inventory |
| POST | `/api/user-boosts` | Yes | Add or update a boost in inventory; body: `{ boost_id, level }` |
| GET | `/api/custom-drivers` | Yes | List user's custom (manually added) drivers |
| POST | `/api/custom-drivers` | Yes | Create a custom driver |
| GET | `/api/profiles/[id]` | Yes | Get a user profile |
| PUT | `/api/profiles/[id]` | Yes (admin) | Update a user profile (e.g. `is_admin`) |

---

## Import / Export

There are two export/import pairs:

- **User export** — a single user backs up and restores their own data only.
- **Admin backup** — backs up all users' data plus admin-managed config. A restore from an admin backup covers everything; a separate user import is not needed.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/export-user-data` | Yes | Export the current user's data (collection, boosts, setups, guides) |
| POST | `/api/import-user-data` | Yes | Import the current user's data from a user export blob |
| GET | `/api/admin/export` | Yes (admin) | Export all users' data + admin-managed config (seasons, track name aliases, boost custom names, `is_free` flags); excludes content-cache tables |
| POST | `/api/admin/import` | Yes (admin) | Import an admin backup; upserts all user tables (including previously missing child tables) and admin config |

---

## Admin

All routes require `profiles.is_admin = true`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/users` | Yes (admin) | List all user accounts |
| GET | `/api/admin/users/[id]` | Yes (admin) | Get a single user account |
| PUT | `/api/admin/users/[id]` | Yes (admin) | Update a user account |
| POST | `/api/admin/run-migration` | Yes (admin) | Execute a named database migration |
| POST | `/api/admin/content-cache/upload` | Yes (admin) | Upload a content-cache file (drivers, car parts, boosts) to populate catalog tables |

---

## Utility

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/track-name-aliases` | No | List track name alias mappings (for fuzzy matching) |
| GET | `/api/ai-loadouts` | Yes | Get AI-suggested loadouts |
| GET | `/api/ai-loadouts/track/[trackName]/[difficulty]` | Yes | Get AI-suggested loadout for a specific track and difficulty |
| GET | `/api/admin-check` | Yes | Returns `{ isAdmin: boolean }` for the current user |
| POST | `/api/migrate` | Yes (admin) | Trigger a data migration task |

---

## Debug

Development/maintenance endpoints — not intended for production use.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/debug` | Yes (admin) | General debug info and DB diagnostics |
| GET | `/api/debug/track-aliases` | Yes (admin) | Inspect current track alias data |
| POST | `/api/debug/create-track-aliases-table` | Yes (admin) | Create the track_name_aliases table if missing |
