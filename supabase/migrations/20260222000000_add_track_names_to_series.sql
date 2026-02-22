-- Migration: Add track_names column to series_data
-- Description: Store track names alongside track_ids for easier lookup in the deduplicated tracks table

ALTER TABLE series_data ADD COLUMN IF NOT EXISTS track_names TEXT[] DEFAULT '{}';

COMMENT ON COLUMN series_data.track_names IS 'Array of track names corresponding to track_ids, for lookup in the deduplicated tracks table';