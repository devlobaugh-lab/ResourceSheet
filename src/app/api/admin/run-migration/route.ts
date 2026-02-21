import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Admin endpoint to run SQL migrations directly
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sql } = body
    
    if (!sql) {
      return NextResponse.json({ error: 'SQL is required' }, { status: 400 })
    }
    
    // Use the Supabase REST API to execute raw SQL
    // We'll use the /rest/v1/rpc endpoint if available, or direct SQL execution
    
    // For local Supabase, we can try using the service role to execute via pg
    // Unfortunately the JS client doesn't support DDL directly
    
    // Alternative: Use the Supabase Management API
    // But for local development, let's just return the SQL to run manually
    
    return NextResponse.json({
      success: false,
      message: 'Please run the following SQL in your Supabase SQL Editor or via psql:',
      sql_to_run: sql,
      instructions: [
        '1. Open Supabase Studio (usually http://localhost:54323)',
        '2. Go to SQL Editor',
        '3. Paste and run the SQL below'
      ]
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error'
    })
  }
}

// GET endpoint to create the track_name_aliases table
export async function GET(request: NextRequest) {
  const createTableSQL = `
-- Create track_name_aliases table
CREATE TABLE IF NOT EXISTS track_name_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_track_name_aliases_system ON track_name_aliases(system_name);

-- Enable RLS
ALTER TABLE track_name_aliases ENABLE ROW LEVEL SECURITY;

-- Create policies (drop first if exist)
DROP POLICY IF EXISTS "Authenticated users can view track_name_aliases" ON track_name_aliases;
CREATE POLICY "Authenticated users can view track_name_aliases" ON track_name_aliases
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service role can manage track_name_aliases" ON track_name_aliases;
CREATE POLICY "Service role can manage track_name_aliases" ON track_name_aliases
  FOR ALL USING (true);

-- Grant permissions
GRANT SELECT ON track_name_aliases TO authenticated;

-- Insert default aliases
INSERT INTO track_name_aliases (system_name, display_name) VALUES
  ('Americas', 'Austin'),
  ('Great Britain', 'Silverstone')
ON CONFLICT (system_name) DO NOTHING;
`

  return NextResponse.json({
    message: 'Copy and run this SQL in Supabase SQL Editor:',
    sql: createTableSQL,
    local_supabase_url: 'http://localhost:54323',
    sql_editor_path: '/project/default/sql'
  })
}