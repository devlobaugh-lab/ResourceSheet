-- Fix Supabase security warnings:
-- 1. Add SET search_path to functions missing it (prevents search_path injection)
-- 2. Revoke public EXECUTE on SECURITY DEFINER functions not meant to be called via RPC
-- 3. Tighten track_name_aliases policy that was USING (true) for ALL operations

-- Fix handle_updated_at: add SET search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix update_updated_at_column: add SET search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix handle_new_user: add SET search_path, then revoke RPC access
-- It is an auth trigger only — anon/authenticated must not call it directly.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'username',
        NEW.email = 'thomas.lobaugh@gmail.com'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Revoke public RPC access to is_admin — it is used internally by RLS policies only.
-- (search_path already set in 20260314000001_fix_profiles_rls_recursion.sql)
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated;

-- Tighten track_name_aliases policy: replace the always-true ALL policy with
-- a service-role-only policy using a proper check.
DROP POLICY IF EXISTS "Service role can manage track_name_aliases" ON public.track_name_aliases;

CREATE POLICY "Service role can manage track_name_aliases" ON public.track_name_aliases
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
