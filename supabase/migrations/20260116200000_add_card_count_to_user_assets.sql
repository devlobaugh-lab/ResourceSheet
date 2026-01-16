-- Add card_count field to user_drivers and user_car_parts tables
-- Migration: 20260116200000_add_card_count_to_user_assets

-- Add card_count column to user_drivers table
ALTER TABLE public.user_drivers
ADD COLUMN card_count INTEGER DEFAULT 0;

-- Add card_count column to user_car_parts table
ALTER TABLE public.user_car_parts
ADD COLUMN card_count INTEGER DEFAULT 0;

-- Create indexes for the new card_count fields
CREATE INDEX idx_user_drivers_card_count ON public.user_drivers(card_count);
CREATE INDEX idx_user_car_parts_card_count ON public.user_car_parts(card_count);
