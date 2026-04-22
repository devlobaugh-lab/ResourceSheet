# FY26 Content Cache Changes — Implementation Plan

## Context

The game's `content_cache` data file has structural changes for FY26: three new `powerBoost` stat fields and a new Battery car part type (type 6) on car parts; three new tier fields on boosts (`powerBoostImpactTier`, `powerBoostDurationTier`, `powerBoostRechargeRateTier` — `DrsTier` was never captured and can be ignored); a new `nextTrackRotationTime` field on series; and removal of `botLoadout`/`aiCarLoadouts` from the incoming game data. These fields are removed from the *game data file* but remain in our DB as nullable columns for backward compatibility with season 6 data — the upload route already handles them with `|| null`.

The app is multi-season: season 6 users have DRS data and 6 car part types; season 7+ introduces Battery (type 6) and Overtake. All season-conditional UI will gate on `activeSeason.season_number >= 7`.

**Confirmed decisions:**
- Battery = carPartType **6**
- Overtake = `powerBoostImpact + powerBoostDuration + powerBoostRechargeRate` (sum)
- `user_car_setups` and `user_rotation_series_data` both need `battery_id` / `setup_battery_id`
- `nextTrackRotationTime`: store in DB only, no UI
- Season detection: add `season_number INTEGER` to the `seasons` table
- UI: swap DRS ↔ Overtake and 6-slot ↔ 7-slot based on `season_number >= 7`

---

## Files to Modify

| Area | File |
|------|------|
| DB migration | `supabase/migrations/<new>.sql` |
| TS types | `src/types/database.ts` |
| Constants | `src/app/data-input/utils/constants.ts` |
| Upload route | `src/app/api/admin/content-cache/upload/route.ts` |
| Setups API | `src/app/api/setups/route.ts` |
| Admin export users | `src/app/api/admin/export/users/route.ts` |
| Admin import users | `src/app/api/admin/import/users/route.ts` |
| Profile export | `src/app/api/export-user-data/route.ts` |
| Profile import | `src/app/api/import-user-data/route.ts` |
| Boost stats display | `src/components/BoostStatsDisplay.tsx` |
| DataGrid columns | `src/components/DataGrid/utils/columns.ts` |
| DataGrid sorting/totals | `src/components/DataGrid/DataGrid.tsx` |
| Part selection modal | `src/components/CarPartSelectionGrid.tsx` |
| Setups page | `src/app/setups/page.tsx` |
| Setup preview | `src/components/SetupPreviewPanel.tsx` |
| Rotation setup card | `src/components/RotationSetupCard.tsx` |

---

## Step-by-Step Plan

### 1. DB Migration (new file)

Create `supabase/migrations/<timestamp>_fy26_content_cache_changes.sql`:

```sql
-- Season versioning for FY26 feature detection
ALTER TABLE seasons ADD COLUMN season_number INTEGER;

-- Battery part slot on saved setups
ALTER TABLE user_car_setups
  ADD COLUMN battery_id UUID REFERENCES car_parts(id) ON DELETE SET NULL;

-- Battery part slot on rotation series setups
ALTER TABLE user_rotation_series_data
  ADD COLUMN setup_battery_id UUID REFERENCES car_parts(id) ON DELETE SET NULL;

-- Next track rotation time from series object (text; game format TBD)
ALTER TABLE series_data
  ADD COLUMN next_track_rotation_time TEXT;
```

No changes to `boosts.boost_stats` or `car_parts.stats_per_level` — both are JSONB; new fields are additive.

---

### 2. TypeScript Types (`src/types/database.ts`)

**`StatLevel` interface (line ~1061):**
- Make `drs` optional: `drs?: number`
- Add new fields:
  ```ts
  powerBoostImpact?: number
  powerBoostDuration?: number
  powerBoostRechargeRate?: number
  ```

**`UserCarSetup` interface (line ~1033):**
- Add `battery_id: string | null`

**`UserCarSetupWithParts` interface (line ~1052):**
- Add `battery?: CarPartView`

**`SeriesData` interface (line ~1015):**
- Add `next_track_rotation_time: string | null`
- Add `@deprecated` JSDoc to `bot_loadout` and `ai_car_loadouts` (keep columns; removed from FY26 game data but season 6 data relies on them)

