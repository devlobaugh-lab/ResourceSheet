-- Add season_id to series_data and ai_track_loadouts tables
-- These were previously global full-refresh tables; now scoped per season

ALTER TABLE series_data ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_series_data_season_id ON series_data(season_id);

ALTER TABLE ai_track_loadouts ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_ai_track_loadouts_season_id ON ai_track_loadouts(season_id);
