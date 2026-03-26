import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/track-rotations/schedule — all schedule entries with set_number, ordered by start_date
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('track_rotation_schedule')
      .select(`
        *,
        track_rotation_sets!inner(set_number)
      `)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching rotation schedule:', error)
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch schedule' } },
        { status: 500 }
      )
    }

    const entries = (data ?? []).map((row: any) => ({
      id: row.id,
      rotation_set_id: row.rotation_set_id,
      start_date: row.start_date,
      end_date: row.end_date,
      rotation_set_number: row.track_rotation_sets.set_number,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    return NextResponse.json({ data: entries })
  } catch (error) {
    console.error('Error fetching track rotation schedule:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
