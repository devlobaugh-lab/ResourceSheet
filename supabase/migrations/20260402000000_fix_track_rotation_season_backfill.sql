-- Fix track_rotation_schedule season_id backfill.
--
-- The original backfill in 20260330000001 used seasons.start_date, but that
-- column was added with no values in the same release — so the CTE matched
-- zero seasons and left every schedule entry with season_id = NULL.
--
-- Strategy: use activated_at (backfilled from created_at) as a proxy for
-- the season's effective start date, then assign any remaining unmatched
-- entries to the currently active season.

WITH season_ranges AS (
  SELECT
    id,
    COALESCE(start_date, activated_at::date) AS effective_start,
    LEAD(COALESCE(start_date, activated_at::date))
      OVER (ORDER BY COALESCE(start_date, activated_at::date) NULLS LAST) AS next_start
  FROM seasons
  WHERE activated_at IS NOT NULL OR start_date IS NOT NULL
)
UPDATE track_rotation_schedule trs
SET season_id = sr.id
FROM season_ranges sr
WHERE trs.season_id IS NULL
  AND trs.start_date >= sr.effective_start
  AND (sr.next_start IS NULL OR trs.start_date < sr.next_start);

-- Catch-all: any entries that still have season_id NULL (e.g. schedule dates
-- fall before all seasons' effective_start) get assigned to the active season.
UPDATE track_rotation_schedule
SET season_id = (SELECT id FROM seasons WHERE is_active = TRUE LIMIT 1)
WHERE season_id IS NULL
  AND EXISTS (SELECT 1 FROM seasons WHERE is_active = TRUE);
