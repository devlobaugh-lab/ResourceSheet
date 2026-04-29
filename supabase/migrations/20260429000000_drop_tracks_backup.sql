-- Drop temporary backup table created during tracks table rework migration (20260221000000).
-- It served its purpose as a safety net and is no longer needed.
DROP TABLE IF EXISTS public.tracks_backup;
