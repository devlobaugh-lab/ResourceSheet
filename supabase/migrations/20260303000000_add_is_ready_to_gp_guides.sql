-- Add is_ready field to user_gp_guides table

ALTER TABLE user_gp_guides ADD COLUMN is_ready BOOLEAN NOT NULL DEFAULT false;
