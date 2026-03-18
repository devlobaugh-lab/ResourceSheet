-- Migration: Create boost_icon_data table
-- Replaces boost_custom_names (FK-based) and boosts.is_free with an icon-keyed lookup table.
-- This allows import before boosts are seeded (no UUID FK dependency).

CREATE TABLE boost_icon_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_name TEXT NOT NULL UNIQUE,
  custom_name TEXT,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_boost_icon_data_icon_name ON boost_icon_data(icon_name);

ALTER TABLE boost_icon_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view boost_icon_data" ON boost_icon_data
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage boost_icon_data" ON boost_icon_data
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE TRIGGER update_boost_icon_data_updated_at
  BEFORE UPDATE ON boost_icon_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Data migration: pull custom_name from boost_custom_names + is_free from boosts
INSERT INTO boost_icon_data (icon_name, custom_name, is_free)
SELECT
  b.icon,
  bcn.custom_name,
  COALESCE(b.is_free, false)
FROM boosts b
LEFT JOIN boost_custom_names bcn ON bcn.boost_id = b.id
WHERE b.icon IS NOT NULL
  AND (bcn.custom_name IS NOT NULL OR b.is_free = true)
ON CONFLICT (icon_name) DO NOTHING;

-- Drop old table and column
DROP TABLE boost_custom_names;
ALTER TABLE boosts DROP COLUMN is_free;
