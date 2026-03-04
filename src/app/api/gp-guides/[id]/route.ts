import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, createServerSupabaseClient, createAuthenticatedSupabaseClient } from '@/lib/supabase'

const updateGpGuideSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  start_date: z.string().nullable().optional(),
  gp_level: z.number().int().min(0).max(3).optional(),
  notes: z.string().nullable().optional(),
  weekend_strategy_same: z.boolean().optional(),
  is_ready: z.boolean().optional(),
}).partial()

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
        )
        if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
          return { id: payload.sub, email: payload.email }
        }
      }
    } catch { /* Fall through */ }
  }
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!error && user) return user
  } catch { /* Auth failed */ }
  return null
}

// GET /api/gp-guides/[id] - Get full GP guide with tracks and results
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Use authenticated client for RLS enforcement
    const supabase = createAuthenticatedSupabaseClient(request)

    // Fetch guide header (RLS will enforce ownership)
    const { data: guide, error: guideError } = await supabase
      .from('user_gp_guides')
      .select('*')
      .eq('id', params.id)
      .single()

    if (guideError || !guide) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'GP guide not found' } },
        { status: 404 }
      )
    }

    // Fetch track slots (RLS will enforce ownership)
    const { data: tracks, error: tracksError } = await supabase
      .from('user_gp_guide_tracks')
      .select('*')
      .eq('gp_guide_id', params.id)
      .order('race_type', { ascending: true })
      .order('race_number', { ascending: true })

    if (tracksError) {
      console.error('Error fetching GP guide tracks:', tracksError)
    }

    // Fetch results notes (RLS will enforce ownership)
    const { data: results, error: resultsError } = await supabase
      .from('user_gp_guide_results')
      .select('*')
      .eq('gp_guide_id', params.id)

    if (resultsError) {
      console.error('Error fetching GP guide results:', resultsError)
    }

    return NextResponse.json({
      data: { ...guide, tracks: tracks || [], results: results || [] }
    })
  } catch (error) {
    console.error('GP guide GET [id] error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/gp-guides/[id] - Update GP guide header
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = updateGpGuideSchema.parse(body)

    // Use authenticated client for RLS enforcement
    const supabase = createAuthenticatedSupabaseClient(request)

    // Handle weekend_strategy_same toggle: if turning OFF, create final round slots
    if (validated.weekend_strategy_same === false) {
      const { data: existingFinalSlots } = await supabase
        .from('user_gp_guide_tracks')
        .select('id')
        .eq('gp_guide_id', params.id)
        .eq('race_type', 'final')
        .limit(1)

      if (!existingFinalSlots || existingFinalSlots.length === 0) {
        const { data: openingSlots } = await supabase
          .from('user_gp_guide_tracks')
          .select('*')
          .eq('gp_guide_id', params.id)
          .eq('race_type', 'opening')
          .order('race_number')

        if (openingSlots && openingSlots.length > 0) {
          const finalSlots = openingSlots.map((slot: any) => ({
            gp_guide_id: params.id,
            track_id: slot.track_id,
            race_type: 'final' as const,
            race_number: slot.race_number,
            is_wet: slot.is_wet,
            driver_1_id: slot.driver_1_id,
            driver_2_id: slot.driver_2_id,
            driver_1_boost_id: slot.driver_1_boost_id,
            driver_2_boost_id: slot.driver_2_boost_id,
            alt_driver_ids: slot.alt_driver_ids,
            alt_boost_ids: slot.alt_boost_ids,
            saved_setup_id: slot.saved_setup_id,
            setup_notes: slot.setup_notes,
            driver_1_tire_strategy: slot.driver_1_tire_strategy,
            driver_2_tire_strategy: slot.driver_2_tire_strategy,
            strategy_notes: slot.strategy_notes,
          }))
          await supabase.from('user_gp_guide_tracks').insert(finalSlots)
        } else {
          const blankFinalSlots = Array.from({ length: 8 }, (_, i) => ({
            gp_guide_id: params.id,
            race_type: 'final' as const,
            race_number: i + 1,
            is_wet: false,
            alt_driver_ids: [],
            alt_boost_ids: [],
          }))
          await supabase.from('user_gp_guide_tracks').insert(blankFinalSlots)
        }
      }
    }

    // Debug logging
    console.log('Attempting to update GP guide with data:', validated)
    console.log('is_ready value:', validated.is_ready)

    // Update the guide (RLS will enforce ownership)
    const { data, error } = await supabase
      .from('user_gp_guides')
      .update(validated)
      .eq('id', params.id)
      .select('*')
      .single()

    console.log('Update result:', { data, error })

    if (error) {
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
    console.error('GP guide PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/gp-guides/[id] - Delete GP guide (cascades to tracks and results)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Use authenticated client for RLS enforcement
    const supabase = createAuthenticatedSupabaseClient(request)

    // Delete the guide (RLS will enforce ownership)
    const { error } = await supabase
      .from('user_gp_guides')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GP guide DELETE error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
