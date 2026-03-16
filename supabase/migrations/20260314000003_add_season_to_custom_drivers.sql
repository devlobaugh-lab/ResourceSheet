-- Add season_id to user_custom_drivers for season-scoped filtering.
ALTER TABLE user_custom_drivers
  ADD COLUMN season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;

CREATE INDEX idx_user_custom_drivers_season_id ON user_custom_drivers(season_id);

-- Backfill: assign existing null-season drivers to the highest-numbered season,
-- which is the most appropriate default for drivers created before this column existed.
UPDATE user_custom_drivers
SET season_id = (
  SELECT id FROM seasons ORDER BY name DESC LIMIT 1
)
WHERE season_id IS NULL;
