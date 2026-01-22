import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'
import { createBoostSchema } from '@/lib/validation'

// GET /api/boosts - List boosts with optional filters (no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Try to get user for custom names, but don't require authentication
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
          }
        }
      } catch (error) {
        console.warn('JWT validation failed:', error)
      }
    }

    // If JWT didn't work, try cookie-based auth
    if (!user) {
      try {
        const supabase = createServerSupabaseClient()
        const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

        if (!authError && cookieUser) {
          user = cookieUser
          console.log('✅ Boosts API authenticated user from cookies:', user.id)
        }
      } catch (error) {
        // Authentication failed, but continue without custom names
        console.log('⚠️ Boosts API auth failed, continuing without custom names')
      }
    }

    const userId = user?.id

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

    // Fetch custom names (temporarily global until migration runs)
    let boostsWithCustomNames = boosts || []

    console.log('🔍 Boosts API fetching custom names (global mode)')
    const { data: customNames, error: customNamesError } = await supabaseAdmin
      .from('boost_custom_names')
      .select('boost_id, custom_name')

    if (customNamesError) {
      console.error('❌ Custom names fetch error:', customNamesError)
    } else if (customNames && customNames.length > 0) {
      console.log('✅ Found custom names:', customNames.length)

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

      console.log('📦 Merged custom names into boosts data')
    } else {
      console.log('⚠️ No custom names found in database')
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
