-- Make boost_custom_names global (system-wide, not per-user)
-- user_id was a design artifact; the read side already queries without filtering by user_id

ALTER TABLE public.boost_custom_names ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.boost_custom_names
  DROP CONSTRAINT IF EXISTS boost_custom_names_boost_id_user_id_key;
ALTER TABLE public.boost_custom_names
  ADD CONSTRAINT boost_custom_names_boost_id_key UNIQUE (boost_id);

DROP POLICY IF EXISTS "Users can view their own boost custom names" ON public.boost_custom_names;
DROP POLICY IF EXISTS "Users can insert their own boost custom names" ON public.boost_custom_names;
DROP POLICY IF EXISTS "Users can update their own boost custom names" ON public.boost_custom_names;
DROP POLICY IF EXISTS "Users can delete their own boost custom names" ON public.boost_custom_names;

CREATE POLICY "Anyone can view boost custom names" ON public.boost_custom_names
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage boost custom names" ON public.boost_custom_names
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
