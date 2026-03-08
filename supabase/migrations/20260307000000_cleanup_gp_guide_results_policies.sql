-- Drop all previous policy versions (safe with IF EXISTS)
DROP POLICY IF EXISTS "Users can create their own GP guide results" ON user_gp_guide_results;
DROP POLICY IF EXISTS "Users can update their own GP guide results" ON user_gp_guide_results;
DROP POLICY IF EXISTS "Users can view their own GP guide results" ON user_gp_guide_results;
DROP POLICY IF EXISTS "Users can delete their own GP guide results" ON user_gp_guide_results;
DROP POLICY IF EXISTS "Users can upsert their own GP guide results" ON user_gp_guide_results;

-- Single clean policy for all operations
CREATE POLICY "Users can manage their own GP guide results"
  ON user_gp_guide_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_results.gp_guide_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_results.gp_guide_id
      AND user_id = auth.uid()
    )
  );
