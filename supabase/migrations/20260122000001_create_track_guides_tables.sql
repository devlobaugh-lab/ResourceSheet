-- Create Track Guides tables for Track Guides feature

-- Main track guides table
CREATE TABLE user_track_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  gp_level INTEGER NOT NULL CHECK (gp_level >= 0 AND gp_level <= 3), -- 0=Junior, 1=Challenger, 2=Contender, 3=Champion
  suggested_drivers JSONB DEFAULT '[]', -- Array of driver IDs (max 4)
  free_boost_id UUID REFERENCES boosts(id),
  suggested_boosts JSONB DEFAULT '[]', -- Array of boost IDs
  saved_setup_id UUID REFERENCES user_car_setups(id),
  setup_notes TEXT,
  dry_strategy TEXT, -- e.g., "3m3m2s" (laps on medium, soft tires)
  wet_strategy TEXT, -- e.g., "10w" (all wet tires)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id, gp_level)
);

-- Track guide drivers table for detailed driver recommendations
CREATE TABLE user_track_guide_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_guide_id UUID NOT NULL REFERENCES user_track_guides(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  recommended_boost_id UUID REFERENCES boosts(id),
  track_strategy TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(track_guide_id, driver_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_track_guides_user_id ON user_track_guides(user_id);
CREATE INDEX idx_user_track_guides_track_id ON user_track_guides(track_id);
CREATE INDEX idx_user_track_guides_gp_level ON user_track_guides(gp_level);
CREATE INDEX idx_user_track_guide_drivers_track_guide_id ON user_track_guide_drivers(track_guide_id);
CREATE INDEX idx_user_track_guide_drivers_driver_id ON user_track_guide_drivers(driver_id);

-- Comments will be added after table creation to avoid linter issues
