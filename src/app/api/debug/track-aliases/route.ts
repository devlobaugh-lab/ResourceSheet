import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Debug endpoint to check track_name_aliases table status
export async function GET(request: NextRequest) {
  try {
    // Try to query the table
    const { data, error } = await supabaseAdmin
      .from('track_name_aliases')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({
        table_exists: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        },
        sql_to_run: `
-- Run this SQL in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS track_name_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_track_name_aliases_system ON track_name_aliases(system_name);

ALTER TABLE track_name_aliases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view track_name_aliases" ON track_name_aliases;
CREATE POLICY "Authenticated users can view track_name_aliases" ON track_name_aliases
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service role can manage track_name_aliases" ON track_name_aliases;
CREATE POLICY "Service role can manage track_name_aliases" ON track_name_aliases
  FOR ALL USING (true);

GRANT SELECT ON track_name_aliases TO authenticated;

INSERT INTO track_name_aliases (system_name, display_name) VALUES
  ('Americas', 'Austin'),
  ('Great Britain', 'Silverstone')
ON CONFLICT (system_name) DO NOTHING;
`
      })
    }
    
    return NextResponse.json({
      table_exists: true,
      row_count: data?.length || 0,
      sample_data: data
    })
  } catch (error: any) {
    return NextResponse.json({
      table_exists: false,
      error: error?.message || 'Unknown error'
    })
  }
}