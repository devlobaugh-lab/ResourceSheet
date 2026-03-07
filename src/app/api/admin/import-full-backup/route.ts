import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'

// POST /api/admin/import-full-backup - Import ALL data for disaster recovery (admin only)
export async function POST(request: NextRequest) {
  console.log('📥 Admin import full backup called')
  try {
    // Use server-side Supabase client that handles cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
          },
        },
      }
    )
    
    // Get the current session from cookies
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    // Get the authenticated user (more secure than using session.user directly)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('User error:', userError)
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }

    const isAdmin = profile?.is_admin === true
    if (!isAdmin) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }

    const body = await request.json()
    const importData = body.data || body

    const results = {
      global: {
        seasons: { imported: 0, updated: 0 },
        drivers: { imported: 0, updated: 0 },
        carParts: { imported: 0, updated: 0 },
        boosts: { imported: 0, updated: 0 },
        tracks: { imported: 0, updated: 0 },
        boostCustomNames: { imported: 0, updated: 0 },
      },
      users: {
        userDrivers: { imported: 0, updated: 0 },
        userCarParts: { imported: 0, updated: 0 },
        userBoosts: { imported: 0, updated: 0 },
        userTrackGuides: { imported: 0, updated: 0 },
        userGpGuides: { imported: 0 },
        userCarSetups: { imported: 0, updated: 0 },
      },
      errors: [] as string[]
    }

    // === IMPORT GLOBAL DATA ===
    console.log('Importing global data...')

    // Seasons
    if (importData.seasons?.length) {
      for (const item of importData.seasons) {
        try {
          const { data: existing } = await supabaseAdmin.from('seasons').select('id').eq('id', item.id).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('seasons').update(updateData).eq('id', existing.id)
            results.global.seasons.updated++
          } else {
            await supabaseAdmin.from('seasons').insert(item)
            results.global.seasons.imported++
          }
        } catch (e) { results.errors.push(`season: ${String(e)}`) }
      }
    }

    // Drivers (upsert)
    if (importData.drivers?.length) {
      for (const item of importData.drivers) {
        try {
          const { data: existing } = await supabaseAdmin.from('drivers').select('id').eq('id', item.id).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('drivers').update(updateData).eq('id', existing.id)
            results.global.drivers.updated++
          } else {
            await supabaseAdmin.from('drivers').insert(item)
            results.global.drivers.imported++
          }
        } catch (e) { results.errors.push(`driver: ${String(e)}`) }
      }
    }

    // Car Parts (upsert)
    if (importData.carParts?.length) {
      for (const item of importData.carParts) {
        try {
          const { data: existing } = await supabaseAdmin.from('car_parts').select('id').eq('id', item.id).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('car_parts').update(updateData).eq('id', existing.id)
            results.global.carParts.updated++
          } else {
            await supabaseAdmin.from('car_parts').insert(item)
            results.global.carParts.imported++
          }
        } catch (e) { results.errors.push(`car_part: ${String(e)}`) }
      }
    }

    // Boosts (upsert)
    if (importData.boosts?.length) {
      for (const item of importData.boosts) {
        try {
          const { data: existing } = await supabaseAdmin.from('boosts').select('id').eq('id', item.id).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('boosts').update(updateData).eq('id', existing.id)
            results.global.boosts.updated++
          } else {
            await supabaseAdmin.from('boosts').insert(item)
            results.global.boosts.imported++
          }
        } catch (e) { results.errors.push(`boost: ${String(e)}`) }
      }
    }

    // Tracks (upsert)
    if (importData.tracks?.length) {
      for (const item of importData.tracks) {
        try {
          const { data: existing } = await supabaseAdmin.from('tracks').select('id').eq('id', item.id).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('tracks').update(updateData).eq('id', existing.id)
            results.global.tracks.updated++
          } else {
            await supabaseAdmin.from('tracks').insert(item)
            results.global.tracks.imported++
          }
        } catch (e) { results.errors.push(`track: ${String(e)}`) }
      }
    }

    // Boost custom names (upsert)
    if (importData.boostCustomNames?.length) {
      for (const item of importData.boostCustomNames) {
        try {
          const { data: existing } = await supabaseAdmin.from('boost_custom_names').select('id').eq('boost_id', item.boost_id).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('boost_custom_names').update(updateData).eq('id', existing.id)
            results.global.boostCustomNames.updated++
          } else {
            const { id, ...insertData } = item
            await supabaseAdmin.from('boost_custom_names').insert(insertData)
            results.global.boostCustomNames.imported++
          }
        } catch (e) { results.errors.push(`boost_custom_name: ${String(e)}`) }
      }
    }

    // === IMPORT USER DATA ===
    console.log('Importing user data...')

    // User drivers (upsert)
    if (importData.userDrivers?.length) {
      for (const item of importData.userDrivers) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_drivers').select('id')
            .eq('user_id', item.user_id).eq('driver_id', item.driver_id).single()
          if (existing) {
            await supabaseAdmin.from('user_drivers').update({ level: item.level, card_count: item.card_count }).eq('id', existing.id)
            results.users.userDrivers.updated++
          } else {
            await supabaseAdmin.from('user_drivers').insert(item)
            results.users.userDrivers.imported++
          }
        } catch (e) { results.errors.push(`user_driver: ${String(e)}`) }
      }
    }

    // User car parts (upsert)
    if (importData.userCarParts?.length) {
      for (const item of importData.userCarParts) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_car_parts').select('id')
            .eq('user_id', item.user_id).eq('car_part_id', item.car_part_id).single()
          if (existing) {
            await supabaseAdmin.from('user_car_parts').update({ level: item.level, card_count: item.card_count }).eq('id', existing.id)
            results.users.userCarParts.updated++
          } else {
            await supabaseAdmin.from('user_car_parts').insert(item)
            results.users.userCarParts.imported++
          }
        } catch (e) { results.errors.push(`user_car_part: ${String(e)}`) }
      }
    }

    // User boosts (upsert)
    if (importData.userBoosts?.length) {
      for (const item of importData.userBoosts) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_boosts').select('id')
            .eq('user_id', item.user_id).eq('boost_id', item.boost_id).single()
          if (existing) {
            await supabaseAdmin.from('user_boosts').update({ level: item.level, count: item.count }).eq('id', existing.id)
            results.users.userBoosts.updated++
          } else {
            await supabaseAdmin.from('user_boosts').insert(item)
            results.users.userBoosts.imported++
          }
        } catch (e) { results.errors.push(`user_boost: ${String(e)}`) }
      }
    }

    // User track guides (upsert)
    if (importData.userTrackGuides?.length) {
      for (const item of importData.userTrackGuides) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_track_guides').select('id')
            .eq('user_id', item.user_id).eq('track_id', item.track_id).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('user_track_guides').update(updateData).eq('id', existing.id)
            results.users.userTrackGuides.updated++
          } else {
            const { id, ...insertData } = item
            await supabaseAdmin.from('user_track_guides').insert(insertData)
            results.users.userTrackGuides.imported++
          }
        } catch (e) { results.errors.push(`user_track_guide: ${String(e)}`) }
      }
    }

    // User GP guides (insert new)
    if (importData.userGpGuides?.length) {
      for (const item of importData.userGpGuides) {
        try {
          const { id, ...insertData } = item
          await supabaseAdmin.from('user_gp_guides').insert(insertData)
          results.users.userGpGuides.imported++
        } catch (e) { results.errors.push(`user_gp_guide: ${String(e)}`) }
      }
    }

    // User car setups (upsert)
    if (importData.userCarSetups?.length) {
      for (const item of importData.userCarSetups) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_car_setups').select('id')
            .eq('user_id', item.user_id).eq('name', item.name).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('user_car_setups').update(updateData).eq('id', existing.id)
            results.users.userCarSetups.updated++
          } else {
            const { id, ...insertData } = item
            await supabaseAdmin.from('user_car_setups').insert(insertData)
            results.users.userCarSetups.imported++
          }
        } catch (e) { results.errors.push(`user_car_setup: ${String(e)}`) }
      }
    }

    console.log('📥 Full backup import complete')
    return NextResponse.json({ message: 'Full backup imported successfully', results })

  } catch (error) {
    console.error('Import full backup error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}