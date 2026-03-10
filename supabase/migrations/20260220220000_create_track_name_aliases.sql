-- Migration: Create track name aliases table
-- Description: Allows admins to define display names for tracks (e.g., "Americas" -> "Austin")

CREATE TABLE track_name_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL UNIQUE,  -- The name used in content_cache (e.g., "Americas")
  display_name TEXT NOT NULL,        -- The user-facing name (e.g., "Austin")
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX idx_track_name_aliases_system ON track_name_aliases(system_name);

-- RLS Policies
ALTER TABLE track_name_aliases ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view aliases
CREATE POLICY "Authenticated users can view track_name_aliases" ON track_name_aliases
  FOR SELECT TO authenticated USING (true);

-- Only admins can modify aliases (we'll check admin status in the API)
CREATE POLICY "Service role can manage track_name_aliases" ON track_name_aliases
  FOR ALL USING (true);

-- Updated at trigger
CREATE TRIGGER update_track_name_aliases_updated_at
  BEFORE UPDATE ON track_name_aliases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON track_name_aliases TO authenticated;

