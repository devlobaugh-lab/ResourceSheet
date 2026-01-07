-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Seasons table
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    username TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catalog items table (car parts and drivers)
CREATE TABLE catalog_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    card_type INTEGER NOT NULL CHECK (card_type IN (0, 1)), -- 0 = car part, 1 = driver
    rarity INTEGER NOT NULL,
    series INTEGER NOT NULL,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    icon TEXT,
    cc_price INTEGER,
    num_duplicates_after_unlock INTEGER,
    collection_id TEXT,
    visual_override TEXT,
    collection_sub_name TEXT,
    car_part_type INTEGER,
    tag_name TEXT,
    ordinal INTEGER,
    min_gp_tier INTEGER,
    stats_per_level JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User items table (user's ownership and progression)
CREATE TABLE user_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE CASCADE NOT NULL,
    level INTEGER DEFAULT 0,
    card_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, catalog_item_id)
);

-- Boosts table
CREATE TABLE boosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT,
    boost_type TEXT NOT NULL,
    rarity INTEGER NOT NULL,
    boost_stats JSONB,
    series INTEGER,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User boosts table
CREATE TABLE user_boosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    boost_id UUID REFERENCES boosts(id) ON DELETE CASCADE NOT NULL,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, boost_id)
);

-- Create indexes for performance
CREATE INDEX idx_catalog_items_season ON catalog_items(season_id);
CREATE INDEX idx_catalog_items_card_type ON catalog_items(card_type);
CREATE INDEX idx_catalog_items_rarity ON catalog_items(rarity);
CREATE INDEX idx_catalog_items_series ON catalog_items(series);
CREATE INDEX idx_user_items_user ON user_items(user_id);
CREATE INDEX idx_user_items_catalog_item ON user_items(catalog_item_id);
CREATE INDEX idx_user_items_user_catalog ON user_items(user_id, catalog_item_id);
CREATE INDEX idx_boosts_season ON boosts(season_id);
CREATE INDEX idx_user_boosts_user ON user_boosts(user_id);
CREATE INDEX idx_user_boosts_boost ON user_boosts(boost_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_catalog_items_updated_at BEFORE UPDATE ON catalog_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_items_updated_at BEFORE UPDATE ON user_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boosts_updated_at BEFORE UPDATE ON boosts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_boosts_updated_at BEFORE UPDATE ON user_boosts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_boosts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Catalog items policies (readable by all authenticated users)
CREATE POLICY "Authenticated users can view catalog items" ON catalog_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage catalog items" ON catalog_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- User items policies (users can only access their own items)
CREATE POLICY "Users can view own items" ON user_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON user_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON user_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON user_items FOR DELETE USING (auth.uid() = user_id);

-- Boosts policies (readable by all authenticated users)
CREATE POLICY "Authenticated users can view boosts" ON boosts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage boosts" ON boosts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- User boosts policies
CREATE POLICY "Users can view own boosts" ON user_boosts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own boosts" ON user_boosts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own boosts" ON user_boosts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own boosts" ON user_boosts FOR DELETE USING (auth.uid() = user_id);
