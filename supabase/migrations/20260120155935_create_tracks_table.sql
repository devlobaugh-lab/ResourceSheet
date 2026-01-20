-- Create tracks table for managing race tracks with their attributes
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  alt_name TEXT,
  laps INTEGER NOT NULL CHECK (laps > 0),
  driver_track_stat TEXT NOT NULL CHECK (driver_track_stat IN ('overtaking', 'defending', 'raceStart', 'tyreUse')),
  car_track_stat TEXT NOT NULL CHECK (car_track_stat IN ('speed', 'cornering', 'powerUnit')),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tracks_season_id ON tracks(season_id);
CREATE INDEX idx_tracks_driver_track_stat ON tracks(driver_track_stat);
CREATE INDEX idx_tracks_car_track_stat ON tracks(car_track_stat);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at_tracks
  BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Public read access for tracks
CREATE POLICY "Anyone can read tracks"
  ON tracks
  FOR SELECT
  USING (true);

-- Only admins can manage tracks
CREATE POLICY "Admins can manage tracks"
  ON tracks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
