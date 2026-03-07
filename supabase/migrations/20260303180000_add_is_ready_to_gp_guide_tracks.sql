-- Add is_ready field to user_gp_guide_tracks table

ALTER TABLE user_gp_guide_tracks ADD COLUMN is_ready BOOLEAN NOT NULL DEFAULT false;
