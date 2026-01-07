import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { updateUserItemSchema } from '@/lib/validation'

interface Params {
  params: {
    id: string
  }
}

// GET /api/user-items/[id] - Get single user item
export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    const { id } = params
    
    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid ID format' } },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabaseAdmin
      .from('user_items')
      .select(`
        *,
        catalog_items (
          id,
          name,
          card_type,
          rarity,
          series,
          icon,
          cc_price,
          car_part_type,
          stats_per_level
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only access their own items
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'User item not found' } },
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
    console.error('User item GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/user-items/[id] - Update user item
export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    const { id } = params
    
    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid ID format' } },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateUserItemSchema.parse(body)
    
    // Ensure user can only update their own items
    const { data: existingItem } = await supabaseAdmin
      .from('user_items')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (!existingItem) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User item not found or access denied' } },
        { status: 404 }
      )
    }
    
    const { data, error } = await supabaseAdmin
      .from('user_items')
      .update(validatedData)
      .eq('id', id)
      .eq('user_id', user.id) // Double-check ownership
      .select()
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
    
    console.error('User item PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/user-items/[id] - Delete user item
export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    const { id } = params
    
    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid ID format' } },
        { status: 400 }
      )
    }
    
    // Ensure user can only delete their own items
    const { data: existingItem } = await supabaseAdmin
      .from('user_items')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (!existingItem) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User item not found or access denied' } },
        { status: 404 }
      )
    }
    
    const { error } = await supabaseAdmin
      .from('user_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Double-check ownership
    
    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'User item deleted successfully' },
      { status: 204 }
    )
    
  } catch (error) {
    console.error('User item DELETE error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
