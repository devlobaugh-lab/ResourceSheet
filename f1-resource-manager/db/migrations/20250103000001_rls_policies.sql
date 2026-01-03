-- Row Level Security Policies
-- Created: 2025-01-03

-- Enable RLS on all user tables
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_boosts ENABLE ROW LEVEL SECURITY;

-- Seasons: Public read, admin write
CREATE POLICY "Public read seasons" ON seasons
    FOR SELECT USING (true);

-- Catalog items: Public read, admin write
CREATE POLICY "Public read catalog_items" ON catalog_items
    FOR SELECT USING (true);

-- Boosts: Public read, admin write
CREATE POLICY "Public read boosts" ON boosts
    FOR SELECT USING (true);

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User items: Full CRUD for own items only
CREATE POLICY "Users can read own items" ON user_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items" ON user_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items" ON user_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items" ON user_items
    FOR DELETE USING (auth.uid() = user_id);

-- User boosts: Full CRUD for own boosts only
CREATE POLICY "Users can read own boosts" ON user_boosts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own boosts" ON user_boosts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own boosts" ON user_boosts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own boosts" ON user_boosts
    FOR DELETE USING (auth.uid() = user_id);

-- Admin function for checking admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  );
$$ LANGUAGE plpgsql SECURITY DEFINER;
