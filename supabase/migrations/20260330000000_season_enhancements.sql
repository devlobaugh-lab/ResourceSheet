-- Season enhancements: add lifecycle tracking columns
ALTER TABLE seasons
  ADD COLUMN content_cache_loaded BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN start_date DATE,
  ADD COLUMN activated_at TIMESTAMPTZ;

-- All existing seasons already have content loaded and were previously activated.
-- Use created_at as a reasonable proxy for when they were first made active.
UPDATE seasons SET content_cache_loaded = TRUE, activated_at = created_at;
