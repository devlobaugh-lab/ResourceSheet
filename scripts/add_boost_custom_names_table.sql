-- Add boost_custom_names table to fix boost name editing functionality
-- This script adds the missing table to the database

-- Create boost_custom_names table
CREATE TABLE public.boost_custom_names (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boost_id UUID REFERENCES public.boosts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    custom_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(boost_id, user_id)
);

-- Add updated_at trigger for boost_custom_names
CREATE TRIGGER handle_updated_at_boost_custom_names
    BEFORE UPDATE ON public.boost_custom_names
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS for boost_custom_names
ALTER TABLE public.boost_custom_names ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for boost_custom_names
CREATE POLICY "Users can view their own boost custom names" ON public.boost_custom_names
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own boost custom names" ON public.boost_custom_names
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boost custom names" ON public.boost_custom_names
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boost custom names" ON public.boost_custom_names
    FOR DELETE USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_boost_custom_names_boost_id ON public.boost_custom_names(boost_id);
CREATE INDEX idx_boost_custom_names_user_id ON public.boost_custom_names(user_id);
CREATE INDEX idx_boost_custom_names_custom_name ON public.boost_custom_names(custom_name);

-- Add validation constraints
ALTER TABLE public.boost_custom_names ADD CONSTRAINT boost_custom_names_custom_name_not_empty
    CHECK (char_length(trim(custom_name)) > 0);

ALTER TABLE public.boost_custom_names ADD CONSTRAINT boost_custom_names_custom_name_length
    CHECK (char_length(trim(custom_name)) <= 64);

-- Add unique constraint for custom names across all users (optional, based on requirements)
-- This prevents duplicate custom names across different users
ALTER TABLE public.boost_custom_names ADD CONSTRAINT boost_custom_names_custom_name_unique
    UNIQUE (custom_name);
