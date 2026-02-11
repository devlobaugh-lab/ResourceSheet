-- Create collections table
-- Migration: 20260210090000_create_collections_table

CREATE TABLE public.collections (
    id TEXT PRIMARY KEY,
    internal_name TEXT,
    season INTEGER,
    ordinal INTEGER,
    name TEXT,
    theme TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX idx_collections_season ON public.collections(season);
CREATE INDEX idx_collections_ordinal ON public.collections(ordinal);

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_collections
    BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable Row Level Security and make readable by everyone (catalog data)
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collections are viewable by everyone" ON public.collections;
CREATE POLICY "Collections are viewable by everyone" ON public.collections
    FOR SELECT USING (true);