**`Season` type** is auto-generated from `Tables<'seasons'>` — regenerate after migration with `npm run db:generate`. Confirm `season_number: number | null` appears in the generated type.

---

### 3. Constants (`src/app/data-input/utils/constants.ts`)

Add `6: 'Battery'` to `PART_TYPE_NAMES` (currently maps 0–5).

---

### 4. Content Cache Upload (`src/app/api/admin/content-cache/upload/route.ts`)

**Car parts — stats_per_level mapping (line ~377):**
```ts
stats_per_level: (part.carPartStatsPerLevel || []).map((stat: any) => ({
  ...stat,
  drs: stat.drs ?? 0,                          // keep for S6 backward compat
  powerBoostImpact: stat.powerBoostImpact ?? 0,
  powerBoostDuration: stat.powerBoostDuration ?? 0,
  powerBoostRechargeRate: stat.powerBoostRechargeRate ?? 0,
})),
```

**Boosts — boost_stats mapping (line ~401):**
Add three new tier fields to the object:
```ts
power_boost_impact: boost.powerBoostImpactTier || 0,
power_boost_duration: boost.powerBoostDurationTier || 0,
power_boost_recharge_rate: boost.powerBoostRechargeRateTier || 0,
```
(`DrsTier` was never captured — no removal needed.)

**Series mapping (line ~608):**
```ts
bot_loadout: s.botLoadout || null,            // keep for S6 compat
ai_car_loadouts: s.aiCarLoadouts || null,     // keep for S6 compat
next_track_rotation_time: s.nextTrackRotationTime || null,
```

---

### 5. Setups API (`src/app/api/setups/route.ts`)

Add to `setupSchema` (line ~9):
```ts
battery_id: z.string().uuid().nullable(),
```

---

### 6. Import/Export Routes

All four routes need `battery_id` plumbed through for `user_car_setups`:

- **Admin export users** (`src/app/api/admin/export/users/route.ts`): include `battery_id` in `userCarSetups` export payload.
- **Admin import users** (`src/app/api/admin/import/users/route.ts`): include `battery_id` in the upsert for `user_car_setups`.
- **Profile export** (`src/app/api/export-user-data/route.ts`): include `battery_id` in `userCarSetups` export.
- **Profile import** (`src/app/api/import-user-data/route.ts`): include `battery_id` in the `user_car_setups` upsert.

---

### 7. UI: Boosts — BoostStatsDisplay (`src/components/BoostStatsDisplay.tsx`)

Add 3 new stats to `statIcons` map and the `stats` array (use existing icons as placeholders):
- `power_boost_impact` → label `'PB Impact'`, icon: `BsLightningChargeFill`
- `power_boost_duration` → label `'PB Duration'`, icon: `BsStopwatch`
- `power_boost_recharge_rate` → label `'PB Recharge'`, icon: `PiSpeedometerBold`

These follow the same tier-based rendering as existing stats (hidden when tier = 0, value = tier × 5).

**No season-gating needed here** — new stats are simply absent (0) for S6 boosts and hidden by the existing `> 0` filter.

---

### 8. UI: DataGrid — Columns & Sorting

**`src/components/DataGrid/utils/columns.ts`:**
- The column list needs to be season-aware. Change signature to accept `seasonNumber: number | null` and conditionally include either `drs` (S6) or `overtake` (S7+):
  ```ts
  // season_number < 7 (or null): include drs column
  // season_number >= 7: include overtake column
  ```

**`src/components/DataGrid/DataGrid.tsx`:**
- Accept and pass `seasonNumber` to `getCarPartColumns()`
- Add `'Battery'` (type 6) to the car_part_type display map
- In stat sort cases: add `'overtake'` alongside existing stat cases; keep `'drs'`
- In `getStatValueForSort`: add `overtake` key that sums `powerBoostImpact + powerBoostDuration + powerBoostRechargeRate` from stats_per_level
- In `total_value` calculation: use `overtake` when S7+, `drs` when S6

**Where `DataGrid` is used** (`src/app/parts/page.tsx` and similar): pass `activeSeason?.season_number` through to the DataGrid.

---

### 9. UI: CarPartSelectionGrid (`src/components/CarPartSelectionGrid.tsx`)

