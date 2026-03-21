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

-- Seed the 7 rotation sets
INSERT INTO track_rotation_sets (set_number, series_data) VALUES
(1, '{
  "9": [
    {"track": "Montréal", "weather": "wet"},
    {"track": "Baku", "weather": "dry"},
    {"track": "Las Vegas", "weather": "dry"},
    {"track": "Abu Dhabi", "weather": "dry"}
  ],
  "10": [
    {"track": "Shanghai", "weather": "dry"},
    {"track": "Imola", "weather": "dry"},
    {"track": "Singapore", "weather": "wet"},
    {"track": "Mexico City", "weather": "dry"}
  ],
  "11": [
    {"track": "Barcelona", "weather": "mixed"},
    {"track": "Montréal", "weather": "wet"},
    {"track": "Zandvoort", "weather": "dry"},
    {"track": "São Paulo", "weather": "dry"}
  ]
}'),
(2, '{
  "9": [
    {"track": "Melbourne", "weather": "dry"},
    {"track": "Jeddah", "weather": "dry"},
    {"track": "Miami", "weather": "dry"},
    {"track": "Spielberg", "weather": "wet"}
  ],
  "10": [
    {"track": "Monaco", "weather": "dry"},
    {"track": "Spielberg", "weather": "dry"},
    {"track": "Zandvoort", "weather": "wet"},
    {"track": "Monza", "weather": "dry"}
  ],
  "11": [
    {"track": "Shanghai", "weather": "wet"},
    {"track": "Sakhir", "weather": "dry"},
    {"track": "Singapore", "weather": "dry"},
    {"track": "Mexico City", "weather": "dry"}
  ]
}'),
(3, '{
  "9": [
    {"track": "Monaco", "weather": "dry"},
    {"track": "Spielberg", "weather": "dry"},
    {"track": "Zandvoort", "weather": "dry"},
    {"track": "Monza", "weather": "wet"}
  ],
  "10": [
    {"track": "Melbourne", "weather": "wet"},
    {"track": "Jeddah", "weather": "dry"},
    {"track": "Miami", "weather": "dry"},
    {"track": "Spielberg", "weather": "dry"}
  ],
  "11": [
    {"track": "Melbourne", "weather": "dry"},
    {"track": "Imola", "weather": "mixed"},
    {"track": "Hungaroring", "weather": "dry"},
    {"track": "Mexico City", "weather": "wet"}
  ]
}'),
(4, '{
  "9": [
    {"track": "Suzuka", "weather": "dry"},
    {"track": "Monaco", "weather": "wet"},
    {"track": "Barcelona", "weather": "dry"},
    {"track": "Montréal", "weather": "dry"}
  ],
  "10": [
    {"track": "Barcelona", "weather": "dry"},
    {"track": "Silverstone", "weather": "wet"},
    {"track": "Spa", "weather": "dry"},
    {"track": "Austin", "weather": "dry"}
  ],
  "11": [
    {"track": "Sakhir", "weather": "dry"},
    {"track": "Silverstone", "weather": "dry"},
    {"track": "Spa", "weather": "mixed"},
    {"track": "Austin", "weather": "wet"}
  ]
}'),
(5, '{
  "9": [
    {"track": "Imola", "weather": "wet"},
    {"track": "Hungaroring", "weather": "dry"},
    {"track": "Singapore", "weather": "dry"},
    {"track": "Mexico City", "weather": "dry"}
  ],
  "10": [
    {"track": "Melbourne", "weather": "dry"},
    {"track": "Imola", "weather": "dry"},
    {"track": "Hungaroring", "weather": "wet"},
    {"track": "Singapore", "weather": "dry"}
  ],
  "11": [
    {"track": "Baku", "weather": "dry"},
    {"track": "São Paulo", "weather": "wet"},
    {"track": "Las Vegas", "weather": "dry"},
    {"track": "Abu Dhabi", "weather": "dry"}
  ]
}'),
(6, '{
  "9": [
    {"track": "Shanghai", "weather": "dry"},
    {"track": "Sakhir", "weather": "dry"},
    {"track": "Imola", "weather": "dry"},
    {"track": "Spa", "weather": "wet"}
  ],
  "10": [
    {"track": "Baku", "weather": "wet"},
    {"track": "São Paulo", "weather": "dry"},
    {"track": "Las Vegas", "weather": "dry"},
    {"track": "Abu Dhabi", "weather": "dry"}
  ],
  "11": [
    {"track": "Jeddah", "weather": "dry"},
    {"track": "Miami", "weather": "wet"},
    {"track": "Silverstone", "weather": "mixed"},
    {"track": "Monza", "weather": "dry"}
  ]
}'),
(7, '{
  "9": [
    {"track": "Barcelona", "weather": "wet"},
    {"track": "Silverstone", "weather": "dry"},
    {"track": "Spa", "weather": "dry"},
    {"track": "Austin", "weather": "dry"}
  ],
  "10": [
    {"track": "Suzuka", "weather": "wet"},
    {"track": "Monaco", "weather": "dry"},
    {"track": "Barcelona", "weather": "dry"},
    {"track": "Montréal", "weather": "dry"}
  ],
  "11": [
    {"track": "Monaco", "weather": "mixed"},
    {"track": "Spielberg", "weather": "wet"},
    {"track": "Zandvoort", "weather": "dry"},
    {"track": "Suzuka", "weather": "dry"}
  ]
}');

