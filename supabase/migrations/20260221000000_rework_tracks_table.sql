-- Migration: Rework tracks table for content_cache integration
-- Description: Backup existing tracks, create series table, modify tracks table to use content_cache IDs

-- =====================================================
-- STEP 1: Create backup of existing tracks table
-- =====================================================
CREATE TABLE tracks_backup AS SELECT * FROM tracks;

-- =====================================================
-- STEP 2: Create series table for future features
-- =====================================================
CREATE TABLE series_data (
  index INTEGER PRIMARY KEY,
  entry_fee INTEGER,
  win_flags INTEGER,
  loss_flags INTEGER,
  win_rep INTEGER,
  flags_to_unlock INTEGER,
  max_flags INTEGER,
  track_ids TEXT[] DEFAULT '{}',
  bot_loadout JSONB,
  ai_car_loadouts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger for series_data
CREATE TRIGGER update_series_data_updated_at
  BEFORE UPDATE ON series_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on series_data
ALTER TABLE series_data ENABLE ROW LEVEL SECURITY;

-- Public read access for series_data
CREATE POLICY "Anyone can read series_data"
  ON series_data
  FOR SELECT
  USING (true);

-- Only admins can manage series_data
CREATE POLICY "Admins can manage series_data"
  ON series_data
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- STEP 3: Drop foreign key constraints from dependent tables
-- =====================================================

-- Drop constraints from user_track_guides
ALTER TABLE user_track_guides DROP CONSTRAINT IF EXISTS user_track_guides_track_id_fkey;

-- Drop constraints from user_gp_guide_tracks  
ALTER TABLE user_gp_guide_tracks DROP CONSTRAINT IF EXISTS user_gp_guide_tracks_track_id_fkey;

-- Drop constraints from user_gp_guide_results
ALTER TABLE user_gp_guide_results DROP CONSTRAINT IF EXISTS user_gp_guide_results_track_id_fkey;

-- =====================================================
-- STEP 4: Clear existing data from dependent tables (test data)
-- =====================================================
DELETE FROM user_track_guides;
DELETE FROM user_gp_guide_tracks;
DELETE FROM user_gp_guide_results;

-- Clear existing tracks
DELETE FROM tracks;

-- =====================================================
-- STEP 5: Modify tracks table - drop primary key first
-- =====================================================

-- Drop the existing primary key constraint (CASCADE to drop dependent FKs)
ALTER TABLE tracks DROP CONSTRAINT IF EXISTS tracks_pkey CASCADE;

-- Change id column from UUID to TEXT
ALTER TABLE tracks ALTER COLUMN id TYPE TEXT;

-- Add new columns
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS track_guid TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Remove alt_name column (will use track_name_aliases instead)
ALTER TABLE tracks DROP COLUMN IF EXISTS alt_name;

-- Set new primary key
ALTER TABLE tracks ADD PRIMARY KEY (id);

-- Update the handle_updated_at trigger (drop and recreate)
DROP TRIGGER IF EXISTS handle_updated_at_tracks ON tracks;
CREATE TRIGGER handle_updated_at_tracks
  BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add index on track_guid for lookups
CREATE INDEX IF NOT EXISTS idx_tracks_track_guid ON tracks(track_guid);
CREATE INDEX IF NOT EXISTS idx_tracks_is_active ON tracks(is_active);

-- =====================================================
-- STEP 6: Update foreign key columns in dependent tables to TEXT
-- =====================================================

-- Update user_track_guides.track_id to TEXT
ALTER TABLE user_track_guides ALTER COLUMN track_id TYPE TEXT;

-- Update user_gp_guide_tracks.track_id to TEXT
ALTER TABLE user_gp_guide_tracks ALTER COLUMN track_id TYPE TEXT;

-- Update user_gp_guide_results.track_id to TEXT
ALTER TABLE user_gp_guide_results ALTER COLUMN track_id TYPE TEXT;

-- =====================================================
-- STEP 7: Recreate foreign key constraints with TEXT type
-- =====================================================

-- Add foreign key constraint back
ALTER TABLE user_track_guides 
  ADD CONSTRAINT user_track_guides_track_id_fkey 
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE;

-- Add foreign key constraint back
ALTER TABLE user_gp_guide_tracks 
  ADD CONSTRAINT user_gp_guide_tracks_track_id_fkey 
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE;

-- Add foreign key constraint back
ALTER TABLE user_gp_guide_results 
  ADD CONSTRAINT user_gp_guide_results_track_id_fkey 
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 8: Add comments for documentation
-- =====================================================
COMMENT ON TABLE tracks IS 'Race tracks populated from content_cache trackData. ID is the content_cache track ID (TEXT).';
COMMENT ON TABLE series_data IS 'Series data from content_cache. Index 0 is beginner series, 1-11 are main season series.';
COMMENT ON COLUMN tracks.id IS 'Track ID from content_cache trackData (TEXT format of UUID)';
COMMENT ON COLUMN tracks.track_guid IS 'Generic track GUID from content_cache (trackGuid field)';
COMMENT ON COLUMN tracks.driver_track_stat IS 'Driver stat that matters on this track: tyreUse, overtaking, defending, raceStart, none';
COMMENT ON COLUMN tracks.car_track_stat IS 'Car stat that matters on this track: speed, cornering, powerUnit, none';
COMMENT ON COLUMN tracks.is_active IS 'Whether this track is currently active in the season';
COMMENT ON COLUMN series_data.track_ids IS 'Array of track IDs (from trackData.id) that appear in this series';