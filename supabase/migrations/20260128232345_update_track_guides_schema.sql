-- Update user_track_guides table for new layout structure

-- Drop existing foreign key constraints that might cause issues
ALTER TABLE user_track_guides DROP CONSTRAINT IF EXISTS user_track_guides_free_boost_id_fkey;
ALTER TABLE user_track_guides DROP CONSTRAINT IF EXISTS user_track_guides_saved_setup_id_fkey;

-- Add new fields for the new layout structure
ALTER TABLE user_track_guides 
ADD COLUMN driver_1_id UUID REFERENCES drivers(id),
ADD COLUMN driver_2_id UUID REFERENCES drivers(id),
ADD COLUMN driver_1_boost_id UUID REFERENCES boosts(id),
ADD COLUMN driver_2_boost_id UUID REFERENCES boosts(id),
ADD COLUMN alt_driver_ids JSONB DEFAULT '[]',
ADD COLUMN alt_boost_ids JSONB DEFAULT '[]';

-- Update the table to use the new fields instead of arrays
-- Note: We're keeping the old fields for now to avoid breaking existing data during development
-- In production, you would drop the old fields after migration

-- Create indexes for the new fields
CREATE INDEX idx_user_track_guides_driver_1_id ON user_track_guides(driver_1_id);
CREATE INDEX idx_user_track_guides_driver_2_id ON user_track_guides(driver_2_id);
CREATE INDEX idx_user_track_guides_driver_1_boost_id ON user_track_guides(driver_1_boost_id);
CREATE INDEX idx_user_track_guides_driver_2_boost_id ON user_track_guides(driver_2_boost_id);

-- Add comments for documentation
COMMENT ON COLUMN user_track_guides.driver_1_id IS 'Primary driver selection for the new layout';
COMMENT ON COLUMN user_track_guides.driver_2_id IS 'Secondary driver selection for the new layout';
COMMENT ON COLUMN user_track_guides.driver_1_boost_id IS 'Boost for driver 1';
COMMENT ON COLUMN user_track_guides.driver_2_boost_id IS 'Boost for driver 2';
COMMENT ON COLUMN user_track_guides.alt_driver_ids IS 'Array of alternate driver IDs for the Alt Drivers section';
COMMENT ON COLUMN user_track_guides.alt_boost_ids IS 'Array of alternate boost IDs for the Alt Boosts section';

-- Update RLS policies to include new fields
-- Note: This assumes existing RLS policies exist, we're just ensuring they cover the new fields