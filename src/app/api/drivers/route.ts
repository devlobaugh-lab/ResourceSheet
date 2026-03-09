import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'
import { driversFiltersSchema } from '@/lib/validation'

// GET /api/drivers - Get all drivers with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters = Object.fromEntries(searchParams.entries())
    const validatedFilters = driversFiltersSchema.parse(filters)

    // Build the query to get drivers
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

    // Attach collection info (theme, ordinal) for drivers that have a collection_id
    if (drivers && drivers.length > 0) {
      const collectionIds = Array.from(new Set(drivers.map(d => d.collection_id).filter(Boolean)))
      if (collectionIds.length > 0) {
        const { data: collections } = await supabaseAdmin
          .from('collections')
          .select('*')
          .in('id', collectionIds)

        console.log('Drivers API: fetched collections count=', (collections || []).length, 'for ids=', collectionIds)

        const collectionMap = new Map((collections || []).map((c: any) => [c.id, c]))

        drivers.forEach((d: any) => {
          if (d.collection_id) {
            const c = collectionMap.get(d.collection_id)
            d.collection_theme = c?.theme ?? null
            d.collection_ordinal = c?.ordinal ?? null
          } else {
            d.collection_theme = null
            d.collection_ordinal = null
          }
          // Always include the driver's own collection_sub_name field
          d.collection_sub_name = d.collection_sub_name ?? null
        })
      } else {
        drivers.forEach((d: any) => {
          d.collection_theme = null
          d.collection_ordinal = null
          d.collection_sub_name = d.collection_sub_name ?? null
        })
      }
    }

    // Apply pagination
    const page = validatedFilters.page || 1
    const limit = validatedFilters.limit || 20
    const start = (page - 1) * limit
    const end = start + limit

    const paginatedData = drivers?.slice(start, end) || []

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: drivers?.length || 0,
        totalPages: drivers ? Math.ceil(drivers.length / limit) : 0
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Drivers GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
