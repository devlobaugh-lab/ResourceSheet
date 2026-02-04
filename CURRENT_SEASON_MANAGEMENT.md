# Current Season Management

This document explains how the F1 Resource Manager application tracks and manages the current active season.

## Overview

The application uses a simple but effective approach to track the current season:

- **Database Field**: `is_active` boolean field in the `seasons` table
- **Current Implementation**: Season 6 is marked as active
- **Management**: Can be changed via SQL or admin interface

## Database Schema

```sql
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

## Current State

As of the latest setup:
- **Active Season**: Season 6
- **Season ID**: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`
- **Status**: `is_active = true`

## Changing the Active Season

To change which season is currently active:

```sql
-- Deactivate current season
UPDATE seasons SET is_active = false WHERE is_active = true;

-- Activate new season (replace with actual season name/ID)
UPDATE seasons SET is_active = true WHERE name = 'Season 7';
```

## API Usage

The seasons API automatically filters by active status when requested:

```javascript
// Get all seasons
GET /api/seasons

// Get only active seasons
GET /api/seasons?is_active=true
```

## Frontend Usage

The admin/tracks page uses the seasons data in two ways:

1. **Filter Dropdown**: Shows all seasons for filtering tracks
2. **Create/Edit Form**: Shows all seasons for assigning tracks to seasons

## Future Enhancements

For future development, consider adding:

1. **Admin Interface**: Web interface for season management
2. **Validation**: Ensure only one season is active at a time
3. **Archiving**: Mark old seasons as archived/inactive
4. **Season Metadata**: Add start/end dates, description, etc.

## Development Notes

- The current approach is intentionally simple for the MVP
- No complex season management features are needed yet
- The `is_active` field provides a clean way to identify the current season
- Easy to extend with additional season-related functionality later

## Commands

```bash
# Check current active season
curl http://localhost:3000/api/seasons?is_active=true

# Re-seed seasons if needed
node scripts/seed_seasons.js

# Complete database initialization
npm run db:init