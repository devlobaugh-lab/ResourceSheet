# Track data re-work

## Overview

This document outlines the plan for reworking how track data is populated and maintained in the application.

## Problem Statement

We currently have a track management section where an admin user manually manages track data. This data is then used by Track Guides and GP Guides. 

When we added the AI Compare, we brought in track data from the content_cache. The goal is to source track data from content_cache automatically instead of manually, so if new tracks are added or tracks are changed, we will notice and capture that data.

## Data Analysis

### content_cache Structure

The content_cache contains:
- `trackData` array: Contains track definitions with:
  - `id`: System track ID (UUID)
  - `name`: Track name (e.g., "Barcelona")
  - `trackGuid`: Generic track GUID
  - `lapcount`: Number of laps
  - `strongStatA`: Driver stat (TyreUse, Overtaking, Blocking, RaceStart, None)
  - `strongStatB`: Car stat (Cornering, PowerUnit, Speed, None)

- `series` array: Contains series info with:
  - `index`: Series number (0-11)
  - `trackIds`: Array of track IDs in this series
  - Series 0 is beginner tracks (skip for main tracks)
  - Series 1-11 are current season tracks

### Duplicate Track Issue

The same track appears multiple times in `trackData` with different IDs for different series levels:
- Same track name can have different lap counts (lower series = fewer laps)
- Stats (strongStatA/B) are typically the same

**Solution**: Pick tracks from the highest series (Series 11 = Champion level) as the canonical track definition.

## Implementation Plan

### Phase 1: Database Changes ✅

1. **Create backup table** `tracks_backup`
2. **Create `series_data` table** for future features
3. **Modify `tracks` table**:
   - Change `id` from UUID to TEXT (store content_cache ID)
   - Add `track_guid` column
   - Add `is_active` column
   - Remove `alt_name` column (using track_name_aliases instead)
   - Keep `season_id` relationship

4. **Update foreign keys** in Track Guides and GP Guides tables to use TEXT IDs

### Phase 2: Content Cache Processing ✅

Updated `src/app/api/admin/content-cache/upload/route.ts` to:

1. Parse `series` array and store in `series_data` table
2. Parse `trackData` array
3. Filter tracks to those in series 1-11 (skip series 0)
4. Deduplicate by name, keeping highest series entry
5. Map stat values:
   - `TyreUse` → `tyreUse`
   - `Overtaking` → `overtaking`
   - `Blocking` → `defending`
   - `RaceStart` → `raceStart`
   - `Cornering` → `cornering`
   - `PowerUnit` → `powerUnit`
   - `Speed` → `speed`
   - `None` → `none`

### Phase 3: UI Changes ✅

1. **Created Tracks Reference page** at `/tracks`
   - Shows all tracks with name, laps, driver stat, car stat, active status
   - Linked from Reference menu in navigation

2. **Removed Track Management admin page**
   - Tracks are now managed automatically via content_cache upload

3. **Updated admin dashboard**
   - Replaced "Track Management" with "Track Name Aliases"
   - Track aliases still need manual management

### Phase 4: Testing & Verification ✅

1. Applied migration to database
2. Uploaded content_cache.json
3. Verified tracks are populated correctly
4. Verified Track Guides and GP Guides work with new track IDs
5. CI checks pass

### Phase 5: Track Alias Integration ✅

1. **Tracks Page** (`/tracks`)
   - Displays alias name if set: "Display Name (Original Name)"
   - Tracks sorted alphabetically by display name (alias || name)

2. **Track Guides Page** (`/track-guides`)
   - Track dropdown shows alias name if available
   - Tracks sorted by display name

3. **Individual Track Guide Page** (`/track-guides/[id]`)
   - Track selector shows alias name in dropdown
   - Tracks sorted by display name

4. **GP Guides Page** (`/gp-guides/[id]`)
   - Track dropdown shows alias name if available
   - Tracks sorted by display name

### Phase 6: Bug Fixes & Polish ✅

1. **Fixed `alt_name` column references**
   - Removed `alt_name` from all API selects (track-guides, gp-guides import)
   - Track now returns `display_name` computed from alias lookup

2. **Track Aliases Admin Page**
   - Added auto-focus to System Name field when modal opens

3. **GP Guide Import Improvements**
   - Missing track guides no longer throw 404 console errors
   - Returns `{ found: false }` for missing guides, `{ found: true }` for found
   - Bulk import silently skips missing guides and shows summary

## Affected Files

| File | Change |
|------|--------|
| `supabase/migrations/20260221000000_rework_tracks_table.sql` | New migration for schema changes |
| `supabase/migrations/20260220220000_create_track_name_aliases.sql` | Track name aliases table |
| `src/app/api/admin/content-cache/upload/route.ts` | Added track/series processing |
| `src/app/api/tracks/route.ts` | Returns display_name from alias lookup |
| `src/app/api/track-guides/route.ts` | Fixed alt_name references |
| `src/app/api/track-guides/[id]/route.ts` | Fixed alt_name references |
| `src/app/api/gp-guides/[id]/import/[trackId]/route.ts` | Graceful missing guide handling |
| `src/app/admin/tracks/page.tsx` | Deleted |
| `src/app/tracks/page.tsx` | Created new reference page with alias support |
| `src/app/track-guides/page.tsx` | Added alias display and sorting |
| `src/app/track-guides/[id]/page.tsx` | Added alias support in dropdown |
| `src/app/gp-guides/[id]/page.tsx` | Added alias support, fixed import handling |
| `src/app/admin/track-aliases/page.tsx` | Added auto-focus to modal |
| `src/components/NavigationMenu.tsx` | Added Tracks link |
| `src/app/admin/page.tsx` | Updated admin sections |

## Migration Instructions

1. **Apply the migration**:
   ```bash
   # For local development with Supabase CLI
   supabase db push
   
   # Or apply manually via SQL editor
   ```

2. **Upload content_cache.json** via Admin > Content Cache Management

3. **Verify tracks** at `/tracks`

4. **Manage track aliases** via Admin > Track Name Aliases if needed

## Track Name Aliases

Track aliases provide user-friendly display names for tracks. For example:
- System name: "Americas" → Display name: "Austin"
- System name: "GreatBritain" → Display name: "Silverstone"

### How Aliases Work

1. **Database Table**: `track_name_aliases` stores `system_name` → `display_name` mappings
2. **API Response**: Tracks API returns `display_name` computed from alias lookup
3. **UI Display**: All track selectors show the alias name when available
4. **Sorting**: Tracks are sorted by display name (alias || original name)

### Adding Aliases

1. Go to Admin > Track Name Aliases
2. Click "Add Alias"
3. Enter system name (exact match from content_cache)
4. Enter display name (user-friendly name)

## Notes

- Track data is season-specific and will be refreshed on each content_cache upload
- Track aliases are preserved across uploads and must be manually maintained
- The `series_data` table is populated for future features
- Aliases are cached for 5 minutes to improve performance