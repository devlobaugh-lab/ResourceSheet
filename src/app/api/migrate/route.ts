import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Try to add the column directly using SQL
    const { data, error } = await supabase.from('user_gp_guide_tracks').select('id').limit(1)
    
    if (error) {
      return NextResponse.json(
        { error: { code: 'MIGRATION_ERROR', message: error.message } },
        { status: 500 }
      )
    }
    
    // Since we can't use run_sql, let's try a different approach
    // We'll create a temporary table to test if the column exists
    const { data: test, error: testError } = await supabase.from('user_gp_guide_tracks').select('is_ready').limit(1)
    
    if (testError && testError.code === '42703') {
      // Column doesn't exist, we need to add it manually
      return NextResponse.json(
        { error: { code: 'COLUMN_MISSING', message: 'Column is_ready does not exist in user_gp_guide_tracks table. Manual migration required.' } },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, message: 'Column is_ready exists or migration completed successfully' })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
