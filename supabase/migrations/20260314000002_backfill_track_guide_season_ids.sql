-- Backfill season_id on user_track_guides rows that have season_id = NULL.
-- Picks the highest-numbered active season for the guide's track, which is
-- the most appropriate default for guides created before the season_id column existed.
UPDATE user_track_guides utg
SET season_id = (
  SELECT ts.season_id
  FROM track_seasons ts
  JOIN seasons s ON s.id = ts.season_id
  WHERE ts.track_id = utg.track_id
    AND ts.is_active = true
  ORDER BY s.name DESC
  LIMIT 1
)
WHERE utg.season_id IS NULL;
