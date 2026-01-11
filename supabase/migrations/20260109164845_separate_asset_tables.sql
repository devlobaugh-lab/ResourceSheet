-- Create separate tables for drivers, car parts, and boosts
-- Migration: 20260109164845_separate_asset_tables

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, car_part_id)
);

-- Create indexes for better performance
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

-- Create updated_at trigger function (already exists from initial schema)
-- CREATE OR REPLACE FUNCTION public.handle_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = TIMEZONE('utc'::text, NOW());
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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

-- Enable Row Level Security
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_car_parts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for drivers
CREATE POLICY "Drivers are viewable by authenticated users" ON public.drivers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for car_parts
CREATE POLICY "Car parts are viewable by authenticated users" ON public.car_parts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for user_drivers
CREATE POLICY "Users can view their own drivers" ON public.user_drivers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drivers" ON public.user_drivers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drivers" ON public.user_drivers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drivers" ON public.user_drivers
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_car_parts
CREATE POLICY "Users can view their own car parts" ON public.user_car_parts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own car parts" ON public.user_car_parts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own car parts" ON public.user_car_parts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own car parts" ON public.user_car_parts
    FOR DELETE USING (auth.uid() = user_id);