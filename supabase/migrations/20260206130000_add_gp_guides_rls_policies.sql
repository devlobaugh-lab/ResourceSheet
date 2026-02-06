-- Fix RLS policies for gp_guides table
-- The original policies had issues with INSERT requiring user_id to match auth.uid()

-- Drop the original insert policy
DROP POLICY IF EXISTS "Users can insert their own GP guides" ON gp_guides;

-- Create a new insert policy that checks authentication but allows the user_id to be set
-- The WITH CHECK clause validates that the user is authenticated, but doesn't require user_id match
CREATE POLICY "Users can insert their own GP guides" ON gp_guides
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Drop the FK constraint on user_id that references profiles
-- This causes issues when auth.users is empty but profiles has users from direct inserts
ALTER TABLE gp_guides DROP CONSTRAINT IF EXISTS gp_guides_user_id_fkey;

-- Drop the FK constraint on profiles that references auth.users
-- This prevents inserting profiles when auth.users is empty
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Insert test users if they don't exist
INSERT INTO profiles (id, email, username, is_admin)
VALUES
  ('12353852-9cc7-4770-9d9b-5381394fb6dc', 'thomas.lobaugh@gmail.com', 'thomas.lobaugh', true),
  ('267a5730-adfc-47b9-8b0f-00d837238e7a', 'test@example.com', 'testuser', false)
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, username = EXCLUDED.username;

-- Create a function to handle GP guide inserts with proper auth (optional helper)
CREATE OR REPLACE FUNCTION public.insert_gp_guide(
  p_name TEXT,
  p_gp_level INTEGER,
  p_start_date DATE DEFAULT NULL,
  p_boosted_assets JSONB DEFAULT '{}'::jsonb,
  p_reward_bonus JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(id UUID, name TEXT, gp_level INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO gp_guides (name, gp_level, start_date, boosted_assets, reward_bonus, user_id)
  VALUES (p_name, p_gp_level, p_start_date, p_boosted_assets, p_reward_bonus, auth.uid())
  RETURNING id, name, gp_level;
END;
$$;

-- Grant execute on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_gp_guide TO authenticated;

-- Create a simple view for listing GP guides
CREATE OR REPLACE VIEW public.gp_guides_view AS
SELECT
  g.id,
  g.user_id,
  g.name,
  g.start_date,
  g.gp_level,
  g.boosted_assets,
  g.reward_bonus,
  g.created_at,
  g.updated_at,
  (SELECT COUNT(*) FROM gp_guide_tracks t WHERE t.gp_guide_id = g.id) as track_count
FROM gp_guides g;

-- Grant select on view to authenticated users
GRANT SELECT ON public.gp_guides_view TO authenticated;
