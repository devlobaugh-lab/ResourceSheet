-- Create GP Guides table
CREATE TABLE gp_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  start_date DATE,
  gp_level INTEGER CHECK (gp_level >= 0 AND gp_level <= 3),
  boosted_assets JSONB,
  reward_bonus JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create GP Guide Tracks table
CREATE TABLE gp_guide_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gp_guide_id UUID REFERENCES gp_guides(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id),
  race_number INTEGER,
  race_type VARCHAR(20) CHECK (race_type IN ('qualifying', 'opening', 'final')),
  track_condition VARCHAR(10) CHECK (track_condition IN ('dry', 'wet', 'unknown')),
  driver_1_id UUID REFERENCES drivers(id),
  driver_2_id UUID REFERENCES drivers(id),
  driver_1_boost_id UUID REFERENCES boosts(id),
  driver_2_boost_id UUID REFERENCES boosts(id),
  driver_1_strategy VARCHAR(255),
  driver_2_strategy VARCHAR(255),
  setup_notes TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create GP Guide Results table
CREATE TABLE gp_guide_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gp_guide_id UUID REFERENCES gp_guides(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id),
  race_number INTEGER,
  race_type VARCHAR(20),
  result_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_gp_guides_user_id ON gp_guides(user_id);
CREATE INDEX idx_gp_guide_tracks_gp_guide_id ON gp_guide_tracks(gp_guide_id);
CREATE INDEX idx_gp_guide_tracks_track_id ON gp_guide_tracks(track_id);
CREATE INDEX idx_gp_guide_results_gp_guide_id ON gp_guide_results(gp_guide_id);
CREATE INDEX idx_gp_guide_results_track_id ON gp_guide_results(track_id);

-- Add RLS policies for GP Guides
ALTER TABLE gp_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE gp_guide_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gp_guide_results ENABLE ROW LEVEL SECURITY;

-- GP Guides policies
CREATE POLICY "Users can view their own GP guides" ON gp_guides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GP guides" ON gp_guides
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GP guides" ON gp_guides
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GP guides" ON gp_guides
  FOR DELETE USING (auth.uid() = user_id);

-- GP Guide Tracks policies
CREATE POLICY "Users can view their own GP guide tracks" ON gp_guide_tracks
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM gp_guides WHERE id = gp_guide_id
    )
  );

CREATE POLICY "Users can insert GP guide tracks for their own guides" ON gp_guide_tracks
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM gp_guides WHERE id = gp_guide_id
    )
  );

CREATE POLICY "Users can update their own GP guide tracks" ON gp_guide_tracks
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM gp_guides WHERE id = gp_guide_id
    )
  );

CREATE POLICY "Users can delete their own GP guide tracks" ON gp_guide_tracks
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM gp_guides WHERE id = gp_guide_id
    )
  );

-- GP Guide Results policies
CREATE POLICY "Users can view their own GP guide results" ON gp_guide_results
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM gp_guides WHERE id = gp_guide_id
    )
  );

CREATE POLICY "Users can insert GP guide results for their own guides" ON gp_guide_results
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM gp_guides WHERE id = gp_guide_id
    )
  );

CREATE POLICY "Users can update their own GP guide results" ON gp_guide_results
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM gp_guides WHERE id = gp_guide_id
    )
  );

CREATE POLICY "Users can delete their own GP guide results" ON gp_guide_results
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM gp_guides WHERE id = gp_guide_id
    )
  );

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gp_guides_updated_at BEFORE UPDATE ON gp_guides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gp_guide_tracks_updated_at BEFORE UPDATE ON gp_guide_tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gp_guide_results_updated_at BEFORE UPDATE ON gp_guide_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();