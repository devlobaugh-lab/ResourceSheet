-- Track rotation sets (7 fixed sets, rarely change)
CREATE TABLE track_rotation_sets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_number  INTEGER NOT NULL UNIQUE CHECK (set_number BETWEEN 1 AND 7),
  series_data JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Track rotation schedule (grows over time)
CREATE TABLE track_rotation_schedule (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rotation_set_id  UUID NOT NULL REFERENCES track_rotation_sets(id) ON DELETE CASCADE,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  CHECK (end_date >= start_date),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_track_rotation_schedule_dates ON track_rotation_schedule(start_date, end_date);


