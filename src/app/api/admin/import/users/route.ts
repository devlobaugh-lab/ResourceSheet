import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'

// POST /api/admin/import/users - Import all users' personal data
export async function POST(request: NextRequest) {
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
    const usersArray = body.users as Array<{
      userId: string
      email?: string | null
      username?: string
      active_season_id?: string | null
      data: Record<string, unknown[]>
    }>

    if (!Array.isArray(usersArray)) {
      return NextResponse.json({ error: { code: 'INVALID_FORMAT', message: 'Expected a users array' } }, { status: 400 })
    }

    const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers()
    const emailToCurrentId = new Map(
      (authUsersData?.users ?? []).map(u => [u.email, u.id])
    )

    const totals = {
      usersProcessed: 0,
      errors: [] as string[]
    }

    for (const userEntry of usersArray) {
      const backedUpUserId = userEntry.userId
      const email = userEntry.email
      const userId = (email && emailToCurrentId.get(email)) ?? null

      if (!userId) {
        totals.errors.push(`user ${backedUpUserId}: could not resolve current user ID (email not found)`)
        continue
      }

      const importData = userEntry.data || {}

      // Update profile metadata (username, active_season_id only — never touch is_admin/is_active)
      try {
        const profileUpdate: Record<string, unknown> = {}
        if (userEntry.username !== undefined) profileUpdate.username = userEntry.username
        if (userEntry.active_season_id !== undefined) profileUpdate.active_season_id = userEntry.active_season_id
        if (Object.keys(profileUpdate).length > 0) {
          await supabaseAdmin.from('profiles').update(profileUpdate).eq('id', userId)
        }
      } catch (e) {
        totals.errors.push(`profile ${userId}: ${String(e)}`)
      }

      // user_drivers: upsert by (user_id, driver_id)
      if (importData.userDrivers?.length) {
        for (const item of importData.userDrivers as Record<string, unknown>[]) {
          try {
            const { data: existing } = await supabaseAdmin
              .from('user_drivers').select('id')
              .eq('user_id', userId).eq('driver_id', item.driver_id as string).single()
            if (existing) {
              await supabaseAdmin.from('user_drivers').update({ level: item.level, card_count: item.card_count }).eq('id', existing.id)
            } else {
              await supabaseAdmin.from('user_drivers').insert({ ...item, user_id: userId })
            }
          } catch (e) { totals.errors.push(`user_drivers (${userId}): ${String(e)}`) }
        }
      }

      // user_car_parts: upsert by (user_id, car_part_id)
      if (importData.userCarParts?.length) {
        for (const item of importData.userCarParts as Record<string, unknown>[]) {
          try {
            const { data: existing } = await supabaseAdmin
              .from('user_car_parts').select('id')
              .eq('user_id', userId).eq('car_part_id', item.car_part_id as string).single()
            if (existing) {
              await supabaseAdmin.from('user_car_parts').update({ level: item.level, card_count: item.card_count }).eq('id', existing.id)
            } else {
              await supabaseAdmin.from('user_car_parts').insert({ ...item, user_id: userId })
            }
          } catch (e) { totals.errors.push(`user_car_parts (${userId}): ${String(e)}`) }
        }
      }

      // user_boosts: upsert by (user_id, boost_id)
      if (importData.userBoosts?.length) {
        for (const item of importData.userBoosts as Record<string, unknown>[]) {
          try {
            const { data: existing } = await supabaseAdmin
              .from('user_boosts').select('id')
              .eq('user_id', userId).eq('boost_id', item.boost_id as string).single()
            if (existing) {
              await supabaseAdmin.from('user_boosts').update({ level: item.level, count: item.count }).eq('id', existing.id)
            } else {
              await supabaseAdmin.from('user_boosts').insert({ ...item, user_id: userId })
            }
          } catch (e) { totals.errors.push(`user_boosts (${userId}): ${String(e)}`) }
        }
      }

      // user_car_setups: upsert by (user_id, name)
      const setupIdMap = new Map<string, string>() // old backup UUID → current DB UUID
      if (importData.userCarSetups?.length) {
        for (const item of importData.userCarSetups as Record<string, unknown>[]) {
          try {
            const oldId = item.id as string
            const { data: existing } = await supabaseAdmin
              .from('user_car_setups').select('id')
              .eq('user_id', userId).eq('name', item.name as string).single()
            if (existing) {
              setupIdMap.set(oldId, existing.id)
              const { id, created_at, ...updateData } = item
              await supabaseAdmin.from('user_car_setups').update(updateData).eq('id', existing.id)
            } else {
              const { id, ...insertData } = item
              const { data: newSetup } = await supabaseAdmin
                .from('user_car_setups').insert({ ...insertData, user_id: userId }).select('id').single()
              if (newSetup) setupIdMap.set(oldId, newSetup.id)
            }
          } catch (e) { totals.errors.push(`user_car_setups (${userId}): ${String(e)}`) }
        }
      }

      // user_track_guides: upsert by (user_id, track_id, season_id, gp_level)
      if (importData.userTrackGuides?.length) {
        // Pre-fetch tracks for cross-environment ID resolution via _track_name
        const { data: tgEnvTracks } = await supabaseAdmin.from('tracks').select('id, name')
        const tgEnvTrackIds = new Set(tgEnvTracks?.map(t => t.id) ?? [])
        const tgEnvTrackNameToId = new Map(tgEnvTracks?.map(t => [t.name, t.id]) ?? [])

        const resolveTrackGuideTrackId = (trackId: string, trackName?: string | null): string | null => {
          if (tgEnvTrackIds.has(trackId)) return trackId
          if (trackName) return tgEnvTrackNameToId.get(trackName) ?? null
          return null
        }

        // Pre-fetch track→season mapping to backfill missing season_ids
        const { data: trackSeasons } = await supabaseAdmin
          .from('track_seasons')
          .select('track_id, season_id')
          .eq('is_active', true)
        const trackSeasonMap = new Map(trackSeasons?.map(ts => [ts.track_id, ts.season_id]) ?? [])

        for (const item of importData.userTrackGuides as Record<string, unknown>[]) {
          try {
            const resolvedTrackId = resolveTrackGuideTrackId(item.track_id as string, item._track_name as string | null)
            if (!resolvedTrackId) {
              totals.errors.push(`user_track_guides (${userId}): track not found (id=${item.track_id}, name=${item._track_name ?? 'unknown'}), skipping`)
              continue
            }

            const remappedSavedSetupId = item.saved_setup_id
              ? (setupIdMap.get(item.saved_setup_id as string) ?? null)
              : null
            const resolvedSeasonId = (item.season_id as string | null)
              ?? trackSeasonMap.get(resolvedTrackId)
              ?? null

            let existingQuery = supabaseAdmin
              .from('user_track_guides').select('id')
              .eq('user_id', userId).eq('track_id', resolvedTrackId).eq('gp_level', item.gp_level as string)
            if (resolvedSeasonId) {
              existingQuery = existingQuery.eq('season_id', resolvedSeasonId)
            } else {
              existingQuery = existingQuery.is('season_id', null)
            }
            const { data: existing } = await existingQuery.single()

            if (existing) {
              const { id, created_at, user_id: _oldUserId, _track_name, ...updateData } = item
              await supabaseAdmin.from('user_track_guides').update({ ...updateData, track_id: resolvedTrackId, user_id: userId, season_id: resolvedSeasonId, saved_setup_id: remappedSavedSetupId }).eq('id', existing.id)
            } else {
              const { created_at, _track_name, ...insertData } = item
              await supabaseAdmin.from('user_track_guides').insert({ ...insertData, track_id: resolvedTrackId, user_id: userId, season_id: resolvedSeasonId, saved_setup_id: remappedSavedSetupId })
            }
          } catch (e) { totals.errors.push(`user_track_guides (${userId}): ${String(e)}`) }
        }
      }

      // user_track_guide_drivers: delete+insert grouped by track_guide_id
      if (importData.userTrackGuideDrivers?.length) {
        const byGuide = new Map<string, Record<string, unknown>[]>()
        for (const item of importData.userTrackGuideDrivers as Record<string, unknown>[]) {
          const guideId = item.track_guide_id as string
          if (!byGuide.has(guideId)) byGuide.set(guideId, [])
          byGuide.get(guideId)!.push(item)
        }
        for (const [guideId, items] of Array.from(byGuide.entries())) {
          try {
            await supabaseAdmin.from('user_track_guide_drivers').delete().eq('track_guide_id', guideId)
            const insertRows = items.map(({ id, ...rest }) => rest)
            await supabaseAdmin.from('user_track_guide_drivers').insert(insertRows)
          } catch (e) { totals.errors.push(`user_track_guide_drivers (guide ${guideId}): ${String(e)}`) }
        }
      }

      // user_gp_guides: upsert by (user_id, name); track ID mapping for related records
      if (importData.userGpGuides?.length) {
        const guideIdMap = new Map<string, string>()
        for (const item of importData.userGpGuides as Record<string, unknown>[]) {
          try {
            const { data: existing } = await supabaseAdmin
              .from('user_gp_guides').select('id')
              .eq('user_id', userId).eq('name', item.name as string).single()
            const guideData = {
              user_id: userId,
              name: item.name,
              start_date: item.start_date,
              gp_level: item.gp_level,
              notes: item.notes,
              weekend_strategy_same: item.weekend_strategy_same,
              is_ready: item.is_ready ?? false,
              season_id: (item.season_id as string | null) ?? null,
            }
            if (existing) {
              await supabaseAdmin.from('user_gp_guides').update(guideData).eq('id', existing.id)
              guideIdMap.set(item.id as string, existing.id)
            } else {
              const { data: newGuide } = await supabaseAdmin.from('user_gp_guides').insert(guideData).select('id').single()
              if (newGuide) guideIdMap.set(item.id as string, newGuide.id)
            }
          } catch (e) { totals.errors.push(`user_gp_guides (${userId}): ${String(e)}`) }
        }

        // user_gp_guide_tracks: upsert by (gp_guide_id, race_type, race_number)
        if (importData.userGpGuideTracks?.length) {
          // Pre-fetch tracks for cross-environment ID resolution via _track_name
          const { data: envTracks } = await supabaseAdmin.from('tracks').select('id, name')
          const envTrackIds = new Set(envTracks?.map(t => t.id) ?? [])
          const envTrackNameToId = new Map(envTracks?.map(t => [t.name, t.id]) ?? [])

          const resolveTrackId = (trackId: string, trackName?: string | null): string | null => {
            if (envTrackIds.has(trackId)) return trackId
            if (trackName) return envTrackNameToId.get(trackName) ?? null
            return null
          }

          for (const item of importData.userGpGuideTracks as Record<string, unknown>[]) {
            try {
              const newGuideId = guideIdMap.get(item.gp_guide_id as string)
              if (!newGuideId) continue

              const resolvedTrackId = resolveTrackId(item.track_id as string, item._track_name as string | null)
              if (!resolvedTrackId) {
                totals.errors.push(`user_gp_guide_tracks (${userId}): track not found (id=${item.track_id}, name=${item._track_name ?? 'unknown'}), skipping`)
                continue
              }

              const { data: existing } = await supabaseAdmin
                .from('user_gp_guide_tracks').select('id')
                .eq('gp_guide_id', newGuideId).eq('race_type', item.race_type as string).eq('race_number', item.race_number as number).single()
              const remappedSavedSetupId = item.saved_setup_id
                ? (setupIdMap.get(item.saved_setup_id as string) ?? null)
                : null
              if (existing) {
                const { id, created_at, _track_name, ...updateData } = item
                await supabaseAdmin.from('user_gp_guide_tracks').update({ ...updateData, track_id: resolvedTrackId, gp_guide_id: newGuideId, saved_setup_id: remappedSavedSetupId }).eq('id', existing.id)
              } else {
                const { id, _track_name, ...insertData } = item
                await supabaseAdmin.from('user_gp_guide_tracks').insert({ ...insertData, track_id: resolvedTrackId, gp_guide_id: newGuideId, saved_setup_id: remappedSavedSetupId })
              }
            } catch (e) { totals.errors.push(`user_gp_guide_tracks (${userId}): ${String(e)}`) }
          }
        }

        // user_gp_guide_results: upsert by (gp_guide_id, track_id)
        if (importData.userGpGuideResults?.length) {
          for (const item of importData.userGpGuideResults as Record<string, unknown>[]) {
            try {
              const newGuideId = guideIdMap.get(item.gp_guide_id as string)
              if (!newGuideId) continue
              const { data: existing } = await supabaseAdmin
                .from('user_gp_guide_results').select('id')
                .eq('gp_guide_id', newGuideId).eq('track_id', item.track_id as string).single()
              if (existing) {
                const { id, created_at, ...updateData } = item
                await supabaseAdmin.from('user_gp_guide_results').update({ ...updateData, gp_guide_id: newGuideId }).eq('id', existing.id)
              } else {
                const { id, ...insertData } = item
                await supabaseAdmin.from('user_gp_guide_results').insert({ ...insertData, gp_guide_id: newGuideId })
              }
            } catch (e) { totals.errors.push(`user_gp_guide_results (${userId}): ${String(e)}`) }
          }
        }
      }

      // user_custom_drivers: upsert by (user_id, name)
      if (importData.userCustomDrivers?.length) {
        for (const item of importData.userCustomDrivers as Record<string, unknown>[]) {
          try {
            const resolvedSeasonId = (item.season_id as string | null) ?? userEntry.active_season_id ?? null
            const { data: existing } = await supabaseAdmin
              .from('user_custom_drivers').select('id')
              .eq('user_id', userId).eq('name', item.name as string).single()
            if (existing) {
              const { id, created_at, updated_at, ...updateData } = item
              await supabaseAdmin.from('user_custom_drivers').update({ ...updateData, season_id: resolvedSeasonId }).eq('id', existing.id)
            } else {
              const { id, created_at, updated_at, ...insertData } = item
              await supabaseAdmin.from('user_custom_drivers').insert({ ...insertData, user_id: userId, season_id: resolvedSeasonId })
            }
          } catch (e) { totals.errors.push(`user_custom_drivers (${userId}): ${String(e)}`) }
        }
      }

      totals.usersProcessed++
    }

    return NextResponse.json({ message: 'User data imported successfully', results: totals })

  } catch (error) {
    console.error('Users import error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
