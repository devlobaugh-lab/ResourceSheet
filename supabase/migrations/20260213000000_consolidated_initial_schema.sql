-- Consolidated Initial Schema for ResourceSheet
-- Migration: 20260213000000_consolidated_initial_schema
-- This replaces all previous migrations with a clean, consolidated schema

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
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create boost_custom_names table
CREATE TABLE public.boost_custom_names (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boost_id UUID REFERENCES public.boosts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    custom_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(boost_id, user_id)
);

-- Create user_boosts table
CREATE TABLE public.user_boosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    boost_id UUID REFERENCES public.boosts(id) ON DELETE CASCADE NOT NULL,
    level INTEGER DEFAULT 0,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, boost_id)
);

-- Create drivers table
CREATE TABLE public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rarity INTEGER NOT NULL,
    series INTEGER NOT NULL,
    season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL,
    icon TEXT,
    cc_price INTEGER,
    num_duplicates_after_unlock INTEGER,
    collection_id TEXT,
    visual_override TEXT,
    collection_sub_name TEXT,
    min_gp_tier INTEGER,
    tag_name TEXT,
    ordinal INTEGER,
    stats_per_level JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create car_parts table
CREATE TABLE public.car_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rarity INTEGER NOT NULL,
    series INTEGER NOT NULL,
    season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL,
    icon TEXT,
    cc_price INTEGER,
    num_duplicates_after_unlock INTEGER,
    collection_id TEXT,
    visual_override TEXT,
    collection_sub_name TEXT,
    car_part_type INTEGER NOT NULL,
    stats_per_level JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_drivers table
CREATE TABLE public.user_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
    level INTEGER DEFAULT 0,
    card_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, driver_id)
);

-- Create user_car_parts table
CREATE TABLE public.user_car_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    car_part_id UUID REFERENCES public.car_parts(id) ON DELETE CASCADE NOT NULL,
    level INTEGER DEFAULT 0,
    card_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, car_part_id)
);

-- Create collections table
CREATE TABLE public.collections (
    id TEXT PRIMARY KEY,
    internal_name TEXT,
    season INTEGER,
    ordinal INTEGER,
    name TEXT,
    theme TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create tracks table
CREATE TABLE public.tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    alt_name TEXT,
    laps INTEGER NOT NULL,
    driver_track_stat TEXT NOT NULL,
    car_track_stat TEXT NOT NULL,
    season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_car_setups table
CREATE TABLE public.user_car_setups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    notes TEXT,
    brake_id UUID REFERENCES public.car_parts(id) ON DELETE SET NULL,
    gearbox_id UUID REFERENCES public.car_parts(id) ON DELETE SET NULL,
    rear_wing_id UUID REFERENCES public.car_parts(id) ON DELETE SET NULL,
    front_wing_id UUID REFERENCES public.car_parts(id) ON DELETE SET NULL,
    suspension_id UUID REFERENCES public.car_parts(id) ON DELETE SET NULL,
    engine_id UUID REFERENCES public.car_parts(id) ON DELETE SET NULL,
    series_filter INTEGER DEFAULT 0,
    bonus_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_track_guides table
CREATE TABLE public.user_track_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
    gp_level INTEGER NOT NULL,
    suggested_drivers JSONB,
    free_boost_id UUID REFERENCES public.boosts(id) ON DELETE SET NULL,
    suggested_boosts JSONB,
    saved_setup_id UUID REFERENCES public.user_car_setups(id) ON DELETE SET NULL,
    setup_notes TEXT,
    dry_strategy TEXT,
    wet_strategy TEXT,
    driver_1_dry_strategy TEXT,
    driver_1_wet_strategy TEXT,
    driver_2_dry_strategy TEXT,
    driver_2_wet_strategy TEXT,
    notes TEXT,
    driver_1_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    driver_2_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    driver_1_boost_id UUID REFERENCES public.boosts(id) ON DELETE SET NULL,
    driver_2_boost_id UUID REFERENCES public.boosts(id) ON DELETE SET NULL,
    alt_driver_ids JSONB,
    alt_boost_ids JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, track_id, gp_level)
);

-- Create user_track_guide_drivers table
CREATE TABLE public.user_track_guide_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_guide_id UUID REFERENCES public.user_track_guides(id) ON DELETE CASCADE NOT NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
    recommended_boost_id UUID REFERENCES public.boosts(id) ON DELETE SET NULL,
    track_strategy TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_boosts_season_id ON public.boosts(season_id);
