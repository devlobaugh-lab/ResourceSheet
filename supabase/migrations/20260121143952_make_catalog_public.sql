-- Make catalog tables publicly readable since they contain game data
-- Migration: make_catalog_public

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "Drivers are viewable by authenticated users" ON public.drivers;
DROP POLICY IF EXISTS "Car parts are viewable by authenticated users" ON public.car_parts;
DROP POLICY IF EXISTS "Boosts are viewable by everyone" ON public.boosts;

-- Create public read policies for catalog data
CREATE POLICY "Drivers are viewable by everyone" ON public.drivers
    FOR SELECT USING (true);

CREATE POLICY "Car parts are viewable by everyone" ON public.car_parts
    FOR SELECT USING (true);

CREATE POLICY "Boosts are viewable by everyone" ON public.boosts
    FOR SELECT USING (true);
