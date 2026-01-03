-- Initial F1 Resource Manager Database Schema
-- Created: 2025-01-03

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Seasons table (global metadata)
CREATE TABLE seasons (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    number integer UNIQUE NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Catalog items table (unified for parts and drivers)
CREATE TABLE catalog_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    card_type integer NOT NULL, -- 0 = Part, 1 = Driver
    rarity integer NOT NULL, -- 0-5
    series integer NOT NULL,
    season_id uuid REFERENCES seasons(id),
    icon text NOT NULL,
    cc_price integer NOT NULL,
    num_duplicates_after_unlock integer NOT NULL,
    collection_id uuid,
    visual_override text,
    collection_sub_name text,
    
    -- Part-specific fields (nullable)
    car_part_type integer,
    
    -- Driver-specific fields (nullable)
    tag_name text,
    ordinal integer,
    min_gp_tier integer,
    
    -- Stats storage (JSONB for flexibility)
    stats_per_level jsonb NOT NULL,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Boosts table (separate from items as they work differently)
CREATE TABLE boosts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    icon text NOT NULL,
    overtake_tier integer DEFAULT 0,
    block_tier integer DEFAULT 0,
    speed_tier integer DEFAULT 0,
    corners_tier integer DEFAULT 0,
    tyre_use_tier integer DEFAULT 0,
    reliability_tier integer DEFAULT 0,
    pit_stop_time_tier integer DEFAULT 0,
    power_unit_tier integer DEFAULT 0,
    race_start_tier integer DEFAULT 0,
    drs_tier integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Profiles table (linked to auth.users)
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_admin boolean DEFAULT false,
    display_name text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- User items table (user overlay for catalog items)
CREATE TABLE user_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    catalog_item_id uuid NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    current_level integer DEFAULT 1,
    cards_owned integer DEFAULT 0,
    is_unlocked boolean DEFAULT false,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, catalog_item_id)
);

-- User boosts table (user overlay for boosts)
CREATE TABLE user_boosts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    boost_id uuid NOT NULL REFERENCES boosts(id) ON DELETE CASCADE,
    quantity integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, boost_id)
);

-- Indexes for performance
CREATE INDEX idx_catalog_items_season_id ON catalog_items(season_id);
CREATE INDEX idx_catalog_items_card_type ON catalog_items(card_type);
CREATE INDEX idx_catalog_items_rarity ON catalog_items(rarity);
CREATE INDEX idx_catalog_items_series ON catalog_items(series);
CREATE INDEX idx_user_items_user_id ON user_items(user_id);
CREATE INDEX idx_user_items_catalog_item_id ON user_items(catalog_item_id);
CREATE INDEX idx_user_items_user_catalog ON user_items(user_id, catalog_item_id);
CREATE INDEX idx_user_boosts_user_id ON user_boosts(user_id);
CREATE INDEX idx_user_boosts_boost_id ON user_boosts(boost_id);
CREATE INDEX idx_user_boosts_user_boost ON user_boosts(user_id, boost_id);

-- Create trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
