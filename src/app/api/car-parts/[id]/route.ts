import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'

const updateUserCarPartSchema = z.object({
  level: z.number().min(0).optional(),
  card_count: z.number().min(0).optional(),
})

// PUT /api/car-parts/[id] - Update user's car part data
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔧 Car part PUT API called for ID:', params.id)

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
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        )
      }
      user = cookieUser
    }

    const body = await request.json()
    const validatedData = updateUserCarPartSchema.parse(body)

    // Check if user already has this car part record
    const { data: existingRecord, error: checkError } = await supabaseAdmin
      .from('user_car_parts')
      .select('id')
      .eq('user_id', user.id)
      .eq('car_part_id', params.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: checkError.message } },
        { status: 500 }
      )
    }

    let result
    if (existingRecord) {
      // Update existing record
      const { data, error } = await supabaseAdmin
        .from('user_car_parts')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('car_part_id', params.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: error.message } },
          { status: 500 }
        )
      }
      result = data
    } else {
      // Create new record
      const { data, error } = await supabaseAdmin
        .from('user_car_parts')
        .insert({
          user_id: user.id,
          car_part_id: params.id,
          ...validatedData
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: error.message } },
          { status: 500 }
        )
      }
      result = data
    }

    return NextResponse.json({ data: result })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Car part PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
