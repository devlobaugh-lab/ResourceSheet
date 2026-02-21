import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

// Schema for custom driver validation
const customDriverSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  overtaking: z.number().min(0).max(999).default(0),
  blocking: z.number().min(0).max(999).default(0),
  qualifying: z.number().min(0).max(999).default(0),
  tyre_use: z.number().min(0).max(999).default(0),
  race_start: z.number().min(0).max(999).default(0),
  car_parts: z.object({
    speed: z.number().default(0),
    cornering: z.number().default(0),
    powerUnit: z.number().default(0),
    qualifying: z.number().default(0),
    pitStopTime: z.number().default(0),
    drs: z.number().default(0)
  }).nullable().optional()
})

// Helper to get user from request
async function getUser(request: NextRequest) {
  // Try to get user from Authorization header first
  let user = null
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
          user = {
            id: payload.sub,
            email: payload.email,
          }
        }
      }
    } catch (error) {
      console.warn('JWT validation failed:', error)
    }
  }

  // Fall back to cookie-based auth
  if (!user) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

    if (!authError && cookieUser) {
      user = cookieUser
    }
  }

  return user
}

// GET /api/custom-drivers - Get user's custom drivers
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    // Get user's custom drivers
    const { data: drivers, error } = await supabaseAdmin
      .from('user_custom_drivers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching custom drivers:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch custom drivers' } },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: drivers || [],
      count: drivers?.length || 0
    })
    
  } catch (error) {
    console.error('Custom drivers API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/custom-drivers - Create a new custom driver
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = customDriverSchema.parse(body)
    
    // Create custom driver
    const { data: driver, error } = await supabaseAdmin
      .from('user_custom_drivers')
      .insert([{
        user_id: user.id,
        name: validatedData.name,
        overtaking: validatedData.overtaking,
        blocking: validatedData.blocking,
        qualifying: validatedData.qualifying,
        tyre_use: validatedData.tyre_use,
        race_start: validatedData.race_start,
        car_parts: validatedData.car_parts || null
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating custom driver:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to create custom driver' } },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: driver,
      message: 'Custom driver created successfully'
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Custom drivers API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/custom-drivers - Update a custom driver
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Driver ID is required' } },
        { status: 400 }
      )
    }
    
    const validatedData = customDriverSchema.partial().parse(updateData)
    
    // Update custom driver (RLS ensures user owns it)
    const { data: driver, error } = await supabaseAdmin
      .from('user_custom_drivers')
      .update(validatedData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating custom driver:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to update custom driver' } },
        { status: 500 }
      )
    }
    
    if (!driver) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Custom driver not found' } },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      data: driver,
      message: 'Custom driver updated successfully'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Custom drivers API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/custom-drivers - Delete a custom driver
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    // Get driver ID from URL params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Driver ID is required' } },
        { status: 400 }
      )
    }
    
    // Delete custom driver (RLS ensures user owns it)
    const { error } = await supabaseAdmin
      .from('user_custom_drivers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting custom driver:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to delete custom driver' } },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Custom driver deleted successfully'
    })
    
  } catch (error) {
    console.error('Custom drivers API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}