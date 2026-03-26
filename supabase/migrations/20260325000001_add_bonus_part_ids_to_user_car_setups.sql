-- Add bonus_part_ids column to user_car_setups to persist which parts have the bonus applied
ALTER TABLE public.user_car_setups
  ADD COLUMN bonus_part_ids TEXT[] DEFAULT '{}' NOT NULL;
