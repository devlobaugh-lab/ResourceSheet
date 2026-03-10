ALTER TABLE public.user_car_setups
  ADD COLUMN season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL;

CREATE INDEX idx_user_car_setups_season_id ON public.user_car_setups(season_id);
