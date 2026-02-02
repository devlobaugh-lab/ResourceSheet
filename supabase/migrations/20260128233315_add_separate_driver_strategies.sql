-- Add separate strategy fields for each driver
ALTER TABLE user_track_guides 
ADD COLUMN IF NOT EXISTS driver_1_dry_strategy TEXT,
ADD COLUMN IF NOT EXISTS driver_1_wet_strategy TEXT,
ADD COLUMN IF NOT EXISTS driver_2_dry_strategy TEXT,
ADD COLUMN IF NOT EXISTS driver_2_wet_strategy TEXT;

-- Update the table comment to reflect the new structure
COMMENT ON TABLE user_track_guides IS 'Track guides with separate driver configurations and strategies';
