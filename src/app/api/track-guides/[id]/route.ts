import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { UserTrackGuide, Updates } from '@/types/database'

// Validation schemas
const updateTrackGuideSchema = z.object({
  track_id: z.string().uuid().optional(),
  gp_level: z.number().int().min(0).max(3).optional(),
  suggested_drivers: z.array(z.string().uuid()).max(4).optional(),
  free_boost_id: z.string().uuid().optional().nullable(),
  suggested_boosts: z.array(z.string().uuid()).optional(),
  saved_setup_id: z.string().uuid().optional().nullable(),
  setup_notes: z.string().optional().nullable(),
  dry_strategy: z.string().optional().nullable(),
  wet_strategy: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

// GET /api/track-guides/[id] - Get specific track guide
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
            console.log('✅ Track guide GET authenticated user from JWT token:', user.id)
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
          console.log('✅ Track guide GET authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ Track guide GET auth failed, trying without authentication')
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
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
      .eq('id', params.id)
      .eq('user_id', user.id) // Ensure user can only access their own guides
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Track guide not found' } },
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
    console.error('Track guide GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/track-guides/[id] - Update track guide
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
            console.log('✅ Track guide PUT authenticated user from JWT token:', user.id)
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
          console.log('✅ Track guide PUT authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ Track guide PUT auth failed, trying without authentication')
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

    const trackGuideData: Updates<'user_track_guides'> = {
      ...validatedData,
    }

    const { data, error } = await supabase
      .from('user_track_guides')
      .update(trackGuideData)
      .eq('id', params.id)
      .eq('user_id', user.id) // Ensure user can only update their own guides
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
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Track guide not found' } },
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

    console.error('Track guide PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/track-guides/[id] - Delete track guide
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
            console.log('✅ Track guide DELETE authenticated user from JWT token:', user.id)
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
          console.log('✅ Track guide DELETE authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ Track guide DELETE auth failed, trying without authentication')
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('user_track_guides')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id) // Ensure user can only delete their own guides

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Track guide deleted successfully' })

  } catch (error) {
    console.error('Track guide DELETE error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
