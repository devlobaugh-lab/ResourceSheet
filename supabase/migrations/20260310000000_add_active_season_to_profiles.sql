ALTER TABLE public.profiles
  ADD COLUMN active_season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL;
