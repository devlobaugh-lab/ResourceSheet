import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'

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

/**
 * GET /api/gp-guides/[id]/import/[trackId]
 * Fetches the user's existing Track Guide for a given track at the GP's gp_level.
 * Query params: is_wet: boolean
 * Read-only — does NOT modify any data.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; trackId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const isWet = searchParams.get('is_wet') === 'true'

    // Verify the GP guide belongs to the user and get its gp_level
    const { data: guide, error: guideError } = await supabaseAdmin
      .from('user_gp_guides')
      .select('id, gp_level, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (guideError || !guide) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'GP guide not found' } },
        { status: 404 }
      )
    }

    // Fetch the user's track guide for this track at this GP level
    const { data: trackGuide, error: trackGuideError } = await supabaseAdmin
      .from('user_track_guides')
      .select(`*, track:tracks (id, name, alt_name, laps, driver_track_stat, car_track_stat)`)
      .eq('user_id', user.id)
      .eq('track_id', params.trackId)
      .eq('gp_level', guide.gp_level)
      .single()

    if (trackGuideError || !trackGuide) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'No track guide found for this track at the current GP level' } },
        { status: 404 }
      )
    }

    // Map track guide fields to GP guide track slot fields
    const mappedData = {
      driver_1_id: trackGuide.driver_1_id,
      driver_2_id: trackGuide.driver_2_id,
      driver_1_boost_id: trackGuide.driver_1_boost_id,
      driver_2_boost_id: trackGuide.driver_2_boost_id,
      alt_driver_ids: trackGuide.alt_driver_ids || [],
      alt_boost_ids: trackGuide.alt_boost_ids || [],
      saved_setup_id: trackGuide.saved_setup_id,
      setup_notes: trackGuide.setup_notes,
      driver_1_tire_strategy: isWet
        ? (trackGuide.driver_1_wet_strategy || null)
        : (trackGuide.driver_1_dry_strategy || null),
      driver_2_tire_strategy: isWet
        ? (trackGuide.driver_2_wet_strategy || null)
        : (trackGuide.driver_2_dry_strategy || null),
      strategy_notes: trackGuide.notes,
      _source_guide: {
        id: trackGuide.id,
        gp_level: trackGuide.gp_level,
        dry_strategy: trackGuide.dry_strategy,
        wet_strategy: trackGuide.wet_strategy,
        driver_1_dry_strategy: trackGuide.driver_1_dry_strategy,
        driver_1_wet_strategy: trackGuide.driver_1_wet_strategy,
        driver_2_dry_strategy: trackGuide.driver_2_dry_strategy,
        driver_2_wet_strategy: trackGuide.driver_2_wet_strategy,
        track: trackGuide.track,
      },
    }

    return NextResponse.json({ data: mappedData })
  } catch (error) {
    console.error('GP guide import GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
