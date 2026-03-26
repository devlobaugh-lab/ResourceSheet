-- Remove duplicate tracks within the same season.
-- A duplicate is defined as two or more tracks with the same name linked to
-- the same season via track_seasons.  For each such group we keep the track
-- with the earliest created_at, reroute every FK reference to that ID, and
-- delete the orphaned track_seasons rows and track rows.
--
-- This was caused by a bug in the content-cache import that used the wrong
-- season ID when checking for existing tracks, causing the same track to be
-- inserted twice with different content-cache IDs and both linked to the same
-- season.

DO $$
DECLARE
  dup         RECORD;
  keep_id     TEXT;
  drop_ids    TEXT[];
BEGIN
  -- Iterate over every (track name, season) pair that has more than one entry
  FOR dup IN
    SELECT t.name, ts.season_id
    FROM   tracks t
    JOIN   track_seasons ts ON ts.track_id = t.id
    GROUP  BY t.name, ts.season_id
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the oldest track (earliest created_at) for this name+season
    SELECT t.id INTO keep_id
    FROM   tracks t
    JOIN   track_seasons ts ON ts.track_id = t.id
    WHERE  t.name      = dup.name
    AND    ts.season_id = dup.season_id
    ORDER  BY t.created_at ASC
    LIMIT  1;

    -- Collect the IDs of the duplicate tracks to remove for this season
    SELECT ARRAY_AGG(t.id) INTO drop_ids
    FROM   tracks t
    JOIN   track_seasons ts ON ts.track_id = t.id
    WHERE  t.name      = dup.name
    AND    ts.season_id = dup.season_id
    AND    t.id        <> keep_id;

    IF drop_ids IS NULL OR array_length(drop_ids, 1) = 0 THEN
      CONTINUE;
    END IF;

    -- Reroute FK references to the kept track
    UPDATE user_track_guides    SET track_id = keep_id WHERE track_id = ANY(drop_ids);
    UPDATE user_gp_guide_tracks SET track_id = keep_id WHERE track_id = ANY(drop_ids);
    UPDATE user_gp_guide_results SET track_id = keep_id WHERE track_id = ANY(drop_ids);

    -- Remove the duplicate track_seasons rows for this season only
    DELETE FROM track_seasons
    WHERE  track_id = ANY(drop_ids)
    AND    season_id = dup.season_id;

    -- Remove any track rows that are now fully orphaned (no remaining season links)
    DELETE FROM tracks t
    WHERE  t.id = ANY(drop_ids)
    AND    NOT EXISTS (
      SELECT 1 FROM track_seasons ts2 WHERE ts2.track_id = t.id
    );

  END LOOP;
END $$;
