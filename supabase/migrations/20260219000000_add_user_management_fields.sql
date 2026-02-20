-- Add user management fields to profiles table
-- Migration: 20260219000000_add_user_management_fields

-- Add user_type and is_active columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'normal' CHECK (user_type IN ('admin', 'normal')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing admin users to have user_type = 'admin'
UPDATE public.profiles
SET user_type = 'admin'
WHERE is_admin = true;

-- Create function to keep is_admin in sync with user_type
CREATE OR REPLACE FUNCTION public.sync_is_admin_with_user_type()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_admin = (NEW.user_type = 'admin');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync is_admin with user_type
DROP TRIGGER IF EXISTS sync_is_admin_trigger ON public.profiles;
CREATE TRIGGER sync_is_admin_trigger
    BEFORE INSERT OR UPDATE OF user_type ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_is_admin_with_user_type();

-- Add policy for admins to manage all profiles
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Add index for user_type queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);