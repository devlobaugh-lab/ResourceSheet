-- Move handle_new_user and is_admin out of the public (PostgREST-exposed) schema
-- into a private schema so anon/authenticated cannot call them via RPC.
-- REVOKE alone cannot override Supabase's managed default privileges on public schema.

CREATE SCHEMA IF NOT EXISTS private;

-- Recreate is_admin in private schema
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Recreate handle_new_user in private schema
CREATE OR REPLACE FUNCTION private.handle_new_user()
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

-- Update the auth trigger to use the private schema function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE private.handle_new_user();

-- Update RLS policies on profiles to use private.is_admin()
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (private.is_admin());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (private.is_admin());

-- Drop the old public schema functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_admin();
