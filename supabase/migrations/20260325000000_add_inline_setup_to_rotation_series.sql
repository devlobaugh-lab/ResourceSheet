ALTER TABLE user_rotation_series_data
  ADD COLUMN setup_brake_id      UUID REFERENCES car_parts(id) ON DELETE SET NULL,
  ADD COLUMN setup_gearbox_id    UUID REFERENCES car_parts(id) ON DELETE SET NULL,
  ADD COLUMN setup_rear_wing_id  UUID REFERENCES car_parts(id) ON DELETE SET NULL,
  ADD COLUMN setup_front_wing_id UUID REFERENCES car_parts(id) ON DELETE SET NULL,
  ADD COLUMN setup_suspension_id UUID REFERENCES car_parts(id) ON DELETE SET NULL,
  ADD COLUMN setup_engine_id     UUID REFERENCES car_parts(id) ON DELETE SET NULL,
  ADD COLUMN setup_bonus_percentage INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN setup_series_filter    INTEGER NOT NULL DEFAULT 12,
  DROP COLUMN saved_setup_id;
