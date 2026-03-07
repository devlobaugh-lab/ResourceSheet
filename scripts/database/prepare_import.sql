-- Prepare schema to accept legacy imports (non-destructive)
ALTER TABLE IF EXISTS public.collections ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE IF EXISTS public.collections ADD COLUMN IF NOT EXISTS rarity integer;
ALTER TABLE IF EXISTS public.user_track_guides ADD COLUMN IF NOT EXISTS alternate_driver_ids jsonb;
-- Allow importing boosts with missing rarity temporarily
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='boosts' AND column_name='rarity') THEN
        EXECUTE 'ALTER TABLE public.boosts ALTER COLUMN rarity DROP NOT NULL';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='boosts' AND column_name='boost_type') THEN
        EXECUTE 'ALTER TABLE public.boosts ALTER COLUMN boost_type DROP NOT NULL';
    END IF;
END$$;

-- If needed: allow collections.rarity to be null during import
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='collections' AND column_name='rarity') THEN
        EXECUTE 'ALTER TABLE public.collections ALTER COLUMN rarity DROP NOT NULL';
    END IF;
END$$;

-- (Optional) disable triggers on public for fast import - use with caution
-- SELECT pg_catalog.set_config('session_replication_role', 'replica', true);

-- After successful import you should re-enable constraints/not nulls and restore session_replication_role
-- and re-apply any stricter checks as a final step.
