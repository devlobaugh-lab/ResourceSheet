import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'
import { createBoostSchema } from '@/lib/validation'

// GET /api/boosts - List boosts with optional filters (no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Try to get user for custom names, but don't require authentication
    let userId = null
    try {
      const supabase = createServerSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      userId = session?.user?.id

      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id
      }
    } catch (error) {
      // Ignore auth errors - custom names are optional
    }

    // Build query for boosts
    let query = supabaseAdmin
      .from('boosts')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })

    // Apply filters
    const seasonId = searchParams.get('season_id')
    const rarity = searchParams.get('rarity')
    const series = searchParams.get('series')
    const search = searchParams.get('search')

    if (seasonId) {
      query = query.eq('season_id', seasonId)
    }

    if (rarity) {
      query = query.eq('rarity', parseInt(rarity))
    }

    if (series) {
      query = query.eq('series', parseInt(series))
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: boosts, error: boostsError, count } = await query

    if (boostsError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: boostsError.message } },
        { status: 500 }
      )
    }

    // If user is authenticated, fetch their custom names separately
    let boostsWithCustomNames = boosts || []
    if (userId) {
      const { data: customNames, error: customNamesError } = await supabaseAdmin
        .from('boost_custom_names')
        .select('boost_id, custom_name')
        .eq('user_id', userId)

      if (!customNamesError && customNames) {
        // Create a map for quick lookup
        const customNamesMap = new Map<string, string>()
        customNames.forEach(cn => {
          customNamesMap.set(cn.boost_id, cn.custom_name)
        })

        // Merge custom names with boost data
        boostsWithCustomNames = boosts.map(boost => ({
          ...boost,
          boost_custom_names: {
            custom_name: customNamesMap.get(boost.id) || null
          }
        }))
      }
    }

    // Apply pagination
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20
    const start = (page - 1) * limit
    const end = start + limit

    const paginatedData = boostsWithCustomNames.slice(start, end)

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Boosts GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/boosts - Create new boost (admin only)
export async function POST(request: NextRequest) {
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
    const validatedData = createBoostSchema.parse(body)

    const { data, error } = await supabaseAdmin
      .from('boosts')
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

    console.error('Boosts POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
