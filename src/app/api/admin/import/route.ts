import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'

// POST /api/admin/import - Import admin backup (all user data + admin-managed system config)
export async function POST(request: NextRequest) {
  console.log('Admin import called')
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
          },
        },
      }
    )

    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profile?.is_admin !== true) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }

    const body = await request.json()
    const importData = body.data || body

    const results = {
      userDrivers: { imported: 0, updated: 0 },
      userCarParts: { imported: 0, updated: 0 },
      userBoosts: { imported: 0, updated: 0 },
      userTrackGuides: { imported: 0, updated: 0 },
      userTrackGuideDrivers: { imported: 0 },
      userGpGuides: { imported: 0 },
      userGpGuideTracks: { imported: 0, updated: 0 },
      userGpGuideResults: { imported: 0, updated: 0 },
      userCarSetups: { imported: 0, updated: 0 },
      seasons: { imported: 0, updated: 0 },
      trackNameAliases: { imported: 0, updated: 0 },
      boostCustomNames: { imported: 0, updated: 0 },
      boosts: { updated: 0 },
      errors: [] as string[]
    }

    // === USER DATA ===

    // user_drivers: upsert by (user_id, driver_id)
    if (importData.userDrivers?.length) {
      for (const item of importData.userDrivers) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_drivers').select('id')
            .eq('user_id', item.user_id).eq('driver_id', item.driver_id).single()
          if (existing) {
            await supabaseAdmin.from('user_drivers').update({ level: item.level, card_count: item.card_count }).eq('id', existing.id)
            results.userDrivers.updated++
          } else {
            await supabaseAdmin.from('user_drivers').insert(item)
            results.userDrivers.imported++
          }
        } catch (e) { results.errors.push(`user_drivers: ${String(e)}`) }
      }
    }

    // user_car_parts: upsert by (user_id, car_part_id)
    if (importData.userCarParts?.length) {
      for (const item of importData.userCarParts) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_car_parts').select('id')
            .eq('user_id', item.user_id).eq('car_part_id', item.car_part_id).single()
          if (existing) {
            await supabaseAdmin.from('user_car_parts').update({ level: item.level, card_count: item.card_count }).eq('id', existing.id)
            results.userCarParts.updated++
          } else {
            await supabaseAdmin.from('user_car_parts').insert(item)
            results.userCarParts.imported++
          }
        } catch (e) { results.errors.push(`user_car_parts: ${String(e)}`) }
      }
    }

    // user_boosts: upsert by (user_id, boost_id)
    if (importData.userBoosts?.length) {
      for (const item of importData.userBoosts) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_boosts').select('id')
            .eq('user_id', item.user_id).eq('boost_id', item.boost_id).single()
          if (existing) {
            await supabaseAdmin.from('user_boosts').update({ level: item.level, count: item.count }).eq('id', existing.id)
            results.userBoosts.updated++
          } else {
            await supabaseAdmin.from('user_boosts').insert(item)
            results.userBoosts.imported++
          }
        } catch (e) { results.errors.push(`user_boosts: ${String(e)}`) }
      }
    }

    // user_track_guides: upsert by (user_id, track_id, gp_level)
    if (importData.userTrackGuides?.length) {
      for (const item of importData.userTrackGuides) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_track_guides').select('id')
            .eq('user_id', item.user_id).eq('track_id', item.track_id).eq('gp_level', item.gp_level).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('user_track_guides').update(updateData).eq('id', existing.id)
            results.userTrackGuides.updated++
          } else {
            const { created_at, ...insertData } = item
            await supabaseAdmin.from('user_track_guides').insert(insertData)
            results.userTrackGuides.imported++
          }
        } catch (e) { results.errors.push(`user_track_guides: ${String(e)}`) }
      }
    }

    // user_track_guide_drivers: delete+insert grouped by track_guide_id
    if (importData.userTrackGuideDrivers?.length) {
      const byGuide = new Map<string, typeof importData.userTrackGuideDrivers>()
      for (const item of importData.userTrackGuideDrivers) {
        const guideId = item.track_guide_id
        if (!byGuide.has(guideId)) byGuide.set(guideId, [])
        byGuide.get(guideId)!.push(item)
      }
      for (const [guideId, items] of Array.from(byGuide.entries())) {
        try {
          await supabaseAdmin.from('user_track_guide_drivers').delete().eq('track_guide_id', guideId)
          const insertRows = items.map(({ id, ...rest }: Record<string, unknown>) => rest)
          await supabaseAdmin.from('user_track_guide_drivers').insert(insertRows)
          results.userTrackGuideDrivers.imported += items.length
        } catch (e) { results.errors.push(`user_track_guide_drivers (guide ${guideId}): ${String(e)}`) }
      }
    }

    // user_gp_guides: insert new only (preserve history)
    if (importData.userGpGuides?.length) {
      for (const item of importData.userGpGuides) {
        try {
          const { created_at, ...insertData } = item
          await supabaseAdmin.from('user_gp_guides').insert(insertData)
          results.userGpGuides.imported++
        } catch (e) { results.errors.push(`user_gp_guides: ${String(e)}`) }
      }
    }

    // user_gp_guide_tracks: upsert by (gp_guide_id, race_type, race_number)
    if (importData.userGpGuideTracks?.length) {
      for (const item of importData.userGpGuideTracks) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_gp_guide_tracks').select('id')
            .eq('gp_guide_id', item.gp_guide_id)
            .eq('race_type', item.race_type)
            .eq('race_number', item.race_number).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('user_gp_guide_tracks').update(updateData).eq('id', existing.id)
            results.userGpGuideTracks.updated++
          } else {
            const { id, ...insertData } = item
            await supabaseAdmin.from('user_gp_guide_tracks').insert(insertData)
            results.userGpGuideTracks.imported++
          }
        } catch (e) { results.errors.push(`user_gp_guide_tracks: ${String(e)}`) }
      }
    }

    // user_gp_guide_results: upsert by (gp_guide_id, track_id)
    if (importData.userGpGuideResults?.length) {
      for (const item of importData.userGpGuideResults) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_gp_guide_results').select('id')
            .eq('gp_guide_id', item.gp_guide_id)
            .eq('track_id', item.track_id).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('user_gp_guide_results').update(updateData).eq('id', existing.id)
            results.userGpGuideResults.updated++
          } else {
            const { id, ...insertData } = item
            await supabaseAdmin.from('user_gp_guide_results').insert(insertData)
            results.userGpGuideResults.imported++
          }
        } catch (e) { results.errors.push(`user_gp_guide_results: ${String(e)}`) }
      }
    }

    // user_car_setups: upsert by (user_id, name)
    if (importData.userCarSetups?.length) {
      for (const item of importData.userCarSetups) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_car_setups').select('id')
            .eq('user_id', item.user_id).eq('name', item.name).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('user_car_setups').update(updateData).eq('id', existing.id)
            results.userCarSetups.updated++
          } else {
            const { id, ...insertData } = item
            await supabaseAdmin.from('user_car_setups').insert(insertData)
            results.userCarSetups.imported++
          }
        } catch (e) { results.errors.push(`user_car_setups: ${String(e)}`) }
      }
    }

    // === ADMIN-MANAGED SYSTEM CONFIG ===

    // seasons: upsert by id
    if (importData.seasons?.length) {
      for (const item of importData.seasons) {
        try {
          const { data: existing } = await supabaseAdmin.from('seasons').select('id').eq('id', item.id).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('seasons').update(updateData).eq('id', item.id)
            results.seasons.updated++
          } else {
            await supabaseAdmin.from('seasons').insert(item)
            results.seasons.imported++
          }
        } catch (e) { results.errors.push(`seasons: ${String(e)}`) }
      }
    }

    // track_name_aliases: upsert by system_name (unique)
    if (importData.trackNameAliases?.length) {
      for (const item of importData.trackNameAliases) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('track_name_aliases').select('id').eq('system_name', item.system_name).single()
          if (existing) {
            await supabaseAdmin.from('track_name_aliases').update({ display_name: item.display_name }).eq('id', existing.id)
            results.trackNameAliases.updated++
          } else {
            const { id, ...insertData } = item
            await supabaseAdmin.from('track_name_aliases').insert(insertData)
            results.trackNameAliases.imported++
          }
        } catch (e) { results.errors.push(`track_name_aliases: ${String(e)}`) }
      }
    }

    // boost_custom_names: upsert by boost_id
    if (importData.boostCustomNames?.length) {
      for (const item of importData.boostCustomNames) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('boost_custom_names').select('id').eq('boost_id', item.boost_id).single()
          if (existing) {
            await supabaseAdmin.from('boost_custom_names').update({ custom_name: item.custom_name }).eq('id', existing.id)
            results.boostCustomNames.updated++
          } else {
            const { id, user_id, ...insertData } = item
            await supabaseAdmin.from('boost_custom_names').insert(insertData)
            results.boostCustomNames.imported++
          }
        } catch (e) { results.errors.push(`boost_custom_names: ${String(e)}`) }
      }
    }

    // boosts: update is_free only where boost already exists
    if (importData.boosts?.length) {
      for (const item of importData.boosts) {
        try {
          const { data: existing } = await supabaseAdmin.from('boosts').select('id').eq('id', item.id).single()
          if (existing) {
            await supabaseAdmin.from('boosts').update({ is_free: item.is_free }).eq('id', item.id)
            results.boosts.updated++
          }
        } catch (e) { results.errors.push(`boosts: ${String(e)}`) }
      }
    }

    console.log('Admin import complete')
    return NextResponse.json({ message: 'Admin backup imported successfully', results })

  } catch (error) {
    console.error('Admin import error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
