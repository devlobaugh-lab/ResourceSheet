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

### Phase 4: Testing & Verification (Pending)

1. Apply migration to database
2. Upload content_cache.json
3. Verify tracks are populated correctly
4. Verify Track Guides and GP Guides work with new track IDs
5. Run CI checks

## Affected Files

| File | Change |
|------|--------|
| `supabase/migrations/20260221000000_rework_tracks_table.sql` | New migration for schema changes |
| `src/app/api/admin/content-cache/upload/route.ts` | Added track/series processing |
| `src/app/admin/tracks/page.tsx` | Deleted |
| `src/app/tracks/page.tsx` | Created new reference page |
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

## Notes

- Track data is season-specific and will be refreshed on each content_cache upload
- Track aliases are preserved across uploads and must be manually maintained
- The `series_data` table is populated for future features