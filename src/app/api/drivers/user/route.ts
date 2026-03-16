import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'
import { driversFiltersSchema } from '@/lib/validation'

// GET /api/drivers/user - Get user's drivers with ownership data
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
      const supabase = await createServerSupabaseClient()
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        )
      }
      user = cookieUser
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters = Object.fromEntries(searchParams.entries())
    const validatedFilters = driversFiltersSchema.parse(filters)

    // Get all drivers (ensure no duplicates by name/rarity)
    let driversQuery = supabaseAdmin
      .from('drivers')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .order('rarity', { ascending: false }) // Higher rarity first for duplicate removal

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
      .select('driver_id, level, card_count')
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
        level: driver.level,
        card_count: driver.card_count
      })
    })

    // Merge drivers with user ownership data
    const mergedData = (drivers || []).map(driver => {
      const userData = userDriversMap.get(driver.id) || { level: 0, card_count: 0 }

      return {
        ...driver,
        level: userData.level,
        card_count: userData.card_count,
        is_owned: userData.level > 0 || userData.card_count > 0
      }
    })

    // Attach collection info (theme, ordinal) for drivers that have a collection_id
    if (mergedData && mergedData.length > 0) {
      const collectionIds = Array.from(new Set(mergedData.map(d => d.collection_id).filter(Boolean)))
      if (collectionIds.length > 0) {
        const { data: collections } = await supabaseAdmin
          .from('collections')
          .select('*')
          .in('id', collectionIds)

        console.log('User drivers API: fetched collections count=', (collections || []).length, 'for ids=', collectionIds)

        const collectionMap = new Map((collections || []).map((c: any) => [c.id, c]))

        mergedData.forEach((d: any) => {
          if (d.collection_id) {
            const c = collectionMap.get(d.collection_id)
            d.collection_theme = c?.theme ?? null
            d.collection_ordinal = c?.ordinal ?? null
          } else {
            d.collection_theme = null
            d.collection_ordinal = null
          }
        })
      } else {
        mergedData.forEach((d: any) => {
          d.collection_theme = null
          d.collection_ordinal = null
        })
      }
    }

    // Apply owned_only filter if specified
    let filteredData = mergedData
    if (validatedFilters.owned_only) {
      filteredData = mergedData.filter((driver: typeof mergedData[0]) => driver.is_owned)
    }

    // Apply sorting
    const sortBy = validatedFilters.sort_by || 'name'
    const sortOrder = validatedFilters.sort_order || 'asc'

    filteredData.sort((a: typeof filteredData[0], b: typeof filteredData[0]) => {
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
