-- Grant permissions to authenticated role for user_gp_guide_results table

-- Grant all necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_gp_guide_results TO authenticated;

-- Grant usage on sequences if they exist (for auto-incrementing IDs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the permissions are now granted
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'user_gp_guide_results'
ORDER BY grantee, privilege_type;