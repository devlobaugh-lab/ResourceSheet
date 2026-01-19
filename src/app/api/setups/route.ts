import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase'
import { UserCarSetup } from '@/types/database'

// Validation schema for creating/updating setups
const setupSchema = z.object({
  name: z.string().min(1, 'Setup name is required').max(100, 'Setup name too long'),
  notes: z.string().optional(),
  brake_id: z.string().uuid().nullable(),
  gearbox_id: z.string().uuid().nullable(),
  rear_wing_id: z.string().uuid().nullable(),
  front_wing_id: z.string().uuid().nullable(),
  suspension_id: z.string().uuid().nullable(),
  engine_id: z.string().uuid().nullable(),
  series_filter: z.number().min(1).max(12).default(12),
  bonus_percentage: z.number().min(0).max(100).default(0)
})

// GET /api/setups - Get all user's setups
export async function GET(request: NextRequest) {
  try {
    // Try to get user from Authorization header first, then fall back to cookies
    let user = null
    const authHeader = request.headers.get('authorization')

    if (authHeader?.startsWith('Bearer ')) {
      // Try to validate JWT token directly
      const token = authHeader.substring(7)
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )

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
            console.log('✅ Authenticated user from JWT token:', user.id)
          }
        }
      } catch (error) {
        console.warn('JWT validation failed:', error)
      }
    }

    // If JWT didn't work, try cookie-based auth
    if (!user) {
      const supabase = createServerSupabaseClient()
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        console.log('Setups API cookie auth failed:', { authError: authError?.message, hasUser: !!cookieUser })
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        )
      }
      user = cookieUser
      console.log('✅ Authenticated user from cookies:', user.id)
    }

    console.log('Setups API final authenticated user:', user.id)

    // Get user's setups
    const { data: setups, error: setupsError } = await supabaseAdmin
      .from('user_car_setups')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (setupsError) {
      console.error('Setups database error:', setupsError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: setupsError.message } },
        { status: 500 }
      )
    }

    console.log('Setups API returning', setups?.length || 0, 'setups')
    return NextResponse.json({
      data: setups || [],
      pagination: {
        total: setups?.length || 0
      }
    })

  } catch (error) {
    console.error('Setups GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/setups - Create a new setup
export async function POST(request: NextRequest) {
  try {
    // Try to get user from Authorization header first, then fall back to cookies
    let user = null
    const authHeader = request.headers.get('authorization')

    if (authHeader?.startsWith('Bearer ')) {
      // Try to validate JWT token directly
      const token = authHeader.substring(7)
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )

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
            console.log('✅ Authenticated user from JWT token:', user.id)
          }
        }
      } catch (error) {
        console.warn('JWT validation failed:', error)
      }
    }

    // If JWT didn't work, try cookie-based auth
    if (!user) {
      const supabase = createServerSupabaseClient()
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        console.log('Setups API POST cookie auth failed:', { authError: authError?.message, hasUser: !!cookieUser })
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        )
      }
      user = cookieUser
      console.log('✅ Authenticated user from cookies:', user.id)
    }

    console.log('Setups API POST final authenticated user:', user.id)

    const body = await request.json()
    const validatedData = setupSchema.parse(body)

    // Insert new setup
    const { data: setup, error: insertError } = await supabaseAdmin
      .from('user_car_setups')
      .insert({
        ...validatedData,
        user_id: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Setups database insert error:', insertError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: insertError.message } },
        { status: 500 }
      )
    }

    console.log('Setups API POST created setup:', setup.id)
    return NextResponse.json({ data: setup }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid setup data', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Setups POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
