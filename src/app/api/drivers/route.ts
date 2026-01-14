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
