import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { authProvider } from '@/lib/auth'
import { createUserItemSchema, updateUserItemSchema } from '@/lib/validation'

// GET /api/user-items - Get user's items
export async function GET(request: NextRequest) {
  console.log('📡 User items API called')

  // Debug: Check authorization header
  const authHeader = request.headers.get('authorization')
  console.log('📡 Auth header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'none')

  try {
    // Verify authentication using auth provider
    const { user, error: authError } = await authProvider.getUser(request)
    console.log('📡 Auth provider result:', { hasUser: !!user, userId: user?.id, error: authError?.message })

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20
    const start = (page - 1) * limit

    // Get user's items with catalog item details
    const { data, error, count } = await supabaseAdmin
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
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .range(start, start + limit - 1)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('User items GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/user-items - Create new user item
export async function POST(request: NextRequest) {
  console.log('📡 User items POST API called')

  try {
    // Verify authentication using auth provider
    const { user, error: authError } = await authProvider.getUser(request)
    console.log('📡 POST Auth provider result:', { hasUser: !!user, userId: user?.id, error: authError?.message })

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = createUserItemSchema.parse({
      ...body,
      user_id: user.id // Always use the authenticated user's ID
    })
    
    // Check if the catalog item exists
    const { data: catalogItem, error: catalogError } = await supabaseAdmin
      .from('catalog_items')
      .select('id')
      .eq('id', validatedData.catalog_item_id)
      .single()
    
    if (catalogError) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Catalog item not found' } },
        { status: 404 }
      )
    }
    
    // Check if user already owns this item
    const { data: existingItem } = await supabaseAdmin
      .from('user_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('catalog_item_id', validatedData.catalog_item_id)
      .single()
    
    if (existingItem) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'User already owns this item' } },
        { status: 409 }
      )
    }
    
    const { data, error } = await supabaseAdmin
      .from('user_items')
      .insert(validatedData)
      .select()
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
    
    console.error('User items POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
