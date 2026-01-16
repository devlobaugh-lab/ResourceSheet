import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'

// GET /api/user-boosts - Get all boosts with user's ownership data merged
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

    const { searchParams } = new URL(request.url)

    // Build the query to get boosts
    let boostsQuery = supabaseAdmin
      .from('boosts')
      .select('*')
      .order('name', { ascending: true })

    // Apply filters
    const seasonId = searchParams.get('season_id')
    const rarity = searchParams.get('rarity')
    const series = searchParams.get('series')
    const search = searchParams.get('search')

    if (seasonId) {
      boostsQuery = boostsQuery.eq('season_id', seasonId)
    }

    if (rarity) {
      boostsQuery = boostsQuery.eq('rarity', parseInt(rarity))
    }

    if (series) {
      boostsQuery = boostsQuery.eq('series', parseInt(series))
    }

    if (search) {
      boostsQuery = boostsQuery.ilike('name', `%${search}%`)
    }

    const { data: boosts, error: boostsError } = await boostsQuery

    if (boostsError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: boostsError.message } },
        { status: 500 }
      )
    }

    // Get user's boosts
    const { data: userBoosts, error: userBoostsError } = await supabaseAdmin
      .from('user_boosts')
      .select('boost_id, level, card_count')
      .eq('user_id', user.id)

    if (userBoostsError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: userBoostsError.message } },
        { status: 500 }
      )
    }

    // Create a map for quick lookup of user boosts
    const userBoostsMap = new Map()
    userBoosts?.forEach(item => {
      userBoostsMap.set(item.boost_id, {
        level: item.level,
        card_count: item.card_count
      })
    })

    // Merge boosts with user ownership data
    const mergedData = (boosts || []).map(boost => {
      const userData = userBoostsMap.get(boost.id) || { level: 0, card_count: 0 }

      return {
        ...boost,
        level: userData.level,
        card_count: userData.card_count,
        is_owned: userData.card_count > 0
      }
    })

    // Apply pagination
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20
    const start = (page - 1) * limit
    const end = start + limit

    const paginatedData = mergedData.slice(start, end)

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: mergedData.length,
        totalPages: Math.ceil(mergedData.length / limit)
      }
    })

  } catch (error) {
    console.error('User boosts GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
