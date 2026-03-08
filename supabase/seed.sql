-- Admin user for local development
-- UUID is fixed so ON CONFLICT works correctly after db:reset
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'authenticated',
    'authenticated',
    'thomas.lobaugh@gmail.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Season 6 Data
INSERT INTO seasons (id, name, is_active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Season 6', true);
