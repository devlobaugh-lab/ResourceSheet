import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase'
import { createCatalogItemSchema, catalogItemFiltersSchema } from '@/lib/validation'

// GET /api/catalog-items - List catalog items with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filters = Object.fromEntries(searchParams.entries())
    const validatedFilters = catalogItemFiltersSchema.parse(filters)
    
    const { data, error, count } = await supabaseAdmin
      .from('catalog_items')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
    
    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }
    
    // Apply filters manually (since Supabase doesn't support complex OR queries easily)
    let filteredData = data || []
    
    if (validatedFilters.season_id) {
      filteredData = filteredData.filter(item => item.season_id === validatedFilters.season_id)
    }
    
    if (validatedFilters.card_type !== undefined) {
      filteredData = filteredData.filter(item => item.card_type === validatedFilters.card_type)
    }
    
    if (validatedFilters.rarity !== undefined) {
      filteredData = filteredData.filter(item => item.rarity === validatedFilters.rarity)
    }
    
    if (validatedFilters.series !== undefined) {
      filteredData = filteredData.filter(item => item.series === validatedFilters.series)
    }
    
    if (validatedFilters.search) {
      const searchLower = validatedFilters.search.toLowerCase()
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(searchLower)
      )
    }
    
    // Apply pagination
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20
    const start = (page - 1) * limit
    const end = start + limit - 1
    
    const paginatedData = filteredData.slice(start, end + 1)
    
    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit)
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Catalog items GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/catalog-items - Create new catalog item (admin only)
export async function POST(request: NextRequest) {
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
    
    // Check admin status
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = createCatalogItemSchema.parse(body)
    
    const { data, error } = await supabaseAdmin
      .from('catalog_items')
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
    
    console.error('Catalog items POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
