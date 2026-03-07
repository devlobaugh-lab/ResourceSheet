-- Fix RLS permissions for user_gp_guide_results table
-- This script enables RLS and creates the necessary policies for the race results feature

-- Enable Row Level Security on the table
ALTER TABLE user_gp_guide_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for SELECT operations (reading race results)
CREATE POLICY "Users can view their own GP guide results"
  ON user_gp_guide_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_results.gp_guide_id
      AND user_id = auth.uid()
    )
  );

-- Create RLS policy for INSERT operations (creating new race results)
CREATE POLICY "Users can create their own GP guide results"
  ON user_gp_guide_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_results.gp_guide_id
      AND user_id = auth.uid()
    )
  );

-- Create RLS policy for UPDATE operations (updating existing race results)
CREATE POLICY "Users can update their own GP guide results"
  ON user_gp_guide_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_results.gp_guide_id
      AND user_id = auth.uid()
    )
  );

-- Create RLS policy for DELETE operations (deleting race results)
CREATE POLICY "Users can delete their own GP guide results"
  ON user_gp_guide_results FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_gp_guides
      WHERE id = user_gp_guide_results.gp_guide_id
      AND user_id = auth.uid()
    )
  );

-- Grant necessary permissions to authenticated users
GRANT ALL ON user_gp_guide_results TO authenticated;

-- Grant usage on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the policies are in place
SELECT 
  policyname,
  cmd,
  qual,
  with_check 
FROM pg_policy 
WHERE tablename = 'user_gp_guide_results'
ORDER BY policyname;

-- Verify RLS is enabled
SELECT 
  relname,
  relrowsecurity 
FROM pg_class 
WHERE relname = 'user_gp_guide_results';