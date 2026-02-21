-- Migration: Create AI Compare tables
-- Description: Creates tables for AI driver loadouts, team driver name mappings, and user custom drivers

-- Table: ai_track_loadouts
-- Stores AI driver stats parsed from trackAILoadouts in content_cache
-- Each team produces 2 rows (driver_slot 1 and 2)
CREATE TABLE ai_track_loadouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,              -- Original name from content_cache (e.g., "Bahrain Champion")
  track_name TEXT NOT NULL,        -- Parsed track name (e.g., "Bahrain")
  difficulty TEXT NOT NULL,        -- Parsed difficulty level (e.g., "Champion")
  team_name TEXT NOT NULL,         -- Team name (e.g., "Mercedes")
  driver_slot INTEGER NOT NULL,    -- 1 or 2 (creates two rows per team)
  overtaking INTEGER DEFAULT 0,
  blocking INTEGER DEFAULT 0,
  qualifying INTEGER DEFAULT 0,
  tyre_use INTEGER DEFAULT 0,
  race_start INTEGER DEFAULT 0,
  car_parts JSONB,                 -- {frontWing: {...}, rearWing: {...}, suspension: {...}, engine: {...}, gearbox: {...}, brakes: {...}}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate entries
  UNIQUE(name, team_name, driver_slot)
);

-- Index for common queries
CREATE INDEX idx_ai_track_loadouts_track_difficulty ON ai_track_loadouts(track_name, difficulty);
CREATE INDEX idx_ai_track_loadouts_name ON ai_track_loadouts(name);

-- Table: team_driver_names
-- Future mapping for team driver names
-- Default display is "Team - D1/D2" until mapped
CREATE TABLE team_driver_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  driver_slot INTEGER NOT NULL,    -- 1 or 2
  driver_name TEXT NOT NULL,       -- Display name for this team/slot combo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One mapping per team/slot combination
  UNIQUE(team_name, driver_slot)
);

-- Index for lookups
CREATE INDEX idx_team_driver_names_team ON team_driver_names(team_name);

-- Table: user_custom_drivers
-- User-created custom drivers for comparison
CREATE TABLE user_custom_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  overtaking INTEGER DEFAULT 0,
  blocking INTEGER DEFAULT 0,
  qualifying INTEGER DEFAULT 0,
  tyre_use INTEGER DEFAULT 0,
  race_start INTEGER DEFAULT 0,
  car_parts JSONB,                 -- Optional car part stats for comparison
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX idx_user_custom_drivers_user ON user_custom_drivers(user_id);

-- RLS Policies for user_custom_drivers
ALTER TABLE user_custom_drivers ENABLE ROW LEVEL SECURITY;

-- Users can only see their own custom drivers
CREATE POLICY "Users can view their own custom drivers" ON user_custom_drivers
  FOR SELECT USING (auth.uid()::uuid = user_id);

-- Users can insert their own custom drivers
CREATE POLICY "Users can insert their own custom drivers" ON user_custom_drivers
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

-- Users can update their own custom drivers
CREATE POLICY "Users can update their own custom drivers" ON user_custom_drivers
  FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Users can delete their own custom drivers
CREATE POLICY "Users can delete their own custom drivers" ON user_custom_drivers
  FOR DELETE USING (auth.uid()::uuid = user_id);

-- RLS Policies for ai_track_loadouts (read-only for all authenticated users)
ALTER TABLE ai_track_loadouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ai_track_loadouts" ON ai_track_loadouts
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for team_driver_names (read for all authenticated, write for admins)
ALTER TABLE team_driver_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view team_driver_names" ON team_driver_names
  FOR SELECT TO authenticated USING (true);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_ai_track_loadouts_updated_at
  BEFORE UPDATE ON ai_track_loadouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_driver_names_updated_at
  BEFORE UPDATE ON team_driver_names
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_custom_drivers_updated_at
  BEFORE UPDATE ON user_custom_drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON ai_track_loadouts TO authenticated;
GRANT SELECT ON team_driver_names TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_custom_drivers TO authenticated;