-- Seed the schedule (26 entries across 7 sets)
-- Using CTEs to reference set IDs by set_number
WITH sets AS (
  SELECT id, set_number FROM track_rotation_sets
)
INSERT INTO track_rotation_schedule (rotation_set_id, start_date, end_date)
SELECT s.id, v.start_date::DATE, v.end_date::DATE
FROM sets s
JOIN (VALUES
  -- Set 1 (rotations 1, 8, 15, 22)
  (1, '2025-05-06', '2025-05-21'),
  (1, '2025-08-13', '2025-08-27'),
  (1, '2025-11-19', '2025-12-03'),
  (1, '2026-02-25', '2026-03-11'),
  -- Set 2 (rotations 2, 9, 16, 23)
  (2, '2025-05-21', '2025-06-04'),
  (2, '2025-08-27', '2025-09-10'),
  (2, '2025-12-03', '2025-12-17'),
  (2, '2026-03-11', '2026-03-25'),
  -- Set 3 (rotations 3, 10, 17, 24)
  (3, '2025-06-04', '2025-06-18'),
  (3, '2025-09-10', '2025-09-24'),
  (3, '2025-12-17', '2025-12-31'),
  (3, '2026-03-25', '2026-04-08'),
  -- Set 4 (rotations 4, 11, 18, 25)
  (4, '2025-06-18', '2025-07-02'),
  (4, '2025-09-24', '2025-10-08'),
  (4, '2025-12-31', '2026-01-14'),
  (4, '2026-04-08', '2026-04-22'),
  -- Set 5 (rotations 5, 12, 19, 26)
  (5, '2025-07-02', '2025-07-16'),
  (5, '2025-10-08', '2025-10-22'),
  (5, '2026-01-14', '2026-01-28'),
  (5, '2026-04-22', '2026-05-06'),
  -- Set 6 (rotations 6, 13, 20)
  (6, '2025-07-16', '2025-07-30'),
  (6, '2025-10-22', '2025-11-05'),
  (6, '2026-01-28', '2026-02-11'),
  -- Set 7 (rotations 7, 14, 21)
  (7, '2025-07-30', '2025-08-13'),
  (7, '2025-11-05', '2025-11-19'),
  (7, '2026-02-11', '2026-02-25')
) AS v(set_number, start_date, end_date) ON s.set_number = v.set_number;
