-- Remove user_type column and consolidate admin status to is_admin only
-- user_type was a redundant string field ('admin'|'normal') mapping 1:1 to is_admin boolean

-- Drop the sync trigger and function
DROP TRIGGER IF EXISTS sync_is_admin_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_is_admin_with_user_type();

-- Update the RLS policy that referenced user_type to use is_admin
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Drop the user_type index and column
DROP INDEX IF EXISTS idx_profiles_user_type;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_type;
