-- Step 1: Create track_seasons junction table
CREATE TABLE track_seasons (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id   TEXT    NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  season_id  UUID    NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (track_id, season_id)
);

CREATE INDEX idx_track_seasons_track_id  ON track_seasons(track_id);
CREATE INDEX idx_track_seasons_season_id ON track_seasons(season_id);

ALTER TABLE track_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read track_seasons"
  ON track_seasons FOR SELECT USING (true);

CREATE POLICY "Admins can manage track_seasons"
  ON track_seasons FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Migrate existing season associations from tracks to junction table
INSERT INTO track_seasons (track_id, season_id, is_active)
SELECT id, season_id, COALESCE(is_active, true)
FROM tracks
WHERE season_id IS NOT NULL;

-- Drop season_id and is_active from tracks (now lives in track_seasons)
ALTER TABLE tracks DROP COLUMN season_id;
ALTER TABLE tracks DROP COLUMN is_active;

-- Step 2: Add season_id to user_track_guides
ALTER TABLE user_track_guides
  ADD COLUMN season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;

-- Drop old unique constraint and replace with season-scoped one
ALTER TABLE user_track_guides DROP CONSTRAINT IF EXISTS user_track_guides_user_id_track_id_gp_level_key;
ALTER TABLE user_track_guides ADD CONSTRAINT user_track_guides_user_id_track_id_season_id_gp_level_key
  UNIQUE (user_id, track_id, season_id, gp_level);

CREATE INDEX idx_user_track_guides_season_id ON user_track_guides(season_id);
