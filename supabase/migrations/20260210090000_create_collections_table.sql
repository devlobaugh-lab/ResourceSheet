-- Create collections table
-- Migration: 20260210090000_create_collections_table

CREATE TABLE collections (
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

-- Indexes
CREATE INDEX idx_collections_season ON collections(season);
CREATE INDEX idx_collections_ordinal ON collections(ordinal);

-- Note: updated_at will be handled by application logic or a separate trigger function

-- Note: Row Level Security policies will be added separately