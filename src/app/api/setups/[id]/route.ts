import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'

// Validation schema for updating setups
const updateSetupSchema = z.object({
  name: z.string().min(1, 'Setup name is required').max(100, 'Setup name too long').optional(),
  brake_id: z.string().uuid().nullable().optional(),
  gearbox_id: z.string().uuid().nullable().optional(),
  rear_wing_id: z.string().uuid().nullable().optional(),
  front_wing_id: z.string().uuid().nullable().optional(),
  suspension_id: z.string().uuid().nullable().optional(),
  engine_id: z.string().uuid().nullable().optional(),
  series_filter: z.number().min(1).max(12).optional(),
  bonus_percentage: z.number().min(0).max(100).optional()
})

// GET /api/setups/[id] - Get a specific setup
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Get the specific setup
    const { data: setup, error: setupError } = await supabase
      .from('user_car_setups')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (setupError) {
      if (setupError.code === 'PGRST116') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Setup not found' } },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: setupError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: setup })

  } catch (error) {
    console.error('Setup GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/setups/[id] - Update a specific setup
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateSetupSchema.parse(body)

    // Update the setup
    const { data: setup, error: updateError } = await supabase
      .from('user_car_setups')
      .update(validatedData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Setup not found' } },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: updateError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: setup })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid setup data', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Setup PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/setups/[id] - Delete a specific setup
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Delete the setup
    const { error: deleteError } = await supabase
      .from('user_car_setups')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: deleteError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Setup deleted successfully' })

  } catch (error) {
    console.error('Setup DELETE error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
