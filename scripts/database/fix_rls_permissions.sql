-- Fix RLS policies for user_gp_guide_results table to support upsert operations

-- Drop existing policies that might not handle upsert correctly
DROP POLICY IF EXISTS "Users can create their own GP guide results" ON user_gp_guide_results;
DROP POLICY IF EXISTS "Users can update their own GP guide results" ON user_gp_guide_results;

-- Create proper RLS policies for upsert operations
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

-- Verify the policies are in place
SELECT policyname, cmd, qual, with_check 
FROM pg_policy 
WHERE tablename = 'user_gp_guide_results';