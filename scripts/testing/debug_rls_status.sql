-- Debug script to check the current RLS status and identify the actual issue

-- Check if RLS is enabled on the table
SELECT 
  relname,
  relrowsecurity 
FROM pg_class 
WHERE relname = 'user_gp_guide_results';

-- Check existing RLS policies
SELECT 
  polname as policyname,
  CASE WHEN polcmd = '*' THEN 'ALL' ELSE polcmd END as cmd,
  polqual::text as qual,
  polwithcheck::text as with_check 
FROM pg_policy 
WHERE polrelid = (SELECT oid FROM pg_class WHERE relname = 'user_gp_guide_results')
ORDER BY polname;

-- Check if the table exists and has the right structure
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'user_gp_guide_results'
ORDER BY ordinal_position;

-- Check if user_gp_guides table exists and has user_id column
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'user_gp_guides' AND column_name = 'user_id';

-- Check current permissions on the table
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'user_gp_guide_results'
ORDER BY grantee, privilege_type;