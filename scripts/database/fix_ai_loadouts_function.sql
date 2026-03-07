CREATE OR REPLACE FUNCTION get_distinct_ai_loadouts()
RETURNS TABLE(name text, track_name text, difficulty text) AS $$
BEGIN
  RETURN QUERY 
  SELECT DISTINCT ai_track_loadouts.name, ai_track_loadouts.track_name, ai_track_loadouts.difficulty 
  FROM ai_track_loadouts;
END;
$$ LANGUAGE plpgsql;