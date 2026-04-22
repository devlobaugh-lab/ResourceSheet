import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'

async function requireAdmin(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
      global: { headers: { Authorization: request.headers.get('authorization') || '' } },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_admin === true ? user : null
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]
}

// POST /api/admin/track-rotations/schedule/generate
// Body: { season_id: string }
// Generates 26 two-week rotation entries for the season starting on the first
// Wednesday on or after the season's start_date, cycling through all rotation
// sets in set_number order.
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { season_id, start_date } = body

    if (!season_id || !start_date) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'season_id and start_date are required' } },
        { status: 400 }
      )
    }

    // Verify the season exists
    const { data: season, error: seasonError } = await supabaseAdmin
      .from('seasons')
      .select('id')
      .eq('id', season_id)
      .single()

    if (seasonError || !season) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Season not found' } },
        { status: 404 }
      )
    }

    // Fetch all rotation sets ordered by set_number
    const { data: sets, error: setsError } = await supabaseAdmin
      .from('track_rotation_sets')
      .select('id, set_number')
      .order('set_number', { ascending: true })

    if (setsError || !sets || sets.length === 0) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'No rotation sets found' } },
        { status: 404 }
      )
    }

    const firstWed = start_date
    const ROTATION_COUNT = 26
    const ROTATION_DAYS = 14

    const entries = Array.from({ length: ROTATION_COUNT }, (_, i) => {
      const start_date = addDays(firstWed, i * ROTATION_DAYS)
      const end_date = addDays(start_date, ROTATION_DAYS - 1)
      const rotation_set_id = sets[i % sets.length].id
      return { rotation_set_id, season_id, start_date, end_date }
    })

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('track_rotation_schedule')
      .insert(entries)
      .select()

    if (insertError) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: insertError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: inserted, count: inserted?.length ?? 0 }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/track-rotations/schedule/generate:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
