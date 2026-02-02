import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { UserTrackGuide, Inserts, Updates } from '@/types/database'

// Validation schemas
const createTrackGuideSchema = z.object({
  track_id: z.string().uuid(),
  gp_level: z.number().int().min(0).max(3),
  driver_1_id: z.string().uuid().optional().nullable(),
  driver_2_id: z.string().uuid().optional().nullable(),
  driver_1_boost_id: z.string().uuid().optional().nullable(),
  driver_2_boost_id: z.string().uuid().optional().nullable(),
  alt_driver_ids: z.array(z.string().uuid()).max(6).optional().default([]),
  alt_boost_ids: z.array(z.string().uuid()).optional().default([]),
  free_boost_id: z.string().uuid().optional().nullable(),
  saved_setup_id: z.string().uuid().optional().nullable(),
  setup_notes: z.string().optional().nullable(),
  dry_strategy: z.string().optional().nullable(),
  wet_strategy: z.string().optional().nullable(),
  driver_1_dry_strategy: z.string().optional().nullable(),
  driver_1_wet_strategy: z.string().optional().nullable(),
  driver_2_dry_strategy: z.string().optional().nullable(),
  driver_2_wet_strategy: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

const updateTrackGuideSchema = z.object({
  track_id: z.string().uuid().optional(),
  gp_level: z.number().int().min(0).max(3).optional(),
  driver_1_id: z.string().uuid().optional().nullable(),
  driver_2_id: z.string().uuid().optional().nullable(),
  driver_1_boost_id: z.string().uuid().optional().nullable(),
  driver_2_boost_id: z.string().uuid().optional().nullable(),
  alt_driver_ids: z.array(z.string().uuid()).max(6).optional(),
  alt_boost_ids: z.array(z.string().uuid()).optional(),
  free_boost_id: z.string().uuid().optional().nullable(),
  saved_setup_id: z.string().uuid().optional().nullable(),
  setup_notes: z.string().optional().nullable(),
  dry_strategy: z.string().optional().nullable(),
  wet_strategy: z.string().optional().nullable(),
  driver_1_dry_strategy: z.string().optional().nullable(),
  driver_1_wet_strategy: z.string().optional().nullable(),
  driver_2_dry_strategy: z.string().optional().nullable(),
  driver_2_wet_strategy: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).partial()

// GET /api/track-guides - List user's track guides with optional filters
export async function GET(request: NextRequest) {
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
            console.log('✅ Track guides API authenticated user from JWT token:', user.id)
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
          console.log('✅ Track guides API authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ Track guides API auth failed, trying without authentication')
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const trackId = searchParams.get('track_id')
    const gpLevel = searchParams.get('gp_level')

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('user_track_guides')
      .select(`
        *,
        tracks (
          id,
          name,
          alt_name,
          driver_track_stat,
          car_track_stat
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (trackId) {
      query = query.eq('track_id', trackId)
    }

    if (gpLevel) {
      query = query.eq('gp_level', parseInt(gpLevel))
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })

  } catch (error) {
    console.error('Track guides GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/track-guides/:id - Update existing track guide
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
            console.log('✅ Track guides PUT authenticated user from JWT token:', user.id)
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
          console.log('✅ Track guides PUT authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ Track guides PUT auth failed, trying without authentication')
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
    const validatedData = updateTrackGuideSchema.parse(body)

    // Check if track guide exists and belongs to user
    const { data: existing } = await supabase
      .from('user_track_guides')
      .select('id, user_id')
      .eq('id', params.id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Track guide not found' } },
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
      .from('user_track_guides')
      .update(validatedData)
      .eq('id', params.id)
      .select(`
        *,
        tracks (
          id,
          name,
          alt_name,
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

    console.error('Track guides PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/track-guides - Create new track guide
export async function POST(request: NextRequest) {
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
            console.log('✅ Track guides POST authenticated user from JWT token:', user.id)
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
          console.log('✅ Track guides POST authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ Track guides POST auth failed, trying without authentication')
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
    const validatedData = createTrackGuideSchema.parse(body)

    // Check if track guide already exists for this user/track/gp_level
    const { data: existing } = await supabase
      .from('user_track_guides')
      .select('id')
      .eq('user_id', user.id)
      .eq('track_id', validatedData.track_id)
      .eq('gp_level', validatedData.gp_level)
      .single()

    if (existing) {
      return NextResponse.json(
        { 
          error: { 
            code: 'CONFLICT', 
            message: 'Track guide already exists for this track and GP level',
            existing_guide_id: existing.id
          } 
        },
        { status: 409 }
      )
    }

    const trackGuideData: Inserts<'user_track_guides'> = {
      user_id: user.id,
      track_id: validatedData.track_id,
      gp_level: validatedData.gp_level,
      driver_1_id: validatedData.driver_1_id,
      driver_2_id: validatedData.driver_2_id,
      driver_1_boost_id: validatedData.driver_1_boost_id,
      driver_2_boost_id: validatedData.driver_2_boost_id,
      alt_driver_ids: validatedData.alt_driver_ids,
      alt_boost_ids: validatedData.alt_boost_ids,
      free_boost_id: validatedData.free_boost_id,
      saved_setup_id: validatedData.saved_setup_id,
      setup_notes: validatedData.setup_notes,
      dry_strategy: validatedData.dry_strategy,
      wet_strategy: validatedData.wet_strategy,
      notes: validatedData.notes,
    }

    const { data, error } = await supabase
      .from('user_track_guides')
      .insert(trackGuideData)
      .select(`
        *,
        tracks (
          id,
          name,
          alt_name,
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

    return NextResponse.json({ data }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Track guides POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
