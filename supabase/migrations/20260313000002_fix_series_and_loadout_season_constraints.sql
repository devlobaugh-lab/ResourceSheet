-- Fix series_data: change PK from integer index to UUID, add unique(index, season_id)
ALTER TABLE series_data ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
UPDATE series_data SET id = gen_random_uuid() WHERE id IS NULL;
ALTER TABLE series_data DROP CONSTRAINT series_data_pkey;
ALTER TABLE series_data ALTER COLUMN id SET NOT NULL;
ALTER TABLE series_data ADD PRIMARY KEY (id);
ALTER TABLE series_data ADD CONSTRAINT series_data_index_season_unique UNIQUE (index, season_id);

-- Fix ai_track_loadouts: drop old unique constraint, add new one with season_id
DO $$
DECLARE
  cname text;
BEGIN
  SELECT c.conname INTO cname
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_attribute a1 ON a1.attrelid = t.oid AND a1.attnum = ANY(c.conkey)
  WHERE t.relname = 'ai_track_loadouts' AND c.contype = 'u'
    AND a1.attname = 'name'
  LIMIT 1;
  IF cname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE ai_track_loadouts DROP CONSTRAINT ' || quote_ident(cname);
  END IF;
END;
$$;
ALTER TABLE ai_track_loadouts ADD CONSTRAINT ai_track_loadouts_name_team_slot_season_unique
  UNIQUE (name, team_name, driver_slot, season_id);
