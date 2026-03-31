-- Add season_id to track_rotation_schedule so rotations are linked to seasons,
-- not just dates. Season trumps date for navigation.
ALTER TABLE track_rotation_schedule
  ADD COLUMN season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;

-- Backfill: associate each schedule entry to the season whose start_date is the
-- most recent one on or before the entry's start_date.
WITH season_ranges AS (
  SELECT
    id,
    start_date,
    LEAD(start_date) OVER (ORDER BY start_date NULLS LAST) AS next_season_start
  FROM seasons
  WHERE start_date IS NOT NULL
)
UPDATE track_rotation_schedule trs
SET season_id = sr.id
FROM season_ranges sr
WHERE trs.start_date >= sr.start_date
  AND (sr.next_season_start IS NULL OR trs.start_date < sr.next_season_start);

CREATE INDEX idx_track_rotation_schedule_season ON track_rotation_schedule(season_id);
