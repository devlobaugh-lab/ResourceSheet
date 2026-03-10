ALTER TABLE public.user_gp_guides
  ADD COLUMN season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL;

CREATE INDEX idx_user_gp_guides_season_id ON public.user_gp_guides(season_id);
