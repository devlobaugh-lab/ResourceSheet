-- Add alternate_driver_ids column to user_track_guides table
ALTER TABLE user_track_guides 
ADD COLUMN IF NOT EXISTS alternate_driver_ids JSONB DEFAULT '[]';

-- Add comment for documentation
COMMENT ON COLUMN user_track_guides.alternate_driver_ids IS 'Array of driver IDs for alternate driver suggestions (replaces positions 2-7 in suggested_drivers)';
