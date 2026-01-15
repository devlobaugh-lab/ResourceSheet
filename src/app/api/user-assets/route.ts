import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { userAssetsFiltersSchema } from '@/lib/validation'

// GET /api/user-assets - Get all catalog items with user's ownership data merged
export async function GET(request: NextRequest) {
  try {
    // Verify authentication using request cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              request.cookies.set(name, value)
            })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filters = Object.fromEntries(searchParams.entries())
    const validatedFilters = userAssetsFiltersSchema.parse(filters)
    
    // Build the query to get catalog items
    let catalogQuery = supabaseAdmin
      .from('catalog_items')
      .select('*')
      .order('name', { ascending: true })
    
    // Apply filters
    if (validatedFilters.season_id) {
      catalogQuery = catalogQuery.eq('season_id', validatedFilters.season_id)
    }
    
    if (validatedFilters.card_type !== undefined) {
      catalogQuery = catalogQuery.eq('card_type', validatedFilters.card_type)
    }
    
    if (validatedFilters.rarity !== undefined) {
      catalogQuery = catalogQuery.eq('rarity', validatedFilters.rarity)
    }
    
    if (validatedFilters.series !== undefined) {
      catalogQuery = catalogQuery.eq('series', validatedFilters.series)
    }
    
    if (validatedFilters.search) {
      catalogQuery = catalogQuery.ilike('name', `%${validatedFilters.search}%`)
    }
    
    const { data: catalogItems, error: catalogError } = await catalogQuery
    
    if (catalogError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: catalogError.message } },
        { status: 500 }
      )
    }
    
    // Get user's items
    const { data: userItems, error: userItemsError } = await supabaseAdmin
      .from('user_items')
      .select('catalog_item_id, level, card_count')
      .eq('user_id', user.id)
    
    if (userItemsError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: userItemsError.message } },
        { status: 500 }
      )
    }
    
    // Create a map for quick lookup of user items
    const userItemsMap = new Map()
    userItems?.forEach(item => {
      userItemsMap.set(item.catalog_item_id, {
        level: item.level,
        card_count: item.card_count
      })
    })
    
    // Merge catalog items with user ownership data
    const mergedData = (catalogItems || []).map(item => {
      const userData = userItemsMap.get(item.id) || { level: 0, card_count: 0 }
      
      return {
        ...item,
        level: userData.level,
        card_count: userData.card_count,
        is_owned: userData.level > 0 || userData.card_count > 0
      }
    })
    
    // Apply owned_only filter if specified
    let filteredData = mergedData
    if (validatedFilters.owned_only) {
      filteredData = mergedData.filter(item => item.is_owned)
    }
    
    // Apply sorting
    const sortBy = validatedFilters.sort_by || 'name'
    const sortOrder = validatedFilters.sort_order || 'asc'
    
    filteredData.sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = ''
      if (bValue === null || bValue === undefined) bValue = ''
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      // Handle numeric comparison
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })
    
    // Apply pagination
    const page = validatedFilters.page || 1
    const limit = validatedFilters.limit || 20
    const start = (page - 1) * limit
    const end = start + limit
    
    const paginatedData = filteredData.slice(start, end)
    
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
    
    console.error('User assets GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
