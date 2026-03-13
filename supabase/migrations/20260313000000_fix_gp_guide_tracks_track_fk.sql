-- Change user_gp_guide_tracks.track_id FK from ON DELETE CASCADE to ON DELETE SET NULL
-- Rationale: track_id is nullable in this table, so if a track is deleted/re-imported
-- the GP guide track entry should be preserved (with track_id nulled) rather than deleted.

ALTER TABLE user_gp_guide_tracks
  DROP CONSTRAINT user_gp_guide_tracks_track_id_fkey;

ALTER TABLE user_gp_guide_tracks
  ADD CONSTRAINT user_gp_guide_tracks_track_id_fkey
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE SET NULL;
