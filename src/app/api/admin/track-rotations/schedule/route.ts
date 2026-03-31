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

// GET /api/admin/track-rotations/schedule
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('track_rotation_schedule')
      .select(`*, track_rotation_sets!inner(set_number)`)
      .order('start_date', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch schedule' } },
        { status: 500 }
      )
    }

    const entries = (data ?? []).map((row: any) => ({
      id: row.id,
      rotation_set_id: row.rotation_set_id,
      season_id: row.season_id,
      start_date: row.start_date,
      end_date: row.end_date,
      rotation_set_number: row.track_rotation_sets.set_number,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    return NextResponse.json({ data: entries })
  } catch (error) {
    console.error('Error in GET /api/admin/track-rotations/schedule:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/admin/track-rotations/schedule
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
    const { rotation_set_id, season_id, start_date, end_date } = body

    if (!rotation_set_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'rotation_set_id, start_date, and end_date are required' } },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('track_rotation_schedule')
      .insert({ rotation_set_id, season_id: season_id ?? null, start_date, end_date })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/track-rotations/schedule:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
