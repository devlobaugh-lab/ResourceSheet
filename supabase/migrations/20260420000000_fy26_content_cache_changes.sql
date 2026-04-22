-- FY26 content cache structural changes

-- Season versioning for FY26 feature detection (season_number >= 7 = FY26+)
ALTER TABLE seasons ADD COLUMN season_number INTEGER;

-- Battery car part slot on saved setups (new carPartType=6 in FY26)
ALTER TABLE user_car_setups
  ADD COLUMN battery_id UUID REFERENCES car_parts(id) ON DELETE SET NULL;

-- Battery car part slot on rotation series inline setups
ALTER TABLE user_rotation_series_data
  ADD COLUMN setup_battery_id UUID REFERENCES car_parts(id) ON DELETE SET NULL;

-- Next track rotation time from series object (stored as text; game format TBD)
ALTER TABLE series_data
  ADD COLUMN next_track_rotation_time TEXT;
