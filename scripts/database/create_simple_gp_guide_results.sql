-- Create the user_gp_guide_results table
CREATE TABLE user_gp_guide_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gp_guide_id UUID NOT NULL REFERENCES user_gp_guides(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  results_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gp_guide_id, track_id)
);

-- Create index for performance
CREATE INDEX idx_user_gp_guide_results_gp_guide_id ON user_gp_guide_results(gp_guide_id);

-- Grant permissions
GRANT ALL ON user_gp_guide_results TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify creation
SELECT 'Table user_gp_guide_results created successfully' as status;