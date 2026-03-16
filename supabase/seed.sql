-- Admin user is created via `npm run db:setup` which calls scripts/database/create_admin_user.js
-- Credentials are configured via ADMIN_EMAIL and ADMIN_PASSWORD in .env.local

-- Season 6 Data
INSERT INTO seasons (id, name, is_active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Season 6', true);
