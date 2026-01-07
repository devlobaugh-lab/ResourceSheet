-- Create initial schema for F1 Resource Manager
-- Migration: 20260107192441_initial_schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create seasons table
CREATE TABLE public.seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    username TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create catalog_items table
CREATE TABLE public.catalog_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    card_type INTEGER NOT NULL CHECK (card_type IN (0, 1)), -- 0 = car part, 1 = driver
    rarity INTEGER NOT NULL,
    series INTEGER NOT NULL,
    season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_items table
CREATE TABLE public.user_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE NOT NULL,
    level INTEGER DEFAULT 0,
    card_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, catalog_item_id)
);

-- Create boosts table
CREATE TABLE public.boosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT,
    boost_type TEXT NOT NULL,
    rarity INTEGER NOT NULL,
    boost_stats JSONB,
    series INTEGER,
    season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_boosts table
CREATE TABLE public.user_boosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    boost_id UUID REFERENCES public.boosts(id) ON DELETE CASCADE NOT NULL,
    level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, boost_id)
);

-- Create indexes for better performance
CREATE INDEX idx_catalog_items_season_id ON public.catalog_items(season_id);
CREATE INDEX idx_catalog_items_card_type ON public.catalog_items(card_type);
CREATE INDEX idx_catalog_items_rarity ON public.catalog_items(rarity);
CREATE INDEX idx_catalog_items_series ON public.catalog_items(series);
CREATE INDEX idx_user_items_user_id ON public.user_items(user_id);
CREATE INDEX idx_user_items_catalog_item_id ON public.user_items(catalog_item_id);
CREATE INDEX idx_boosts_season_id ON public.boosts(season_id);
CREATE INDEX idx_boosts_rarity ON public.boosts(rarity);
CREATE INDEX idx_user_boosts_user_id ON public.user_boosts(user_id);
CREATE INDEX idx_user_boosts_boost_id ON public.user_boosts(boost_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_seasons
    BEFORE UPDATE ON public.seasons
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_catalog_items
    BEFORE UPDATE ON public.catalog_items
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_items
    BEFORE UPDATE ON public.user_items
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_boosts
    BEFORE UPDATE ON public.boosts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_boosts
    BEFORE UPDATE ON public.user_boosts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_boosts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Seasons: readable by all authenticated users
CREATE POLICY "Seasons are viewable by authenticated users" ON public.seasons
    FOR SELECT USING (auth.role() = 'authenticated');

-- Profiles: users can read/update their own profile, admins can read all
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Catalog Items: readable by all authenticated users
CREATE POLICY "Catalog items are viewable by authenticated users" ON public.catalog_items
    FOR SELECT USING (auth.role() = 'authenticated');

-- User Items: users can only access their own items
CREATE POLICY "Users can view their own items" ON public.user_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items" ON public.user_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON public.user_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON public.user_items
    FOR DELETE USING (auth.uid() = user_id);

-- Boosts: readable by all authenticated users
CREATE POLICY "Boosts are viewable by authenticated users" ON public.boosts
    FOR SELECT USING (auth.role() = 'authenticated');

-- User Boosts: users can only access their own boosts
CREATE POLICY "Users can view their own boosts" ON public.user_boosts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own boosts" ON public.user_boosts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boosts" ON public.user_boosts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boosts" ON public.user_boosts
    FOR DELETE USING (auth.uid() = user_id);