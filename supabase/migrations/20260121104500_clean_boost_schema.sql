-- Clean up boost schema by removing unnecessary fields
-- Migration: 20260121104500_clean_boost_schema

-- Remove unnecessary columns from boosts table
ALTER TABLE boosts DROP COLUMN IF EXISTS boost_type;
ALTER TABLE boosts DROP COLUMN IF EXISTS rarity;
ALTER TABLE boosts DROP COLUMN IF EXISTS series;
ALTER TABLE boosts DROP COLUMN IF EXISTS season_id;

-- Rename card_count to count in user_boosts table
ALTER TABLE user_boosts RENAME COLUMN card_count TO count;

-- Update any indexes that might reference the removed columns
DROP INDEX IF EXISTS idx_boosts_season_id;
DROP INDEX IF EXISTS idx_boosts_rarity;
DROP INDEX IF EXISTS idx_boosts_series;

-- Update updated_at trigger to still work
-- (No changes needed as it uses wildcard UPDATE)
