-- Backfill season_id for any track_rotation_schedule entries that still have
-- season_id = NULL (e.g. entries added after the previous backfill migration ran).
--
-- Uses the same two-pass strategy as 20260402000000:
--   1. Match by date range against known season boundaries.
--   2. Catch-all: assign remaining NULLs to the currently active season.

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

-- Catch-all: any entries still NULL get assigned to the active season.
UPDATE track_rotation_schedule
SET season_id = (SELECT id FROM seasons WHERE is_active = TRUE LIMIT 1)
WHERE season_id IS NULL
  AND EXISTS (SELECT 1 FROM seasons WHERE is_active = TRUE);
