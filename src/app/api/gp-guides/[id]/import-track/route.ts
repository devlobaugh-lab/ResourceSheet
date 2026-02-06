import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Inserts, Updates } from '@/types/database'

// Validation schema for track import
const importTrackSchema = z.object({
  track_id: z.string().uuid(),
  source_gp_level: z.number().int().min(0).max(3),
  track_condition: z.string().optional().nullable(), // 'dry', 'wet', or 'unknown'
})

// POST /api/gp-guides/:id/import-track - Import track guide data into GP guide
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Try to get user from Authorization header first, then fall back to cookies
    let user = null
    const authHeader = request.headers.get('authorization')

    if (authHeader?.startsWith('Bearer ')) {
      // Try to validate JWT token directly
      const token = authHeader.substring(7)
      try {
        // For local development, trust the JWT and extract user info
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
          )

          if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
            user = {
              id: payload.sub,
              email: payload.email,
              user_metadata: payload.user_metadata || {},
              app_metadata: payload.app_metadata || {},
            }
            console.log('✅ GP guide import track POST authenticated user from JWT token:', user.id)
          }
        }
      } catch (error) {
        console.warn('JWT validation failed:', error)
      }
    }

    // If JWT didn't work, try cookie-based auth
    if (!user) {
      try {
        const supabase = createServerSupabaseClient()
        const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

        if (!authError && cookieUser) {
          user = cookieUser
          console.log('✅ GP guide import track POST authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guide import track POST auth failed, trying without authentication')
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const validatedData = importTrackSchema.parse(body)

    // Check if GP guide exists and belongs to user
    const { data: existingGP } = await supabase
      .from('gp_guides')
      .select('id, user_id')
      .eq('id', params.id)
      .single()

    if (!existingGP) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'GP guide not found' } },
        { status: 404 }
      )
    }

    if (existingGP.user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      )
    }

    // Check if track exists
    const { data: track } = await supabase
      .from('tracks')
      .select('id, name, alt_name, laps, driver_track_stat, car_track_stat')
      .eq('id', validatedData.track_id)
      .single()

    if (!track) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Track not found' } },
        { status: 404 }
      )
    }

    // Check if source track guide exists
    const { data: sourceTrackGuide } = await supabase
      .from('user_track_guides')
      .select(`
        *,
        user_track_guide_drivers (
          id,
          driver_id,
          recommended_boost_id,
          track_strategy
        )
      `)
      .eq('user_id', user.id)
      .eq('track_id', validatedData.track_id)
      .eq('gp_level', validatedData.source_gp_level)
      .single()

    if (!sourceTrackGuide) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: `Track guide not found for GP level ${validatedData.source_gp_level}` } },
        { status: 404 }
      )
    }

    // Determine which strategy to use based on track condition
    let driver1Strategy = null
    let driver2Strategy = null

    if (validatedData.track_condition === 'dry') {
      driver1Strategy = sourceTrackGuide.driver_1_dry_strategy
      driver2Strategy = sourceTrackGuide.driver_2_dry_strategy
    } else if (validatedData.track_condition === 'wet') {
      driver1Strategy = sourceTrackGuide.driver_1_wet_strategy
      driver2Strategy = sourceTrackGuide.driver_2_wet_strategy
    } else {
      // If unknown or not specified, use dry strategy as default
      driver1Strategy = sourceTrackGuide.driver_1_dry_strategy || sourceTrackGuide.driver_1_wet_strategy
      driver2Strategy = sourceTrackGuide.driver_2_dry_strategy || sourceTrackGuide.driver_2_wet_strategy
    }

    // Prepare track data for GP guide
    const trackData: Inserts<'gp_guide_tracks'> = {
      gp_guide_id: params.id,
      track_id: validatedData.track_id,
      track_condition: validatedData.track_condition || 'unknown',
      driver_1_id: sourceTrackGuide.driver_1_id,
      driver_2_id: sourceTrackGuide.driver_2_id,
      driver_1_boost_id: sourceTrackGuide.driver_1_boost_id,
      driver_2_boost_id: sourceTrackGuide.driver_2_boost_id,
      driver_1_strategy: driver1Strategy,
      driver_2_strategy: driver2Strategy,
      setup_notes: sourceTrackGuide.setup_notes,
      notes: sourceTrackGuide.notes,
    }

    // Check if track already exists in GP guide
    const { data: existingTrack } = await supabase
      .from('gp_guide_tracks')
      .select('id')
      .eq('gp_guide_id', params.id)
      .eq('track_id', validatedData.track_id)
      .single()

    let data, error

    if (existingTrack) {
      // Update existing track
      const updateData: Updates<'gp_guide_tracks'> = {
        track_condition: validatedData.track_condition || 'unknown',
        driver_1_id: sourceTrackGuide.driver_1_id,
        driver_2_id: sourceTrackGuide.driver_2_id,
        driver_1_boost_id: sourceTrackGuide.driver_1_boost_id,
        driver_2_boost_id: sourceTrackGuide.driver_2_boost_id,
        driver_1_strategy: driver1Strategy,
        driver_2_strategy: driver2Strategy,
        setup_notes: sourceTrackGuide.setup_notes,
        notes: sourceTrackGuide.notes,
      }

      const result = await supabase
        .from('gp_guide_tracks')
        .update(updateData)
        .eq('id', existingTrack.id)
        .select(`
          *,
          tracks (
            id,
            name,
            alt_name,
            laps,
            driver_track_stat,
            car_track_stat
          )
        `)
        .single()

      data = result.data
      error = result.error
    } else {
      // Create new track
      const result = await supabase
        .from('gp_guide_tracks')
        .insert(trackData)
        .select(`
          *,
          tracks (
            id,
            name,
            alt_name,
            laps,
            driver_track_stat,
            car_track_stat
          )
        `)
        .single()

      data = result.data
      error = result.error
    }

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    // Return success with imported data and source information
    return NextResponse.json({
      data,
      imported_from: {
        track_guide_id: sourceTrackGuide.id,
        gp_level: validatedData.source_gp_level,
        track_condition: validatedData.track_condition || 'unknown',
        source_track_guide: {
          name: track.name,
          alt_name: track.alt_name,
          driver_1_dry_strategy: sourceTrackGuide.driver_1_dry_strategy,
          driver_1_wet_strategy: sourceTrackGuide.driver_1_wet_strategy,
          driver_2_dry_strategy: sourceTrackGuide.driver_2_dry_strategy,
          driver_2_wet_strategy: sourceTrackGuide.driver_2_wet_strategy,
        }
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('GP guide import track POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}