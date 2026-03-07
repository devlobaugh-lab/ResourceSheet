CREATE TABLE user_custom_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  overtaking INTEGER NOT NULL DEFAULT 0,
  blocking INTEGER NOT NULL DEFAULT 0,
  qualifying INTEGER NOT NULL DEFAULT 0,
  tyre_use INTEGER NOT NULL DEFAULT 0,
  race_start INTEGER NOT NULL DEFAULT 0,
  car_parts JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_custom_drivers_user_id ON user_custom_drivers(user_id);
CREATE INDEX idx_user_custom_drivers_created_at ON user_custom_drivers(created_at);

-- Enable Row Level Security
ALTER TABLE user_custom_drivers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own custom drivers" ON user_custom_drivers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own custom drivers" ON user_custom_drivers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own custom drivers" ON user_custom_drivers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own custom drivers" ON user_custom_drivers FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL PRIVILEGES ON user_custom_drivers TO PUBLIC;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_custom_drivers_updated_at 
  BEFORE UPDATE ON user_custom_drivers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();