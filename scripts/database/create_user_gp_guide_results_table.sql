-- Create the user_gp_guide_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_gp_guide_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gp_guide_id UUID NOT NULL REFERENCES user_gp_guides(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  results_notes TEXT, -- Quali position, PvP or bot, boosts used, final result, safety car, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gp_guide_id, track_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_gp_guide_results_gp_guide_id ON user_gp_guide_results(gp_guide_id);

-- Enable row level security
ALTER TABLE user_gp_guide_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_gp_guide_results
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

-- Create trigger for updated_at
CREATE TRIGGER update_user_gp_guide_results_updated_at
  BEFORE UPDATE ON user_gp_guide_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON user_gp_guide_results TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the table was created successfully
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'user_gp_guide_results'
ORDER BY ordinal_position;