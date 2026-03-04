-- Add RLS policy for upsert operations on user_gp_guide_results table

-- Create proper RLS policy for upsert operations
-- For upsert, we need policies that handle both INSERT and UPDATE in a single operation
CREATE POLICY "Users can upsert their own GP guide results"
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

-- Verify the policy is in place
SELECT policyname, cmd, qual, with_check 
FROM pg_policy 
WHERE tablename = 'user_gp_guide_results';