-- Enable RLS on track rotation tables that were missing it
ALTER TABLE track_rotation_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_rotation_schedule ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view rotation sets and schedule
CREATE POLICY "Anyone can view track_rotation_sets" ON track_rotation_sets
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage track_rotation_sets" ON track_rotation_sets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Anyone can view track_rotation_schedule" ON track_rotation_schedule
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage track_rotation_schedule" ON track_rotation_schedule
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );
