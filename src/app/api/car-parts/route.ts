import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'
import { carPartsFiltersSchema } from '@/lib/validation'

// GET /api/car-parts - Get all car parts with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters = Object.fromEntries(searchParams.entries())
    const validatedFilters = carPartsFiltersSchema.parse(filters)

    // Build the query to get car parts
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

    // Attach collection_theme via collections JOIN (same pattern as /api/drivers)
    const collectionIds = Array.from(new Set((carParts || []).map((p: any) => p.collection_id).filter(Boolean)))
    if (collectionIds.length > 0) {
      const { data: collections } = await supabaseAdmin
        .from('collections')
        .select('id, theme, ordinal')
        .in('id', collectionIds)
      const collectionMap = new Map((collections || []).map((c: any) => [c.id, c]))
      ;(carParts || []).forEach((p: any) => {
        p.collection_theme = p.collection_id ? (collectionMap.get(p.collection_id)?.theme ?? null) : null
      })
    } else {
      ;(carParts || []).forEach((p: any) => { p.collection_theme = null })
    }

    // Apply pagination
    const page = validatedFilters.page || 1
    const limit = validatedFilters.limit || 20
    const start = (page - 1) * limit
    const end = start + limit

    const paginatedData = carParts?.slice(start, end) || []

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: carParts?.length || 0,
        totalPages: carParts ? Math.ceil(carParts.length / limit) : 0
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

    console.error('Car parts GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
