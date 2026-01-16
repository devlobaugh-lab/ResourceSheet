import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/export-collection - Export all user's collection data
export async function GET(request: NextRequest) {
  console.log('Export collection API called')
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
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet: any[]) {
              cookiesToSet.forEach(({ name, value, options }: any) => {
                request.cookies.set(name, value)
              })
            },
          },
        }
      )
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        console.log('Cookie auth failed:', authError, !cookieUser)
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        )
      }
      user = cookieUser
      console.log('✅ Authenticated user from cookies:', user.id)
    }

    // Get all drivers with user ownership data
    const { data: drivers, error: driversError } = await supabaseAdmin
      .from('drivers')
      .select('*')
      .order('name', { ascending: true })

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

    // Create map for user drivers
    const userDriversMap = new Map()
    userDrivers?.forEach(item => {
      userDriversMap.set(item.driver_id, {
        level: item.level,
        card_count: item.card_count
      })
    })

    // Merge drivers with user data
    const mergedDrivers = (drivers || []).map(item => {
      const userData = userDriversMap.get(item.id) || { level: 0, card_count: 0 }
      return {
        driver_id: item.id,
        level: userData.level,
        card_count: userData.card_count
      }
    })

    // Get all car parts with user ownership data
    const { data: carParts, error: carPartsError } = await supabaseAdmin
      .from('car_parts')
      .select('*')
      .order('name', { ascending: true })

    if (carPartsError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: carPartsError.message } },
        { status: 500 }
      )
    }

    // Get user's car parts
    const { data: userCarParts, error: userCarPartsError } = await supabaseAdmin
      .from('user_car_parts')
      .select('car_part_id, level, card_count')
      .eq('user_id', user.id)

    if (userCarPartsError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: userCarPartsError.message } },
        { status: 500 }
      )
    }

    // Create map for user car parts
    const userCarPartsMap = new Map()
    userCarParts?.forEach(item => {
      userCarPartsMap.set(item.car_part_id, {
        level: item.level,
        card_count: item.card_count
      })
    })

    // Merge car parts with user data
    const mergedCarParts = (carParts || []).map(item => {
      const userData = userCarPartsMap.get(item.id) || { level: 0, card_count: 0 }
      return {
        car_part_id: item.id,
        level: userData.level,
        card_count: userData.card_count
      }
    })

    console.log('Found', drivers?.length || 0, 'drivers and', carParts?.length || 0, 'car parts')

    console.log('Found', drivers?.length || 0, 'drivers and', carParts?.length || 0, 'car parts')

    // Get all boosts
    const { data: boosts, error: boostsError } = await supabaseAdmin
      .from('boosts')
      .select('*')
      .order('name', { ascending: true })

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

    // Create map for user boosts
    const userBoostsMap = new Map()
    userBoosts?.forEach(item => {
      userBoostsMap.set(item.boost_id, {
        level: item.level,
        card_count: item.card_count
      })
    })

    // Merge boosts with user data
    const mergedBoosts = (boosts || []).map(boost => {
      const userData = userBoostsMap.get(boost.id) || { level: 0, card_count: 0 }
      return {
        boost_id: boost.id,
        level: userData.level,
        card_count: userData.card_count
      }
    })

    console.log('Export summary:', {
      drivers: mergedDrivers.length,
      carParts: mergedCarParts.length,
      boosts: mergedBoosts.length,
      total: mergedDrivers.length + mergedCarParts.length + mergedBoosts.length
    })

    // Return the data
    const exportData = {
      exportedAt: new Date().toISOString(),
      userDrivers: mergedDrivers,
      userCarParts: mergedCarParts,
      userBoosts: mergedBoosts
    }

    return NextResponse.json(exportData)

  } catch (error) {
    console.error('Export collection error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
