-- Add is_free column to boosts table for Track Guides feature
ALTER TABLE boosts ADD COLUMN is_free BOOLEAN DEFAULT false NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN boosts.is_free IS 'Indicates if this boost is a free boost for Track Guide recommendations';
