-- Add card_count field to user_boosts table
-- Migration: 20260116210000_add_card_count_to_user_boosts

-- Add card_count column to user_boosts table
ALTER TABLE public.user_boosts
ADD COLUMN card_count INTEGER DEFAULT 0;

-- Create index for the new card_count field
CREATE INDEX idx_user_boosts_card_count ON public.user_boosts(card_count);
