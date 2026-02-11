-- Migration: add `theme` column to `collections` and backfill from `description`
BEGIN;

ALTER TABLE IF EXISTS public.collections
  ADD COLUMN IF NOT EXISTS theme text;

-- Backfill `theme` from `description` when `theme` is NULL
UPDATE public.collections
SET theme = description
WHERE theme IS NULL
  AND description IS NOT NULL;

COMMIT;

-- Notes:
-- - This migration leaves `theme` nullable to avoid locking production.
-- - After applying, consider adding a NOT NULL constraint if appropriate.
