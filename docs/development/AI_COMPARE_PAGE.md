# AI Compare Page

## Synopsis

The content cache import can provide us with a lot of information about the AI opponents that are on different tracks and scenarios in the game. We want a page that allows a user to see this info in a grid. They can choose the Track/Level option from a dropdown (format: "Champion Bahrain" - Level first, then Track) and it will show a list of the AI drivers and their stats. 

The page will also allow the user to create custom drivers with stats. The user can add these custom drivers to the AI driver grid to be able to compare the custom drivers against the AI drivers. Custom drivers are persisted per-user in the database.

A general idea of the functionality can be seen at https://docs.google.com/spreadsheets/d/1ir_Y_oA_wLmbwFAtxpsDeZcHXh_V3EWnlqqT7UyREKU/edit?gid=431283390#gid=431283390 (the AI Compare tab)

---

## Design Decisions

1. **Dropdown Format**: Combined options with Level first (e.g., "Champion Bahrain")
2. **Custom Drivers**: Database persistence (user-specific, survives across sessions/devices)
3. **Car Parts**: Shown in same grid alongside driver stats
4. **Data Focus**: `trackAILoadouts` only (not `series.botLoadout`)
5. **Grid Layout**: Row per driver (teams split into two rows)
6. **Future-Proofing**: Team-driver mapping table with "Team - D1/D2" fallback

---

## Data Structure

### Source: `trackAILoadouts` (192 entries in content_cache)

```json
{
  "name": "Bahrain Champion",
  "botLoadouts": [
    {
      "teamName": "Mercedes",
      "m_driver1": {
        "overtaking": 27,
        "blocking": 12,
        "qualifying": 32,
        "tyreUse": 22,
        "raceStart": 17
      },
      "m_driver2": { ... },
      "m_frontWing": {
        "speed": 8,
        "cornering": 8,
        "powerUnit": 7,
        "qualifying": 7,
        "drs": 0,
        "pitStopTime": 0.792
      },
      "m_rearWing": { ... },
      "m_suspension": { ... },
      "m_engine": { ... },
      "m_gearbox": { ... },
      "m_brakes": { ... }
    }
  ]
}
```

---

## Database Schema

### Table: `ai_track_loadouts`

Stores AI driver stats parsed from trackAILoadouts. Each team produces 2 rows (driver_slot 1 and 2).

```sql
CREATE TABLE ai_track_loadouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,              -- Original name "Bahrain Champion"
  track_name TEXT NOT NULL,        -- Parsed: "Bahrain"
  difficulty TEXT NOT NULL,        -- Parsed: "Champion"
  team_name TEXT NOT NULL,         -- e.g., "Mercedes"
  driver_slot INTEGER NOT NULL,    -- 1 or 2 (creates two rows per team)
  overtaking INTEGER DEFAULT 0,
  blocking INTEGER DEFAULT 0,
  qualifying INTEGER DEFAULT 0,
  tyre_use INTEGER DEFAULT 0,
  race_start INTEGER DEFAULT 0,
  car_parts JSONB,                 -- {frontWing: {...}, rearWing: {...}, etc.}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `team_driver_names`

Future mapping for team driver names. Default display is "Team - D1/D2" until mapped.

```sql
CREATE TABLE team_driver_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  driver_slot INTEGER NOT NULL,    -- 1 or 2
  driver_name TEXT NOT NULL,       -- Display name for this team/slot combo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_name, driver_slot)
);
```

### Table: `user_custom_drivers`

User-created custom drivers for comparison.

```sql
CREATE TABLE user_custom_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  overtaking INTEGER DEFAULT 0,
  blocking INTEGER DEFAULT 0,
  qualifying INTEGER DEFAULT 0,
  tyre_use INTEGER DEFAULT 0,
  race_start INTEGER DEFAULT 0,
  car_parts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Grid Layout (Row = One Driver)

| Team | Driver | OVT | BLK | QLY | TYR | RST | Total | FW SPD | FW CRN | FW PWR | ... |
|------|--------|-----|-----|-----|-----|-----|--------|---------|---------|---------|-----|

- Each team produces 2 rows (D1, D2)
- Driver name from `team_driver_names` table (fallback: "Team - D1")
- Car part stats shown in same row
- Red-to-green coloring based on column min/max
- Column sorting for all columns
- Custom drivers can be added to grid

---

## Tasks

### Phase 1: Database & Content Cache Import
- [x] Create migration with 3 tables (`ai_track_loadouts`, `team_driver_names`, `user_custom_drivers`)
- [x] Update content-cache upload route to parse `trackAILoadouts`
- [x] Parse name into track_name and difficulty components
- [x] Create 2 rows per team (driver_slot 1 and 2)
- [x] Update database types in `src/types/database.ts`

### Phase 2: API Routes
- [x] Create `GET /api/ai-loadouts` - List unique track/difficulty options
- [x] Create `GET /api/ai-loadouts/track/[trackName]/[difficulty]` - Get loadout rows
- [x] Create `GET /api/team-driver-names` - Get driver name mappings
- [x] Create admin routes for team-driver name mappings
- [x] Create CRUD routes for user custom drivers

### Phase 3: UI Components
- [x] Create `src/app/compare/ai/page.tsx` - Main AI compare page
- [x] Create `AIDriverCompareGrid.tsx` component - Grid display with sorting/coloring
- [x] Implement track/difficulty dropdown selector (format: "Champion Bahrain")
- [x] Create `CustomDriverForm.tsx` - Form to create/edit custom drivers
- [x] Implement adding custom drivers to comparison grid

### Phase 4: Testing & Polish
- [ ] Unit tests for API routes
- [ ] Component tests for grid
- [x] Verify red-to-green coloring works correctly
- [x] Verify column sorting for all columns

---

## Files to Create/Modify

| File | Action | Status |
|------|--------|--------|
| `supabase/migrations/20260220XXXXXX_create_ai_compare_tables.sql` | Create | [ ] |
| `src/types/database.ts` | Update | [ ] |
| `src/app/api/admin/content-cache/upload/route.ts` | Update | [ ] |
| `src/app/api/ai-loadouts/route.ts` | Create | [ ] |
| `src/app/api/ai-loadouts/track/[trackName]/[difficulty]/route.ts` | Create | [ ] |
| `src/app/api/team-driver-names/route.ts` | Create | [ ] |
| `src/app/api/custom-drivers/route.ts` | Create | [ ] |
| `src/app/compare/ai/page.tsx` | Create | [ ] |
| `src/components/AIDriverCompareGrid.tsx` | Create | [ ] |
| `src/components/CustomDriverForm.tsx` | Create | [ ] |

