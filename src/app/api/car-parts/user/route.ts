import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'
import { carPartsFiltersSchema } from '@/lib/validation'

// GET /api/car-parts/user - Get user's car parts with ownership data
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters = Object.fromEntries(searchParams.entries())
    const validatedFilters = carPartsFiltersSchema.parse(filters)

    // Get all car parts
    let carPartsQuery = supabaseAdmin
      .from('car_parts')
      .select('*')
      .order('name', { ascending: true })

    // Apply filters
    if (validatedFilters.season_id) {
      carPartsQuery = carPartsQuery.eq('season_id', validatedFilters.season_id)
    }

    if (validatedFilters.rarity !== undefined) {
      carPartsQuery = carPartsQuery.eq('rarity', validatedFilters.rarity)
    }

    if (validatedFilters.series !== undefined) {
      carPartsQuery = carPartsQuery.eq('series', validatedFilters.series)
    }

    if (validatedFilters.car_part_type !== undefined) {
      carPartsQuery = carPartsQuery.eq('car_part_type', validatedFilters.car_part_type)
    }

    if (validatedFilters.search) {
      carPartsQuery = carPartsQuery.ilike('name', `%${validatedFilters.search}%`)
    }

    const { data: carParts, error: carPartsError } = await carPartsQuery

    if (carPartsError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: carPartsError.message } },
        { status: 500 }
      )
    }

    // Get user's car parts
    const { data: userCarParts, error: userCarPartsError } = await supabaseAdmin
      .from('user_car_parts')
      .select('car_part_id, level')
      .eq('user_id', user.id)

    if (userCarPartsError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: userCarPartsError.message } },
        { status: 500 }
      )
    }

    // Create a map for quick lookup of user car parts
    const userCarPartsMap = new Map()
    userCarParts?.forEach(carPart => {
      userCarPartsMap.set(carPart.car_part_id, {
        level: carPart.level
      })
    })

    // Merge car parts with user ownership data
    const mergedData = (carParts || []).map(carPart => {
      const userData = userCarPartsMap.get(carPart.id) || { level: 0 }

      return {
        ...carPart,
        level: userData.level,
        is_owned: userData.level > 0
      }
    })

    // Apply owned_only filter if specified
    let filteredData = mergedData
    if (validatedFilters.owned_only) {
      filteredData = mergedData.filter(carPart => carPart.is_owned)
    }

    // Apply sorting
    const sortBy = validatedFilters.sort_by || 'name'
    const sortOrder = validatedFilters.sort_order || 'asc'

    filteredData.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'rarity':
          comparison = a.rarity - b.rarity
          break
        case 'series':
          comparison = (a.series || 0) - (b.series || 0)
          break
        case 'level':
          comparison = a.level - b.level
          break
        case 'car_part_type':
          comparison = a.car_part_type - b.car_part_type
          break
        default:
          comparison = 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
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

    console.error('User car parts GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
