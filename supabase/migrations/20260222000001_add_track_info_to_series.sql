-- Add track_info column to series_data table
-- This stores series-specific track information including lap counts
-- Series 0 and 1 have different lap counts than other series for the same tracks

ALTER TABLE series_data 
ADD COLUMN IF NOT EXISTS track_info JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN series_data.track_info IS 'Array of track info objects with name, laps, driverStat, carStat for this specific series';