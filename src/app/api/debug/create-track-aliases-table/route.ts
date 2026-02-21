import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Endpoint to create the track_name_aliases table directly
export async function POST(request: NextRequest) {
  try {
    // Execute the SQL directly using raw query
    // Note: Supabase JS client doesn't support DDL directly, so we need to use RPC or direct SQL
    
    // First check if table exists
    const { error: checkError } = await supabaseAdmin
      .from('track_name_aliases')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      return NextResponse.json({ 
        success: true, 
        message: 'Table already exists',
        table_exists: true 
      })
    }
    
    // Table doesn't exist - we need to create it via raw SQL
    // Since we can't run DDL via the JS client, return instructions
    return NextResponse.json({
      success: false,
      message: 'Table does not exist. Please run this SQL in Supabase SQL Editor:',
      table_exists: false,
      sql: `
-- Create track_name_aliases table
CREATE TABLE track_name_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_track_name_aliases_system ON track_name_aliases(system_name);

-- Enable RLS
ALTER TABLE track_name_aliases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view track_name_aliases" ON track_name_aliases
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can manage track_name_aliases" ON track_name_aliases
  FOR ALL USING (true);

-- Grant permissions
GRANT SELECT ON track_name_aliases TO authenticated;

-- Insert default aliases
INSERT INTO track_name_aliases (system_name, display_name) VALUES
  ('Americas', 'Austin'),
  ('Great Britain', 'Silverstone');
`
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error'
    })
  }
}