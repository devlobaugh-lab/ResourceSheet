import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/export-collection-stable - Export collection data using stable identifiers
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
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        )
      }
      user = cookieUser
    }

    console.log('Exporting stable collection data for user:', user.id)

    // Get user's drivers with stable identifiers
    const { data: userDrivers, error: driversError } = await supabaseAdmin
      .from('user_drivers')
      .select(`
        level,
        card_count,
        drivers:driver_id (
          name,
          series,
          ordinal,
          rarity
        )
      `)
      .eq('user_id', user.id)
      .or('level.gt.0,card_count.gt.0') // Export items the user owns (leveled up or has cards)

    if (driversError) {
      console.error('Error fetching user drivers:', driversError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch user drivers' } },
        { status: 500 }
      )
    }

    // Get user's car parts with stable identifiers
    const { data: userCarParts, error: carPartsError } = await supabaseAdmin
      .from('user_car_parts')
      .select(`
        level,
        card_count,
        car_parts:car_part_id (
          name,
          car_part_type,
          series,
          rarity
        )
      `)
      .eq('user_id', user.id)
      .or('level.gt.0,card_count.gt.0') // Export items the user owns (leveled up or has cards)

    if (carPartsError) {
      console.error('Error fetching user car parts:', carPartsError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch user car parts' } },
        { status: 500 }
      )
    }

    // Get user's boosts with stable identifiers
    const { data: userBoosts, error: boostsError } = await supabaseAdmin
      .from('user_boosts')
      .select(`
        level,
        count,
        boosts:boost_id (
          name,
          icon
        )
      `)
      .eq('user_id', user.id)
      .gt('count', 0) // Only export items the user actually owns (boosts don't have level, only count)

    if (boostsError) {
      console.error('Error fetching user boosts:', boostsError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch user boosts' } },
        { status: 500 }
      )
    }

    // Transform data to use stable identifiers instead of UUIDs
    const stableExportData = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
      version: '2.0', // Version to distinguish from UUID-based exports
      format: 'stable-identifiers', // Identifier for this format
      drivers: (userDrivers || []).map((item: any) => {
        const driverData: any = {
          // Stable identifiers for drivers
          name: item.drivers?.name,
          series: item.drivers?.series,
          // User data
          level: item.level,
          card_count: item.card_count
        };

        // Only include ordinal if it exists and is not null
        if (item.drivers?.ordinal != null) {
          driverData.ordinal = item.drivers.ordinal;
        }

        // Only include rarity if it exists
        if (item.drivers?.rarity != null) {
          driverData.rarity = item.drivers.rarity;
        }

        return driverData;
      }),
      carParts: (userCarParts || []).map((item: any) => {
        const partData: any = {
          // Stable identifiers for car parts
          name: item.car_parts?.name,
          car_part_type: item.car_parts?.car_part_type,
          series: item.car_parts?.series,
          // User data
          level: item.level,
          card_count: item.card_count
        };

        // Only include rarity if it exists
        if (item.car_parts?.rarity != null) {
          partData.rarity = item.car_parts.rarity;
        }

        return partData;
      }),
      boosts: (userBoosts || []).map((item: any) => ({
        // Simplified backup format - only essential data for identification
        name: item.boosts?.name,
        icon: item.boosts?.icon,
        count: item.count
      }))
    }

    console.log('Stable export data:', {
      driversCount: stableExportData.drivers.length,
      carPartsCount: stableExportData.carParts.length,
      boostsCount: stableExportData.boosts.length
    })

    // Return as JSON file download
    const filename = `f1-stable-backup-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(JSON.stringify(stableExportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Stable export error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
