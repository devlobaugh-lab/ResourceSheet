-- Create GP Guide tables

-- Main GP Guide header table
CREATE TABLE user_gp_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  gp_level INTEGER NOT NULL CHECK (gp_level >= 0 AND gp_level <= 3), -- 0=Junior, 1=Challenger, 2=Contender, 3=Champion
  notes TEXT, -- Free text: boosted assets, bonus requirements & rewards
  weekend_strategy_same BOOLEAN NOT NULL DEFAULT true, -- When true, Final Round uses same strategy as Opening Round
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GP Guide track slots - one row per race slot (qualifying 1-4, opening 1-8, final 1-8)
CREATE TABLE user_gp_guide_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gp_guide_id UUID NOT NULL REFERENCES user_gp_guides(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id), -- nullable: user assigns tracks over time
  race_number INTEGER NOT NULL CHECK (race_number >= 1 AND race_number <= 8),
  race_type TEXT NOT NULL CHECK (race_type IN ('qualifying', 'opening', 'final')),
  is_wet BOOLEAN NOT NULL DEFAULT false, -- Dry (false) or Wet (true) conditions
  -- Driver selections
  driver_1_id UUID REFERENCES drivers(id),
  driver_2_id UUID REFERENCES drivers(id),
  -- Boost selections
  driver_1_boost_id UUID REFERENCES boosts(id),
  driver_2_boost_id UUID REFERENCES boosts(id),
  -- Alternate options
  alt_driver_ids JSONB DEFAULT '[]',
  alt_boost_ids JSONB DEFAULT '[]',
  -- Setup
  saved_setup_id UUID REFERENCES user_car_setups(id),
  setup_notes TEXT,
  -- Tire strategies (single strategy per driver, dry or wet based on is_wet)
  driver_1_tire_strategy TEXT,
  driver_2_tire_strategy TEXT,
  -- Notes
  strategy_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Each race slot (type + number) is unique within a GP guide
  UNIQUE(gp_guide_id, race_type, race_number)
);

-- GP Guide results notes - per unique track within a GP (shared across qualifying/opening/final)
CREATE TABLE user_gp_guide_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gp_guide_id UUID NOT NULL REFERENCES user_gp_guides(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  results_notes TEXT, -- Quali position, PvP or bot, boosts used, final result, safety car, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gp_guide_id, track_id)
);

-- Performance indexes
CREATE INDEX idx_user_gp_guides_user_id ON user_gp_guides(user_id);
CREATE INDEX idx_user_gp_guides_start_date ON user_gp_guides(start_date);
CREATE INDEX idx_user_gp_guide_tracks_gp_guide_id ON user_gp_guide_tracks(gp_guide_id);
CREATE INDEX idx_user_gp_guide_tracks_track_id ON user_gp_guide_tracks(track_id);
CREATE INDEX idx_user_gp_guide_results_gp_guide_id ON user_gp_guide_results(gp_guide_id);

-- Row Level Security
ALTER TABLE user_gp_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gp_guide_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gp_guide_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_gp_guides
CREATE POLICY "Users can view their own GP guides"
  ON user_gp_guides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own GP guides"
  ON user_gp_guides FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GP guides"
  ON user_gp_guides FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GP guides"
  ON user_gp_guides FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_gp_guide_tracks
CREATE POLICY "Users can view their own GP guide tracks"
  ON user_gp_guide_tracks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_tracks.gp_guide_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own GP guide tracks"
  ON user_gp_guide_tracks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_tracks.gp_guide_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own GP guide tracks"
  ON user_gp_guide_tracks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_tracks.gp_guide_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own GP guide tracks"
  ON user_gp_guide_tracks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_tracks.gp_guide_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for user_gp_guide_results
CREATE POLICY "Users can view their own GP guide results"
  ON user_gp_guide_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_results.gp_guide_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own GP guide results"
  ON user_gp_guide_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_results.gp_guide_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own GP guide results"
  ON user_gp_guide_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_results.gp_guide_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own GP guide results"
  ON user_gp_guide_results FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_results.gp_guide_id
      AND user_id = auth.uid()
    )
  );

-- Auto-update updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_gp_guides_updated_at
  BEFORE UPDATE ON user_gp_guides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_gp_guide_tracks_updated_at
  BEFORE UPDATE ON user_gp_guide_tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_gp_guide_results_updated_at
  BEFORE UPDATE ON user_gp_guide_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
