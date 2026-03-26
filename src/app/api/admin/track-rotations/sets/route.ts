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

// GET /api/admin/track-rotations/sets
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
      .from('track_rotation_sets')
      .select('*')
      .order('set_number', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch rotation sets' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/admin/track-rotations/sets:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/admin/track-rotations/sets
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
    const { set_number, series_data } = body

    if (!set_number || !series_data) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'set_number and series_data are required' } },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('track_rotation_sets')
      .insert({ set_number, series_data })
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
    console.error('Error in POST /api/admin/track-rotations/sets:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
