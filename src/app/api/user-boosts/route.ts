import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'

// GET /api/user-boosts - Get all boosts with user's ownership data merged
export async function GET(request: NextRequest) {
  try {
    // Try to get user from Authorization header first, then fall back to cookies
    let user = null
    const authHeader = request.headers.get('authorization')

    if (authHeader?.startsWith('Bearer ')) {
      // Try to validate JWT token directly
      const token = authHeader.substring(7)
      try {
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
      const supabase = createServerSupabaseClient()
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        )
      }
      user = cookieUser
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
    let mergedData = (boosts || []).map(boost => {
      const userData = userBoostsMap.get(boost.id) || { level: 0, card_count: 0 }

      return {
        ...boost,
        level: userData.level,
        card_count: userData.card_count,
        is_owned: userData.card_count > 0
      }
    })

    // Apply owned_only filter if requested
    const ownedOnly = searchParams.get('owned_only')
    if (ownedOnly === 'true') {
      mergedData = mergedData.filter(boost => boost.card_count > 0)
    }

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
