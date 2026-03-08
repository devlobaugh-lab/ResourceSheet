-- Set admin user for thomas.lobaugh@gmail.com
-- This restores the admin setup that was removed during schema consolidation

-- Update existing profile if the user has already signed up
UPDATE public.profiles
SET is_admin = true
WHERE email = 'thomas.lobaugh@gmail.com';

-- Update handle_new_user trigger to auto-grant admin for the admin email
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
