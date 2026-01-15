-- Set thomas.lobaugh@gmail.com as admin user for testing boost custom naming
UPDATE public.profiles
SET is_admin = true
WHERE email = 'thomas.lobaugh@gmail.com';
