CREATE TABLE user_rotation_series_data (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rotation_set_id  UUID NOT NULL REFERENCES track_rotation_sets(id) ON DELETE CASCADE,
  series_index     INTEGER NOT NULL,  -- 9, 10, or 11
  driver_1_id      UUID REFERENCES drivers(id) ON DELETE SET NULL,
  driver_2_id      UUID REFERENCES drivers(id) ON DELETE SET NULL,
  saved_setup_id   UUID REFERENCES user_car_setups(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, rotation_set_id, series_index)
);

CREATE TABLE user_rotation_track_data (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rotation_set_id  UUID NOT NULL REFERENCES track_rotation_sets(id) ON DELETE CASCADE,
  series_index     INTEGER NOT NULL,
  track_position   INTEGER NOT NULL CHECK (track_position BETWEEN 0 AND 3),
  boost_id         UUID REFERENCES boosts(id) ON DELETE SET NULL,
  dry_strategy     TEXT,
  wet_strategy     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, rotation_set_id, series_index, track_position)
);

ALTER TABLE user_rotation_series_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rotation_track_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own rotation series data"
  ON user_rotation_series_data FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own rotation track data"
  ON user_rotation_track_data FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_rot_series ON user_rotation_series_data(user_id, rotation_set_id);
CREATE INDEX idx_user_rot_track ON user_rotation_track_data(user_id, rotation_set_id);
