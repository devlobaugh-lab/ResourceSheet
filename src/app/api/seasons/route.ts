import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createSeasonSchema } from '@/lib/validation'

// GET /api/seasons - List all seasons
// Admins receive all seasons (including pending); others receive only activated seasons.
export async function GET(request: NextRequest) {
  try {
    // Determine if requester is an admin
    let isAdmin = false
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            },
          },
        }
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        isAdmin = profile?.is_admin === true
      }
    } catch {
      // Non-fatal — treat as non-admin
    }

    const { searchParams } = new URL(request.url)

    let query = supabaseAdmin
      .from('seasons')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Non-admins only see seasons that have been activated (not pending)
    if (!isAdmin) {
      query = query.not('activated_at', 'is', null)
    }

    // Optional is_active filter
    const isActive = searchParams.get('is_active')
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    // Apply pagination
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20
    const start = (page - 1) * limit
    const end = start + limit - 1

    const paginatedData = (data || []).slice(start, end)

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Seasons GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/seasons - Create new season (admin only)
// Name is auto-generated as "Season N+1". At most one pending season allowed.
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Check admin status
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createSeasonSchema.parse(body)

    // Enforce at-most-one pending season
    const { data: existingPending } = await supabaseAdmin
      .from('seasons')
      .select('id')
      .is('activated_at', null)
      .limit(1)

    if (existingPending && existingPending.length > 0) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'A pending season already exists. Activate or delete it before creating a new one.' } },
        { status: 409 }
      )
    }

    // Auto-generate season name: find highest "Season N" number and add 1
    const { data: allSeasons } = await supabaseAdmin
      .from('seasons')
      .select('name')

    let maxNumber = 0
    for (const s of allSeasons ?? []) {
      const match = s.name.match(/^Season\s+(\d+)$/i)
      if (match) {
        const n = parseInt(match[1], 10)
        if (n > maxNumber) maxNumber = n
      }
    }
    const newName = `Season ${maxNumber + 1}`

    const { data, error } = await supabaseAdmin
      .from('seasons')
      .insert({
        name: newName,
        start_date: validatedData.start_date,
        is_active: false,
        content_cache_loaded: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    // Generate 26 rotation schedule entries for the new season, starting with Set 1
    const { data: rotationSets } = await supabaseAdmin
      .from('track_rotation_sets')
      .select('id, set_number')
      .order('set_number', { ascending: true })

    if (rotationSets && rotationSets.length === 7 && validatedData.start_date) {
      const setById = new Map(rotationSets.map(s => [s.set_number, s.id]))
      const scheduleEntries = Array.from({ length: 26 }, (_, i) => {
        const startOffset = i * 14
        const startDate = new Date(validatedData.start_date + 'T00:00:00Z')
        startDate.setUTCDate(startDate.getUTCDate() + startOffset)
        const endDate = new Date(startDate)
        endDate.setUTCDate(endDate.getUTCDate() + 14)
        return {
          season_id: data.id,
          rotation_set_id: setById.get((i % 7) + 1)!,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        }
      })
      await supabaseAdmin.from('track_rotation_schedule').insert(scheduleEntries)
    }

    return NextResponse.json({ data }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Seasons POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
