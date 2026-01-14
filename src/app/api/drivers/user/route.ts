import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'
import { driversFiltersSchema } from '@/lib/validation'

// GET /api/drivers/user - Get user's drivers with ownership data
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
    const validatedFilters = driversFiltersSchema.parse(filters)

    // Get all drivers
    let driversQuery = supabaseAdmin
      .from('drivers')
      .select('*')
      .order('name', { ascending: true })

    // Apply filters
    if (validatedFilters.season_id) {
      driversQuery = driversQuery.eq('season_id', validatedFilters.season_id)
    }

    if (validatedFilters.rarity !== undefined) {
      driversQuery = driversQuery.eq('rarity', validatedFilters.rarity)
    }

    if (validatedFilters.series !== undefined) {
      driversQuery = driversQuery.eq('series', validatedFilters.series)
    }

    if (validatedFilters.search) {
      driversQuery = driversQuery.ilike('name', `%${validatedFilters.search}%`)
    }

    const { data: drivers, error: driversError } = await driversQuery

    if (driversError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: driversError.message } },
        { status: 500 }
      )
    }

    // Get user's drivers
    const { data: userDrivers, error: userDriversError } = await supabaseAdmin
      .from('user_drivers')
      .select('driver_id, level')
      .eq('user_id', user.id)

    if (userDriversError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: userDriversError.message } },
        { status: 500 }
      )
    }

    // Create a map for quick lookup of user drivers
    const userDriversMap = new Map()
    userDrivers?.forEach(driver => {
      userDriversMap.set(driver.driver_id, {
        level: driver.level
      })
    })

    // Merge drivers with user ownership data
    const mergedData = (drivers || []).map(driver => {
      const userData = userDriversMap.get(driver.id) || { level: 0 }

      return {
        ...driver,
        level: userData.level,
        is_owned: userData.level > 0
      }
    })

    // Apply owned_only filter if specified
    let filteredData = mergedData
    if (validatedFilters.owned_only) {
      filteredData = mergedData.filter(driver => driver.is_owned)
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

    console.error('User drivers GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
