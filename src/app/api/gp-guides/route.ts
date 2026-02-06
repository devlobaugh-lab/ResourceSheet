import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Inserts, Updates } from '@/types/database'

// Validation schemas
const createGPGuideSchema = z.object({
  name: z.string().min(1, 'GP Guide name is required'),
  start_date: z.string().optional().nullable(),
  gp_level: z.number().int().min(0).max(3),
  boosted_assets: z.any().optional().nullable(),
  reward_bonus: z.any().optional().nullable(),
})

const updateGPGuideSchema = z.object({
  name: z.string().min(1, 'GP Guide name is required').optional(),
  start_date: z.string().optional().nullable(),
  gp_level: z.number().int().min(0).max(3).optional(),
  boosted_assets: z.any().optional().nullable(),
  reward_bonus: z.any().optional().nullable(),
}).partial()

// GET /api/gp-guides - List user's GP guides with optional filters
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
            console.log('✅ GP guides API authenticated user from JWT token:', user.id)
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
          console.log('✅ GP guides API authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guides API auth failed, trying without authentication')
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const gpLevel = searchParams.get('gp_level')
    const startDate = searchParams.get('start_date')

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('gp_guides')
      .select(`
        *,
        gp_guide_tracks (
          id,
          track_id,
          race_number,
          race_type,
          track_condition,
          driver_1_id,
          driver_2_id,
          driver_1_boost_id,
          driver_2_boost_id,
          driver_1_strategy,
          driver_2_strategy,
          setup_notes,
          notes,
          tracks (
            id,
            name,
            alt_name,
            laps,
            driver_track_stat,
            car_track_stat
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (gpLevel) {
      query = query.eq('gp_level', parseInt(gpLevel))
    }

    if (startDate) {
      query = query.gte('start_date', startDate)
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
    console.error('GP guides GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/gp-guides/:id - Update existing GP guide
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
            console.log('✅ GP guides PUT authenticated user from JWT token:', user.id)
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
          console.log('✅ GP guides PUT authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guides PUT auth failed, trying without authentication')
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
    const validatedData = updateGPGuideSchema.parse(body)

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
      .from('gp_guides')
      .update(validatedData)
      .eq('id', params.id)
      .select(`
        *,
        gp_guide_tracks (
          id,
          track_id,
          race_number,
          race_type,
          track_condition,
          driver_1_id,
          driver_2_id,
          driver_1_boost_id,
          driver_2_boost_id,
          driver_1_strategy,
          driver_2_strategy,
          setup_notes,
          notes,
          tracks (
            id,
            name,
            alt_name,
            laps,
            driver_track_stat,
            car_track_stat
          )
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

    console.error('GP guides PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/gp-guides - Create new GP guide
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
            console.log('✅ GP guides POST authenticated user from JWT token:', user.id)
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
          console.log('✅ GP guides POST authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guides POST auth failed, trying without authentication')
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
    const validatedData = createGPGuideSchema.parse(body)

    // Use the RPC function to insert the GP guide (bypasses RLS issues)
    const { data: gpGuide, error } = await supabase
      .rpc('insert_gp_guide', {
        p_name: validatedData.name,
        p_gp_level: validatedData.gp_level,
        p_start_date: validatedData.start_date || null,
        p_boosted_assets: validatedData.boosted_assets || {},
        p_reward_bonus: validatedData.reward_bonus || {},
        p_user_id: user.id,
      })

    if (error) {
      console.error('GP guide insert error:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    if (!gpGuide || gpGuide.length === 0) {
      return NextResponse.json(
        { error: { code: 'INSERT_FAILED', message: 'Failed to create GP guide' } },
        { status: 500 }
      )
    }

    // Return the inserted data directly from RPC (bypass fetch issues)
    return NextResponse.json({ data: gpGuide[0] }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('GP guides POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/gp-guides/:id - Delete GP guide
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
            console.log('✅ GP guides DELETE authenticated user from JWT token:', user.id)
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
          console.log('✅ GP guides DELETE authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guides DELETE auth failed, trying without authentication')
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

    const { error } = await supabase
      .from('gp_guides')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'GP guide deleted successfully' })

  } catch (error) {
    console.error('GP guides DELETE error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}