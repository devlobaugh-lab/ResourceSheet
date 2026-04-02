import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { updateSeasonSchema } from '@/lib/validation'

// GET /api/seasons/[id] - Get single season
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid ID format' } },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('seasons')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Season not found' } },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Season GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/seasons/[id] - Update season (admin only)
// When is_active: true, activates the season:
//   - validates content_cache_loaded = true
//   - sets activated_at = NOW()
//   - clears is_active on all other seasons
//   - auto-generates track rotation schedule from season.start_date
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid ID format' } },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateSeasonSchema.parse(body)

    if (validatedData.is_active === true) {
      // Fetch the season to validate preconditions
      const { data: season, error: fetchError } = await supabaseAdmin
        .from('seasons')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !season) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Season not found' } },
          { status: 404 }
        )
      }

      if (!season.content_cache_loaded) {
        return NextResponse.json(
          { error: { code: 'PRECONDITION_FAILED', message: 'Content cache must be loaded before activating this season.' } },
          { status: 422 }
        )
      }

      const now = new Date().toISOString()

      // Deactivate all other seasons
      const { error: clearError } = await supabaseAdmin
        .from('seasons')
        .update({ is_active: false })
        .neq('id', id)

      if (clearError) {
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: clearError.message } },
          { status: 500 }
        )
      }

      // Activate this season
      const { data, error } = await supabaseAdmin
        .from('seasons')
        .update({ is_active: true, activated_at: now })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: error.message } },
          { status: 500 }
        )
      }

      // Auto-generate track rotation schedule if start_date is set
      if (season.start_date) {
        const rotationError = await generateRotationSchedule(season.start_date)
        if (rotationError) {
          console.error('Failed to generate rotation schedule:', rotationError)
          // Non-fatal — season is already activated
        }
      }

      return NextResponse.json({ data })
    }

    // Non-activation update (name, content_cache_loaded, etc.)
    const { data, error } = await supabaseAdmin
      .from('seasons')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Season not found' } },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Season PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/seasons/[id] - Delete season (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

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

    const { id } = await params

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid ID format' } },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('seasons')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return new NextResponse(null, { status: 204 })

  } catch (error) {
    console.error('Season DELETE error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// Generate 2 years of track rotation schedule entries (104 two-week periods),
// cycling through rotation sets 1–7 indefinitely, starting from seasonStartDate.
// Deletes any existing schedule entries from seasonStartDate onward first.
async function generateRotationSchedule(seasonStartDate: string): Promise<string | null> {
  try {
    // Delete future entries from this date forward
    const { error: deleteError } = await supabaseAdmin
      .from('track_rotation_schedule')
      .delete()
      .gte('start_date', seasonStartDate)

    if (deleteError) return deleteError.message

    // Fetch all rotation sets ordered by set_number
    const { data: sets, error: setsError } = await supabaseAdmin
      .from('track_rotation_sets')
      .select('id, set_number')
      .order('set_number', { ascending: true })

    if (setsError || !sets || sets.length === 0) {
      return setsError?.message ?? 'No rotation sets found'
    }

    const PERIODS = 104 // ~2 years of 2-week periods
    const PERIOD_DAYS = 14

    const startMs = new Date(seasonStartDate).getTime()

    const entries = []
    for (let i = 0; i < PERIODS; i++) {
      const set = sets[i % sets.length]
      const entryStartMs = startMs + i * PERIOD_DAYS * 86400000
      const entryEndMs = entryStartMs + (PERIOD_DAYS - 1) * 86400000

      entries.push({
        rotation_set_id: set.id,
        start_date: new Date(entryStartMs).toISOString().split('T')[0],
        end_date: new Date(entryEndMs).toISOString().split('T')[0],
      })
    }

    const { error: insertError } = await supabaseAdmin
      .from('track_rotation_schedule')
      .insert(entries)

    return insertError?.message ?? null

  } catch (err) {
    return String(err)
  }
}
