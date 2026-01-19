-- Create user_car_setups table for storing user-created car setups
-- Migration: 20260119203030_create_user_car_setups_table

CREATE TABLE public.user_car_setups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  brake_id UUID REFERENCES public.car_parts(id) ON DELETE SET NULL,
  gearbox_id UUID REFERENCES public.car_parts(id) ON DELETE SET NULL,
  rear_wing_id UUID REFERENCES public.car_parts(id) ON DELETE SET NULL,
  front_wing_id UUID REFERENCES public.car_parts(id) ON DELETE SET NULL,
  suspension_id UUID REFERENCES public.car_parts(id) ON DELETE SET NULL,
  engine_id UUID REFERENCES public.car_parts(id) ON DELETE SET NULL,
  series_filter INTEGER DEFAULT 12,
  bonus_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_user_car_setups_user_id ON public.user_car_setups(user_id);
CREATE INDEX idx_user_car_setups_created_at ON public.user_car_setups(created_at);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at_user_car_setups
  BEFORE UPDATE ON public.user_car_setups
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.user_car_setups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own car setups" ON public.user_car_setups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own car setups" ON public.user_car_setups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own car setups" ON public.user_car_setups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own car setups" ON public.user_car_setups
  FOR DELETE USING (auth.uid() = user_id);
