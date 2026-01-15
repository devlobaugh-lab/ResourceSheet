-- Create boost_custom_names table for global custom boost naming
-- This allows admins to override boost names without modifying imported data

CREATE TABLE boost_custom_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boost_id UUID NOT NULL REFERENCES boosts(id) ON DELETE CASCADE,
  custom_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent empty or whitespace-only names
  CONSTRAINT boost_custom_names_custom_name_not_empty
    CHECK (char_length(trim(custom_name)) > 0),

  -- Maximum length of 64 characters
  CONSTRAINT boost_custom_names_custom_name_length
    CHECK (char_length(trim(custom_name)) <= 64),

  -- One custom name per boost
  CONSTRAINT boost_custom_names_boost_id_unique
    UNIQUE (boost_id),

  -- Prevent duplicate custom names across all boosts
  CONSTRAINT boost_custom_names_custom_name_unique
    UNIQUE (custom_name)
);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at_boost_custom_names
  BEFORE UPDATE ON boost_custom_names
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS
ALTER TABLE boost_custom_names ENABLE ROW LEVEL SECURITY;

-- Only admins can manage boost custom names
CREATE POLICY "Admins can manage boost custom names"
  ON boost_custom_names
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Public read access for boost custom names
CREATE POLICY "Anyone can read boost custom names"
  ON boost_custom_names
  FOR SELECT
  USING (true);

-- Create index for performance
CREATE INDEX idx_boost_custom_names_boost_id ON boost_custom_names(boost_id);
CREATE INDEX idx_boost_custom_names_custom_name ON boost_custom_names(custom_name);