- Accept a `seasonNumber` prop
- When `seasonNumber < 7` (or null): show `drs` column, hide powerboost/overtake columns
- When `seasonNumber >= 7`: hide `drs`, show `overtake` column (computed as sum of 3 fields)
- Additionally, when `partType === 6` (Battery) AND `seasonNumber >= 7`: also show the individual `powerBoostImpact`, `powerBoostDuration`, `powerBoostRechargeRate` columns
- Update stat calculation to compute `overtake` at display time from `stats_per_level`
- Update color-coding: treat `overtake` as ascending (higher = better, like speed)

---

### 10. UI: Setups Page (`src/app/setups/page.tsx`)

**Season-aware part types:** Build `PART_TYPES` dynamically based on `activeSeason?.season_number`:
- S6 (< 7): current 6-part list
- S7+: append `{ key: 'battery', type: 6, name: 'Battery', label: 'Battery' }`

**`createEmptySlot()`:** When on S7+, include `battery: ''` in `selectedParts`.

**Total stats calculation:** On S7+, compute `overtake` as:
```ts
stats.overtake = getStatValue(part, 'powerBoostImpact', ...) +
                 getStatValue(part, 'powerBoostDuration', ...) +
                 getStatValue(part, 'powerBoostRechargeRate', ...)
```
On S6, keep `drs` accumulation.

**Setup grid layout:**
- S6: existing 3+3 (two rows of 3)
- S7+: 4+3 (first row 4, second row 3)

**Stats summary display:**
- S6: show DRS row
- S7+: show Overtake row (replace DRS)

**Setup suggest algorithm:** On S7+, include Battery in the part-type loop. No S7-specific scoring type needed for now (Battery overtake fields are additive; the existing score logic scores only the selected stats, Battery contributes 0 to non-overtake setups).

**DB save/load:** On S7+, include `battery_id` in the setup payload sent to `/api/setups`.

---

### 11. UI: SetupPreviewPanel (`src/components/SetupPreviewPanel.tsx`)

Accept `seasonNumber` prop:
- S7+: add `{ key: 'battery', type: 6, label: 'Battery' }` to part types; show Overtake stat instead of DRS
- S6: unchanged

---

### 12. UI: RotationSetupCard (`src/components/RotationSetupCard.tsx`)

Accept `seasonNumber` prop:
- S7+: add `{ key: 'battery', dbKey: 'setup_battery_id', type: 6, label: 'Battery' }` to `PART_TYPES`; show Overtake stat instead of DRS
- S6: unchanged

---

## TDD Approach

No test files currently exist in `src/`. Create new test files alongside changed modules following the project's Red/Green/Refactor pattern.

**Priority test files:**

1. **`src/app/api/admin/content-cache/upload/upload.test.ts`**
   - Battery car part (type 6) maps correctly
   - `powerBoostImpact/Duration/RechargeRate` default to 0 when absent (S6 backward compat)
   - New boost tier fields map to `boost_stats`
   - Series `nextTrackRotationTime` maps to `next_track_rotation_time`
   - Series without `botLoadout`/`aiCarLoadouts` doesn't error

2. **Overtake calculation util** (extract as pure function, test separately):
   - Sum of 3 fields at various levels
   - Returns 0 for non-Battery parts (all three fields absent/zero)

3. **`BoostStatsDisplay` component test:**
   - New stats render when tier > 0
   - Hidden when tier = 0

---

## Verification

1. `npm run db:push` — apply migration locally
2. `npm run db:generate` — regenerate TS types; confirm `season_number` appears on `Season`
3. `npm run type-check` — zero errors
4. Import a FY26 content cache file via `/admin → Content Cache` — verify Battery parts save, new boost fields save, `next_track_rotation_time` saves
5. Import a season 6 content cache file — DRS loads for S6 parts, `botLoadout` saves, no errors on absent `powerBoost` fields
6. Set a season's `season_number` to 7 in the DB; switch to that season:
   - `/parts`: Overtake column visible, DRS absent, Battery parts labelled correctly
   - `/setups`: 7-slot grid, Battery slot present, Overtake in stats summary
   - Part select modal for Battery slot: powerboost + overtake columns visible
7. Switch to a season with `season_number < 7`: DRS column back, 6-slot grid, no Battery slot
8. Export/import cycle for both user and admin export — `battery_id` round-trips correctly
