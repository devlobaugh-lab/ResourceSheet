import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/admin/import-all-users - Import ALL user data (admin only, merge strategy)
export async function POST(request: NextRequest) {
  console.log('📥 Admin import all users called')
  try {
    // Verify admin
    const authHeader = request.headers.get('authorization')
    let userId = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
          )
          if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
            userId = payload.sub
          }
        }
      } catch (e) {
        console.warn('JWT parse failed')
      }
    }

    if (!userId) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_type, is_admin')
      .eq('id', userId)
      .single()

    const isAdmin = profile?.user_type === 'admin' || profile?.is_admin === true
    if (!isAdmin) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }

    const body = await request.json()
    const importData = body.data || body

    const results = {
      imported: { userDrivers: 0, userCarParts: 0, userBoosts: 0, userTrackGuides: 0, userGpGuides: 0, userCarSetups: 0 },
      updated: { userDrivers: 0, userCarParts: 0, userBoosts: 0, userTrackGuides: 0, userGpGuides: 0, userCarSetups: 0 },
      errors: [] as string[]
    }

    // Import user_drivers (upsert by user_id + driver_id)
    if (importData.userDrivers?.length) {
      for (const item of importData.userDrivers) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_drivers')
            .select('id')
            .eq('user_id', item.user_id)
            .eq('driver_id', item.driver_id)
            .single()

          if (existing) {
            await supabaseAdmin.from('user_drivers').update({ level: item.level, card_count: item.card_count }).eq('id', existing.id)
            results.updated.userDrivers++
          } else {
            await supabaseAdmin.from('user_drivers').insert(item)
            results.imported.userDrivers++
          }
        } catch (e) { results.errors.push(`user_drivers: ${String(e)}`) }
      }
    }

    // Import user_car_parts
    if (importData.userCarParts?.length) {
      for (const item of importData.userCarParts) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_car_parts')
            .select('id')
            .eq('user_id', item.user_id)
            .eq('car_part_id', item.car_part_id)
            .single()

          if (existing) {
            await supabaseAdmin.from('user_car_parts').update({ level: item.level, card_count: item.card_count }).eq('id', existing.id)
            results.updated.userCarParts++
          } else {
            await supabaseAdmin.from('user_car_parts').insert(item)
            results.imported.userCarParts++
          }
        } catch (e) { results.errors.push(`user_car_parts: ${String(e)}`) }
      }
    }

    // Import user_boosts
    if (importData.userBoosts?.length) {
      for (const item of importData.userBoosts) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_boosts')
            .select('id')
            .eq('user_id', item.user_id)
            .eq('boost_id', item.boost_id)
            .single()

          if (existing) {
            await supabaseAdmin.from('user_boosts').update({ level: item.level, count: item.count }).eq('id', existing.id)
            results.updated.userBoosts++
          } else {
            await supabaseAdmin.from('user_boosts').insert(item)
            results.imported.userBoosts++
          }
        } catch (e) { results.errors.push(`user_boosts: ${String(e)}`) }
      }
    }

    // Import user_track_guides (upsert by user_id + track_id)
    if (importData.userTrackGuides?.length) {
      for (const item of importData.userTrackGuides) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_track_guides')
            .select('id')
            .eq('user_id', item.user_id)
            .eq('track_id', item.track_id)
            .single()

          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('user_track_guides').update(updateData).eq('id', existing.id)
            results.updated.userTrackGuides++
          } else {
            const { id, ...insertData } = item
            await supabaseAdmin.from('user_track_guides').insert(insertData)
            results.imported.userTrackGuides++
          }
        } catch (e) { results.errors.push(`user_track_guides: ${String(e)}`) }
      }
    }

    // Import user_gp_guides (insert new, don't update existing to preserve history)
    if (importData.userGpGuides?.length) {
      for (const item of importData.userGpGuides) {
        try {
          const { id, ...insertData } = item
          await supabaseAdmin.from('user_gp_guides').insert(insertData)
          results.imported.userGpGuides++
        } catch (e) { results.errors.push(`user_gp_guides: ${String(e)}`) }
      }
    }

    // Import user_car_setups (upsert by user_id + name)
    if (importData.userCarSetups?.length) {
      for (const item of importData.userCarSetups) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_car_setups')
            .select('id')
            .eq('user_id', item.user_id)
            .eq('name', item.name)
            .single()

          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('user_car_setups').update(updateData).eq('id', existing.id)
            results.updated.userCarSetups++
          } else {
            const { id, ...insertData } = item
            await supabaseAdmin.from('user_car_setups').insert(insertData)
            results.imported.userCarSetups++
          }
        } catch (e) { results.errors.push(`user_car_setups: ${String(e)}`) }
      }
    }

    console.log('📥 Import all users complete')
    return NextResponse.json({ message: 'All user data imported successfully', results })

  } catch (error) {
    console.error('Import all users error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}