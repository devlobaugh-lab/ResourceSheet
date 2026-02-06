import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Inserts, Updates } from '@/types/database'

// Validation schemas
const createGPTrackSchema = z.object({
  track_id: z.string().uuid(),
  race_number: z.number().optional().nullable(),
  race_type: z.string().optional().nullable(),
  track_condition: z.string().optional().nullable(),
  driver_1_id: z.string().uuid().optional().nullable(),
  driver_2_id: z.string().uuid().optional().nullable(),
  driver_1_boost_id: z.string().uuid().optional().nullable(),
  driver_2_boost_id: z.string().uuid().optional().nullable(),
  driver_1_strategy: z.string().optional().nullable(),
  driver_2_strategy: z.string().optional().nullable(),
  setup_notes: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

const updateGPTrackSchema = z.object({
  track_id: z.string().uuid().optional(),
  race_number: z.number().optional().nullable(),
  race_type: z.string().optional().nullable(),
  track_condition: z.string().optional().nullable(),
  driver_1_id: z.string().uuid().optional().nullable(),
  driver_2_id: z.string().uuid().optional().nullable(),
  driver_1_boost_id: z.string().uuid().optional().nullable(),
  driver_2_boost_id: z.string().uuid().optional().nullable(),
  driver_1_strategy: z.string().optional().nullable(),
  driver_2_strategy: z.string().optional().nullable(),
  setup_notes: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).partial()

// GET /api/gp-guides/:id/tracks - Get all tracks for a specific GP guide
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
            console.log('✅ GP guide tracks GET authenticated user from JWT token:', user.id)
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
          console.log('✅ GP guide tracks GET authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guide tracks GET auth failed, trying without authentication')
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Check if GP guide exists and belongs to user
    const { data: existing } = await supabase
      .from('gp_guides')
      .select('id, user_id')
      .eq('id', params.id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'GP guide not found' } },
        { status: 404 }
      )
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('gp_guide_tracks')
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
      .eq('gp_guide_id', params.id)
      .order('race_number', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })

  } catch (error) {
    console.error('GP guide tracks GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/gp-guides/:id/tracks - Add or update track in GP guide
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
            console.log('✅ GP guide tracks POST authenticated user from JWT token:', user.id)
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
          console.log('✅ GP guide tracks POST authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guide tracks POST auth failed, trying without authentication')
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
    const validatedData = createGPTrackSchema.parse(body)

    // Check if GP guide exists and belongs to user
    const { data: existing } = await supabase
      .from('gp_guides')
      .select('id, user_id')
      .eq('id', params.id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'GP guide not found' } },
        { status: 404 }
      )
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      )
    }

    // Check if track already exists for this GP guide
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
        race_number: validatedData.race_number,
        race_type: validatedData.race_type,
        track_condition: validatedData.track_condition,
        driver_1_id: validatedData.driver_1_id,
        driver_2_id: validatedData.driver_2_id,
        driver_1_boost_id: validatedData.driver_1_boost_id,
        driver_2_boost_id: validatedData.driver_2_boost_id,
        driver_1_strategy: validatedData.driver_1_strategy,
        driver_2_strategy: validatedData.driver_2_strategy,
        setup_notes: validatedData.setup_notes,
        notes: validatedData.notes,
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
      const trackData: Inserts<'gp_guide_tracks'> = {
        gp_guide_id: params.id,
        track_id: validatedData.track_id,
        race_number: validatedData.race_number,
        race_type: validatedData.race_type,
        track_condition: validatedData.track_condition,
        driver_1_id: validatedData.driver_1_id,
        driver_2_id: validatedData.driver_2_id,
        driver_1_boost_id: validatedData.driver_1_boost_id,
        driver_2_boost_id: validatedData.driver_2_boost_id,
        driver_1_strategy: validatedData.driver_1_strategy,
        driver_2_strategy: validatedData.driver_2_strategy,
        setup_notes: validatedData.setup_notes,
        notes: validatedData.notes,
      }

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

    return NextResponse.json({ data })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('GP guide tracks POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/gp-guides/:id/tracks/:track_id - Update specific track in GP guide
export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string; track_id: string } }
) {
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
            console.log('✅ GP guide tracks PUT authenticated user from JWT token:', user.id)
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
          console.log('✅ GP guide tracks PUT authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guide tracks PUT auth failed, trying without authentication')
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
    const validatedData = updateGPTrackSchema.parse(body)

    // Check if GP guide exists and belongs to user
    const { data: existing } = await supabase
      .from('gp_guides')
      .select('id, user_id')
      .eq('id', params.id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'GP guide not found' } },
        { status: 404 }
      )
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      )
    }

    // Check if track exists and belongs to this GP guide
    const { data: existingTrack } = await supabase
      .from('gp_guide_tracks')
      .select('id, gp_guide_id')
      .eq('id', params.track_id)
      .single()

    if (!existingTrack) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Track not found in GP guide' } },
        { status: 404 }
      )
    }

    if (existingTrack.gp_guide_id !== params.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Track does not belong to this GP guide' } },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('gp_guide_tracks')
      .update(validatedData)
      .eq('id', params.track_id)
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

    console.error('GP guide tracks PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/gp-guides/:id/tracks/:track_id - Delete specific track from GP guide
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string; track_id: string } }
) {
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
            console.log('✅ GP guide tracks DELETE authenticated user from JWT token:', user.id)
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
          console.log('✅ GP guide tracks DELETE authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guide tracks DELETE auth failed, trying without authentication')
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Check if GP guide exists and belongs to user
    const { data: existing } = await supabase
      .from('gp_guides')
      .select('id, user_id')
      .eq('id', params.id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'GP guide not found' } },
        { status: 404 }
      )
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      )
    }

    // Check if track exists and belongs to this GP guide
    const { data: existingTrack } = await supabase
      .from('gp_guide_tracks')
      .select('id, gp_guide_id')
      .eq('id', params.track_id)
      .single()

    if (!existingTrack) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Track not found in GP guide' } },
        { status: 404 }
      )
    }

    if (existingTrack.gp_guide_id !== params.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Track does not belong to this GP guide' } },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('gp_guide_tracks')
      .delete()
      .eq('id', params.track_id)

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Track deleted successfully' })

  } catch (error) {
    console.error('GP guide tracks DELETE error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}