CREATE INDEX idx_boosts_rarity ON public.boosts(rarity);
CREATE INDEX idx_user_boosts_user_id ON public.user_boosts(user_id);
CREATE INDEX idx_user_boosts_boost_id ON public.user_boosts(boost_id);
CREATE INDEX idx_drivers_season_id ON public.drivers(season_id);
CREATE INDEX idx_drivers_rarity ON public.drivers(rarity);
CREATE INDEX idx_drivers_series ON public.drivers(series);
CREATE INDEX idx_car_parts_season_id ON public.car_parts(season_id);
CREATE INDEX idx_car_parts_rarity ON public.car_parts(rarity);
CREATE INDEX idx_car_parts_series ON public.car_parts(series);
CREATE INDEX idx_car_parts_type ON public.car_parts(car_part_type);
CREATE INDEX idx_user_drivers_user_id ON public.user_drivers(user_id);
CREATE INDEX idx_user_drivers_driver_id ON public.user_drivers(driver_id);
CREATE INDEX idx_user_car_parts_user_id ON public.user_car_parts(user_id);
CREATE INDEX idx_user_car_parts_car_part_id ON public.user_car_parts(car_part_id);
CREATE INDEX idx_collections_season ON public.collections(season);
CREATE INDEX idx_collections_ordinal ON public.collections(ordinal);
CREATE INDEX idx_tracks_season_id ON public.tracks(season_id);
CREATE INDEX idx_user_car_setups_user_id ON public.user_car_setups(user_id);
CREATE INDEX idx_user_track_guides_user_id ON public.user_track_guides(user_id);
CREATE INDEX idx_user_track_guides_track_id ON public.user_track_guides(track_id);

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

CREATE TRIGGER handle_updated_at_boosts
    BEFORE UPDATE ON public.boosts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_boost_custom_names
    BEFORE UPDATE ON public.boost_custom_names
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_boosts
    BEFORE UPDATE ON public.user_boosts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_drivers
    BEFORE UPDATE ON public.drivers
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_car_parts
    BEFORE UPDATE ON public.car_parts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_drivers
    BEFORE UPDATE ON public.user_drivers
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_car_parts
    BEFORE UPDATE ON public.user_car_parts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_tracks
    BEFORE UPDATE ON public.tracks
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_car_setups
    BEFORE UPDATE ON public.user_car_setups
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_track_guides
    BEFORE UPDATE ON public.user_track_guides
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_track_guide_drivers
    BEFORE UPDATE ON public.user_track_guide_drivers
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
ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boost_custom_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_car_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_car_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_track_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_track_guide_drivers ENABLE ROW LEVEL SECURITY;

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

-- Boosts: readable by all authenticated users
CREATE POLICY "Boosts are viewable by authenticated users" ON public.boosts
    FOR SELECT USING (auth.role() = 'authenticated');

-- boost_custom_names: users can manage their own custom names
CREATE POLICY "Users can view their own boost custom names" ON public.boost_custom_names
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own boost custom names" ON public.boost_custom_names
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boost custom names" ON public.boost_custom_names
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boost custom names" ON public.boost_custom_names
    FOR DELETE USING (auth.uid() = user_id);

-- User Boosts: users can only access their own boosts
CREATE POLICY "Users can view their own boosts" ON public.user_boosts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own boosts" ON public.user_boosts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boosts" ON public.user_boosts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boosts" ON public.user_boosts
    FOR DELETE USING (auth.uid() = user_id);

-- Drivers: readable by all authenticated users
CREATE POLICY "Drivers are viewable by authenticated users" ON public.drivers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Car parts: readable by all authenticated users
CREATE POLICY "Car parts are viewable by authenticated users" ON public.car_parts
    FOR SELECT USING (auth.role() = 'authenticated');

-- User Drivers: users can only access their own drivers
CREATE POLICY "Users can view their own drivers" ON public.user_drivers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drivers" ON public.user_drivers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drivers" ON public.user_drivers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drivers" ON public.user_drivers
    FOR DELETE USING (auth.uid() = user_id);

-- User Car Parts: users can only access their own car parts
CREATE POLICY "Users can view their own car parts" ON public.user_car_parts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own car parts" ON public.user_car_parts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own car parts" ON public.user_car_parts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own car parts" ON public.user_car_parts
    FOR DELETE USING (auth.uid() = user_id);

-- Collections: readable by all authenticated users
CREATE POLICY "Collections are viewable by authenticated users" ON public.collections
    FOR SELECT USING (auth.role() = 'authenticated');

-- Tracks: readable by all authenticated users
CREATE POLICY "Tracks are viewable by authenticated users" ON public.tracks
    FOR SELECT USING (auth.role() = 'authenticated');

-- User Car Setups: users can only access their own setups
CREATE POLICY "Users can view their own car setups" ON public.user_car_setups
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own car setups" ON public.user_car_setups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own car setups" ON public.user_car_setups
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own car setups" ON public.user_car_setups
    FOR DELETE USING (auth.uid() = user_id);

-- User Track Guides: users can only access their own track guides
CREATE POLICY "Users can view their own track guides" ON public.user_track_guides
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own track guides" ON public.user_track_guides
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own track guides" ON public.user_track_guides
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own track guides" ON public.user_track_guides
    FOR DELETE USING (auth.uid() = user_id);

-- User Track Guide Drivers: users can only access their own
CREATE POLICY "Users can view their own track guide drivers" ON public.user_track_guide_drivers
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_track_guides WHERE id = track_guide_id
        )
    );

CREATE POLICY "Users can insert their own track guide drivers" ON public.user_track_guide_drivers
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.user_track_guides WHERE id = track_guide_id
        )
    );

CREATE POLICY "Users can update their own track guide drivers" ON public.user_track_guide_drivers
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_track_guides WHERE id = track_guide_id
        )
    );

CREATE POLICY "Users can delete their own track guide drivers" ON public.user_track_guide_drivers
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_track_guides WHERE id = track_guide_id
        )
    );
