import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Inserts, Updates } from '@/types/database'

// Validation schemas
const createGPResultSchema = z.object({
  track_id: z.string().uuid(),
  race_number: z.number().optional().nullable(),
  race_type: z.string().optional().nullable(),
  result_notes: z.string().optional().nullable(),
})

const updateGPResultSchema = z.object({
  track_id: z.string().uuid().optional(),
  race_number: z.number().optional().nullable(),
  race_type: z.string().optional().nullable(),
  result_notes: z.string().optional().nullable(),
}).partial()

// GET /api/gp-guides/:id/results - Get all results for a specific GP guide
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
            console.log('✅ GP guide results GET authenticated user from JWT token:', user.id)
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
          console.log('✅ GP guide results GET authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guide results GET auth failed, trying without authentication')
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
      .from('gp_guide_results')
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
    console.error('GP guide results GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/gp-guides/:id/results - Add or update result for a track in GP guide
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
            console.log('✅ GP guide results POST authenticated user from JWT token:', user.id)
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
          console.log('✅ GP guide results POST authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guide results POST auth failed, trying without authentication')
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
    const validatedData = createGPResultSchema.parse(body)

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

    // Check if result already exists for this track in this GP guide
    const { data: existingResult } = await supabase
      .from('gp_guide_results')
      .select('id')
      .eq('gp_guide_id', params.id)
      .eq('track_id', validatedData.track_id)
      .single()

    let data, error

    if (existingResult) {
      // Update existing result
      const updateData: Updates<'gp_guide_results'> = {
        race_number: validatedData.race_number,
        race_type: validatedData.race_type,
        result_notes: validatedData.result_notes,
      }

      const result = await supabase
        .from('gp_guide_results')
        .update(updateData)
        .eq('id', existingResult.id)
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
      // Create new result
      const resultData: Inserts<'gp_guide_results'> = {
        gp_guide_id: params.id,
        track_id: validatedData.track_id,
        race_number: validatedData.race_number,
        race_type: validatedData.race_type,
        result_notes: validatedData.result_notes,
      }

      const result = await supabase
        .from('gp_guide_results')
        .insert(resultData)
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

    console.error('GP guide results POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/gp-guides/:id/results/:result_id - Update specific result in GP guide
export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string; result_id: string } }
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
            console.log('✅ GP guide results PUT authenticated user from JWT token:', user.id)
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
          console.log('✅ GP guide results PUT authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guide results PUT auth failed, trying without authentication')
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
    const validatedData = updateGPResultSchema.parse(body)

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

    // Check if result exists and belongs to this GP guide
    const { data: existingResult } = await supabase
      .from('gp_guide_results')
      .select('id, gp_guide_id')
      .eq('id', params.result_id)
      .single()

    if (!existingResult) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Result not found in GP guide' } },
        { status: 404 }
      )
    }

    if (existingResult.gp_guide_id !== params.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Result does not belong to this GP guide' } },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('gp_guide_results')
      .update(validatedData)
      .eq('id', params.result_id)
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

    console.error('GP guide results PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/gp-guides/:id/results/:result_id - Delete specific result from GP guide
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string; result_id: string } }
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
            console.log('✅ GP guide results DELETE authenticated user from JWT token:', user.id)
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
          console.log('✅ GP guide results DELETE authenticated user from cookies:', user.id)
        }
      } catch (error) {
        console.log('⚠️ GP guide results DELETE auth failed, trying without authentication')
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

    // Check if result exists and belongs to this GP guide
    const { data: existingResult } = await supabase
      .from('gp_guide_results')
      .select('id, gp_guide_id')
      .eq('id', params.result_id)
      .single()

    if (!existingResult) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Result not found in GP guide' } },
        { status: 404 }
      )
    }

    if (existingResult.gp_guide_id !== params.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Result does not belong to this GP guide' } },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('gp_guide_results')
      .delete()
      .eq('id', params.result_id)

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Result deleted successfully' })

  } catch (error) {
    console.error('GP guide results DELETE error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}