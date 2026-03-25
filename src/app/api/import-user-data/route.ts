import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase'

// POST /api/import-user-data - Import user's data (merge strategy)
export async function POST(request: NextRequest) {
  console.log('📥 Import user data API called')
  try {
    const supabase = await createAuthenticatedSupabaseClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    const userId = user.id
    const body = await request.json()
    const importData = body.data || body // Support both formats

    const results = {
      imported: { drivers: 0, carParts: 0, boosts: 0, trackGuides: 0, gpGuides: 0, gpGuideTracks: 0, carSetups: 0, customDrivers: 0, rotationSeriesData: 0, rotationTrackData: 0 },
      updated: { drivers: 0, carParts: 0, boosts: 0, trackGuides: 0, gpGuides: 0, gpGuideTracks: 0, carSetups: 0, customDrivers: 0, rotationSeriesData: 0, rotationTrackData: 0 },
      errors: [] as string[]
    }

    // 0. Import profile metadata (username, active_season_id only)
    const userMeta = body.user || {}
    if (userMeta.username !== undefined || userMeta.active_season_id !== undefined) {
      try {
        const profileUpdate: Record<string, unknown> = {}
        if (userMeta.username !== undefined) profileUpdate.username = userMeta.username
        if (userMeta.active_season_id !== undefined) profileUpdate.active_season_id = userMeta.active_season_id
        await supabaseAdmin.from('profiles').update(profileUpdate).eq('id', userId)
      } catch (e) {
        results.errors.push(`profile metadata: ${String(e)}`)
      }
    }

    // Define mappings for known old track IDs (used for both track guides and GP guide tracks)
    const oldTrackMappings: Record<string, string> = {
      // Original mappings
      '00000000-0000-0000-0000-000000000005': 'ebe50201-4398-4bda-99b0-49177aaf0eb3', // Americas/Austin
      '3e1354cb-1d37-4b10-b20a-f1b1dbfab419': '12e030e4-28d0-4e26-9725-552bde90ff73', // Silverstone
      '1d04038f-5425-4989-acc9-dc308fdd833c': 'ed34468f-dd09-4b34-b461-43d56f3d9bf5', // Monza
      
      // Additional mappings from current errors
      '00000000-0000-0000-0000-000000000002': 'ebe50201-4398-4bda-99b0-49177aaf0eb3', // Americas/Austin (common fallback)
      'af5d8b2b-487f-46ef-af3f-ad9635c75b28': '12e030e4-28d0-4e26-9725-552bde90ff73', // Silverstone (common fallback)
      'e029213b-544f-46b0-93ec-500c21e7f441': 'ed34468f-dd09-4b34-b461-43d56f3d9bf5', // Monza (common fallback)
    }

    // 0b. Import User Car Setups FIRST (needed for saved_setup_id FK in track guides / GP guide tracks)
    // Build oldId → newId mapping so we can remap saved_setup_id references
    const setupIdMap = new Map<string, string>()
    if (importData.userCarSetups && Array.isArray(importData.userCarSetups)) {
      for (const item of importData.userCarSetups) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_car_setups')
            .select('id')
            .eq('user_id', userId)
            .eq('name', item.name)
            .single()

          const { id: oldSetupId, created_at, user_id: _oldUserId, ...setupRest } = item
          const setupData = { ...setupRest, user_id: userId }

          if (existing) {
            const { error } = await supabaseAdmin.from('user_car_setups').update(setupData).eq('id', existing.id)
            if (!error) {
              setupIdMap.set(oldSetupId, existing.id)
              results.updated.carSetups++
            } else {
              results.errors.push(`Car setup ${item.name}: ${error.message}`)
            }
          } else {
            const { data: newSetup, error } = await supabaseAdmin.from('user_car_setups').insert(setupData).select('id').single()
            if (!error && newSetup) {
              setupIdMap.set(oldSetupId, newSetup.id)
              results.imported.carSetups++
            } else if (error) {
              results.errors.push(`Car setup ${item.name}: ${error.message}`)
            }
          }
        } catch (e) {
          results.errors.push(`Car setup: ${String(e)}`)
        }
      }
      console.log(`  ✅ Car setups (pre-pass): ${results.imported.carSetups} imported, ${results.updated.carSetups} updated`)
    }

    // 1. Import User Drivers (merge: upsert)
    if (importData.userDrivers && Array.isArray(importData.userDrivers)) {
      for (const item of importData.userDrivers) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_drivers')
            .select('id')
            .eq('user_id', userId)
            .eq('driver_id', item.driver_id)
            .single()

          if (existing) {
            const { error } = await supabaseAdmin
              .from('user_drivers')
              .update({ level: item.level, card_count: item.card_count })
              .eq('id', existing.id)
            if (!error) results.updated.drivers++
            else results.errors.push(`Driver ${item.driver_id}: ${error.message}`)
          } else {
            const { error } = await supabaseAdmin
              .from('user_drivers')
              .insert({ user_id: userId, driver_id: item.driver_id, level: item.level, card_count: item.card_count })
            if (!error) results.imported.drivers++
            else results.errors.push(`Driver ${item.driver_id}: ${error.message}`)
          }
        } catch (e) {
          results.errors.push(`Driver ${item.driver_id}: ${String(e)}`)
        }
      }
      console.log(`  ✅ Drivers: ${results.imported.drivers} imported, ${results.updated.drivers} updated`)
    }

    // 2. Import User Car Parts (merge: upsert)
    if (importData.userCarParts && Array.isArray(importData.userCarParts)) {
      for (const item of importData.userCarParts) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_car_parts')
            .select('id')
            .eq('user_id', userId)
            .eq('car_part_id', item.car_part_id)
            .single()

          if (existing) {
            const { error } = await supabaseAdmin
              .from('user_car_parts')
              .update({ level: item.level, card_count: item.card_count })
              .eq('id', existing.id)
            if (!error) results.updated.carParts++
            else results.errors.push(`Car part ${item.car_part_id}: ${error.message}`)
          } else {
            const { error } = await supabaseAdmin
              .from('user_car_parts')
              .insert({ user_id: userId, car_part_id: item.car_part_id, level: item.level, card_count: item.card_count })
            if (!error) results.imported.carParts++
            else results.errors.push(`Car part ${item.car_part_id}: ${error.message}`)
          }
        } catch (e) {
          results.errors.push(`Car part ${item.car_part_id}: ${String(e)}`)
        }
      }
      console.log(`  ✅ Car parts: ${results.imported.carParts} imported, ${results.updated.carParts} updated`)
    }

    // 3. Import User Boosts (merge: upsert)
    // Note: the export field is 'count', database field is also 'count' (card_count was legacy)
    if (importData.userBoosts && Array.isArray(importData.userBoosts)) {
      for (const item of importData.userBoosts) {
        try {
          // Get the count value - check both 'count' and 'card_count' fields for compatibility
          const boostCount = item.count ?? item.card_count ?? 0
          
          const { data: existing } = await supabaseAdmin
            .from('user_boosts')
            .select('id')
            .eq('user_id', userId)
            .eq('boost_id', item.boost_id)
            .single()

          if (existing) {
            const { error } = await supabaseAdmin
              .from('user_boosts')
              .update({ level: item.level, count: boostCount })
              .eq('id', existing.id)
            if (!error) results.updated.boosts++
            else results.errors.push(`Boost ${item.boost_id}: ${error.message}`)
          } else {
            const { error } = await supabaseAdmin
              .from('user_boosts')
              .insert({ user_id: userId, boost_id: item.boost_id, level: item.level, count: boostCount })
            if (!error) results.imported.boosts++
            else results.errors.push(`Boost ${item.boost_id}: ${error.message}`)
          }
        } catch (e) {
          results.errors.push(`Boost ${item.boost_id}: ${String(e)}`)
        }
      }
      console.log(`  ✅ Boosts: ${results.imported.boosts} imported, ${results.updated.boosts} updated`)
    }

    // 4. Import User Track Guides (merge: upsert by user_id + track_id + gp_level)
    const trackGuideIdMap = new Map<string, string>() // old ID → new ID, for track guide drivers
    if (importData.userTrackGuides && Array.isArray(importData.userTrackGuides)) {
      // Build track lookup maps once — used for both direct ID and name-based fallback
      const { data: currentTracks } = await supabaseAdmin.from('tracks').select('id, name')
      const currentTrackIds = new Set(currentTracks?.map(t => t.id) || [])
      const trackNameToIdMap = new Map(currentTracks?.map(t => [t.name, t.id]) || [])

      // Pre-fetch track→season mapping to backfill missing season_ids
      const { data: trackSeasons } = await supabaseAdmin
        .from('track_seasons')
        .select('track_id, season_id')
        .eq('is_active', true)
      const trackSeasonMap = new Map(trackSeasons?.map(ts => [ts.track_id, ts.season_id]) ?? [])

      const resolveTrackId = (trackId: string, trackName?: string | null): string | null => {
        // 1. Legacy hardcoded UUID mapping
        const mapped = oldTrackMappings[trackId]
        if (mapped) return mapped
        // 2. Direct ID exists in this environment
        if (currentTrackIds.has(trackId)) return trackId
        // 3. Fall back to name-based lookup (cross-environment imports)
        if (trackName) return trackNameToIdMap.get(trackName) ?? null
        return null
      }

      for (const item of importData.userTrackGuides) {
        try {
          const trackId = resolveTrackId(item.track_id, item._track_name)

          if (!trackId) {
            results.errors.push(`Track guide (id=${item.track_id}, name=${item._track_name ?? 'unknown'}): Track not found in this environment, skipping`)
            continue
          }

          const remappedSavedSetupId = item.saved_setup_id ? (setupIdMap.get(item.saved_setup_id) ?? null) : null
          const resolvedSeasonId = (item.season_id ?? null) ?? trackSeasonMap.get(trackId) ?? null

          // Check by unique constraint: user_id + track_id + gp_level (+ season_id if present)
          let existingQuery = supabaseAdmin
            .from('user_track_guides')
            .select('id')
            .eq('user_id', userId)
            .eq('track_id', trackId)
            .eq('gp_level', item.gp_level)
          if (resolvedSeasonId) {
            existingQuery = existingQuery.eq('season_id', resolvedSeasonId)
          } else {
            existingQuery = existingQuery.is('season_id', null)
          }
          const { data: existing } = await existingQuery.single()

          const { id: _oldId, created_at, _track_name, user_id: _oldUserId, ...rest } = item
          const guideData = {
            ...rest,
            user_id: userId,
            track_id: trackId,
            season_id: resolvedSeasonId,
            saved_setup_id: remappedSavedSetupId,
          }

          if (existing) {
            const { error } = await supabaseAdmin
              .from('user_track_guides')
              .update(guideData)
              .eq('id', existing.id)
            if (!error) {
              trackGuideIdMap.set(item.id, existing.id)
              results.updated.trackGuides++
            } else results.errors.push(`Track guide ${item.track_id}: ${error.message}`)
          } else {
            const { data: newGuide, error } = await supabaseAdmin
              .from('user_track_guides')
              .insert(guideData)
              .select('id')
              .single()
            if (!error && newGuide) {
              trackGuideIdMap.set(item.id, newGuide.id)
              results.imported.trackGuides++
            } else if (error) results.errors.push(`Track guide ${item.track_id}: ${error.message}`)
          }
        } catch (e) {
          results.errors.push(`Track guide ${item.track_id}: ${String(e)}`)
        }
      }
      console.log(`  ✅ Track guides: ${results.imported.trackGuides} imported, ${results.updated.trackGuides} updated`)
    }

    // 4b. Import User Track Guide Drivers
    if (importData.userTrackGuideDrivers && Array.isArray(importData.userTrackGuideDrivers) && importData.userTrackGuideDrivers.length > 0) {
      const byGuide = new Map<string, Record<string, unknown>[]>()
      for (const item of importData.userTrackGuideDrivers) {
        const guideId = item.track_guide_id as string
        if (!byGuide.has(guideId)) byGuide.set(guideId, [])
        byGuide.get(guideId)!.push(item)
      }
      for (const [oldGuideId, items] of Array.from(byGuide.entries())) {
        try {
          const newGuideId = trackGuideIdMap.get(oldGuideId)
          if (!newGuideId) continue
          await supabaseAdmin.from('user_track_guide_drivers').delete().eq('track_guide_id', newGuideId)
          const insertRows = items.map(({ id: _id, track_guide_id: _tgId, ...rest }) => ({ ...rest, track_guide_id: newGuideId }))
          await supabaseAdmin.from('user_track_guide_drivers').insert(insertRows)
        } catch (e) {
          results.errors.push(`Track guide drivers (guide ${oldGuideId}): ${String(e)}`)
        }
      }
      console.log(`  ✅ Track guide drivers imported`)
    }

    // 5. Import User GP Guides with tracks (upsert by user_id + name)
    if (importData.userGpGuides && Array.isArray(importData.userGpGuides)) {
      // Create a mapping from old guide ID to new guide ID
      const guideIdMap = new Map<string, string>()
      
      // First, import/update GP guides and capture IDs
      for (const item of importData.userGpGuides) {
        try {
          // Check if GP guide with same name exists for this user
          const { data: existing } = await supabaseAdmin
            .from('user_gp_guides')
            .select('id')
            .eq('user_id', userId)
            .eq('name', item.name)
            .single()

          const guideData = {
            user_id: userId,
            name: item.name,
            start_date: item.start_date,
            gp_level: item.gp_level,
            notes: item.notes,
            weekend_strategy_same: item.weekend_strategy_same,
            is_ready: item.is_ready ?? false,
            season_id: item.season_id ?? null,
          }

          if (existing) {
            // Update existing guide
            const { error } = await supabaseAdmin
              .from('user_gp_guides')
              .update(guideData)
              .eq('id', existing.id)
            
            if (error) {
              results.errors.push(`GP guide ${item.name}: ${error.message}`)
            } else {
              guideIdMap.set(item.id, existing.id)
              results.updated.gpGuides++
            }
          } else {
            // Create new guide
            const { data: newGuide, error } = await supabaseAdmin
              .from('user_gp_guides')
              .insert(guideData)
              .select('id')
              .single()

            if (error) {
              results.errors.push(`GP guide ${item.name}: ${error.message}`)
            } else if (newGuide) {
              guideIdMap.set(item.id, newGuide.id)
              results.imported.gpGuides++
            }
          }
        } catch (e) {
          results.errors.push(`GP guide: ${String(e)}`)
        }
      }
      console.log(`  ✅ GP guides: ${results.imported.gpGuides} imported, ${results.updated.gpGuides} updated`)

      // Now import GP guide tracks using the ID mapping (upsert by gp_guide_id + race_type + race_number)
      if (importData.userGpGuideTracks && Array.isArray(importData.userGpGuideTracks)) {
        const { data: gpTracks } = await supabaseAdmin.from('tracks').select('id, name')
        const gpTrackIds = new Set(gpTracks?.map(t => t.id) || [])
        const gpTrackNameToId = new Map(gpTracks?.map(t => [t.name, t.id]) || [])

        const resolveGpTrackId = (trackId: string, trackName?: string | null): string | null => {
          const mapped = oldTrackMappings[trackId]
          if (mapped) return mapped
          if (gpTrackIds.has(trackId)) return trackId
          if (trackName) return gpTrackNameToId.get(trackName) ?? null
          return null
        }

        for (const item of importData.userGpGuideTracks) {
          try {
            const newGuideId = guideIdMap.get(item.gp_guide_id)
            if (!newGuideId) {
              // Skip tracks for guides that weren't imported
              continue
            }

            const trackId = resolveGpTrackId(item.track_id, item._track_name)

            if (!trackId) {
              results.errors.push(`GP guide track (id=${item.track_id}, name=${item._track_name ?? 'unknown'}): Track not found in this environment, skipping`)
              continue
            }

            const { id: _gtId, created_at: _gtCa, _track_name: _gtTn, ...trackRest } = item
            const trackData = {
              ...trackRest,
              gp_guide_id: newGuideId,
              track_id: trackId,
              saved_setup_id: item.saved_setup_id ? (setupIdMap.get(item.saved_setup_id) ?? null) : null,
            }

            // Check if track exists by unique constraint
            const { data: existing } = await supabaseAdmin
              .from('user_gp_guide_tracks')
              .select('id')
              .eq('gp_guide_id', newGuideId)
              .eq('race_type', item.race_type)
              .eq('race_number', item.race_number)
              .single()

            if (existing) {
              const { error } = await supabaseAdmin
                .from('user_gp_guide_tracks')
                .update(trackData)
                .eq('id', existing.id)
              if (!error) results.updated.gpGuideTracks++
              else results.errors.push(`GP guide track: ${error.message}`)
            } else {
              const { error } = await supabaseAdmin
                .from('user_gp_guide_tracks')
                .insert(trackData)
              if (!error) results.imported.gpGuideTracks++
              else results.errors.push(`GP guide track: ${error.message}`)
            }
          } catch (e) {
            results.errors.push(`GP guide track: ${String(e)}`)
          }
        }
        console.log(`  ✅ GP guide tracks: ${results.imported.gpGuideTracks} imported, ${results.updated.gpGuideTracks} updated`)
      }

      // Import GP guide results
      if (importData.userGpGuideResults && Array.isArray(importData.userGpGuideResults)) {
        const { data: resultTracks } = await supabaseAdmin.from('tracks').select('id, name')
        const resultTrackIds = new Set(resultTracks?.map(t => t.id) || [])
        const resultTrackNameToId = new Map(resultTracks?.map(t => [t.name, t.id]) || [])

        for (const item of importData.userGpGuideResults) {
          try {
            const newGuideId = guideIdMap.get(item.gp_guide_id)
            if (!newGuideId) continue

            // Resolve track_id cross-environment via _track_name
            let trackId: string | null = resultTrackIds.has(item.track_id) ? item.track_id : null
            if (!trackId && item._track_name) trackId = resultTrackNameToId.get(item._track_name) ?? null
            if (!trackId) {
              results.errors.push(`GP guide result (track id=${item.track_id}, name=${item._track_name ?? 'unknown'}): track not found, skipping`)
              continue
            }

            const { data: existing } = await supabaseAdmin
              .from('user_gp_guide_results')
              .select('id')
              .eq('gp_guide_id', newGuideId)
              .eq('track_id', trackId)
              .single()

            if (existing) {
              await supabaseAdmin.from('user_gp_guide_results').update({ results_notes: item.results_notes }).eq('id', existing.id)
            } else {
              await supabaseAdmin.from('user_gp_guide_results').insert({ gp_guide_id: newGuideId, track_id: trackId, results_notes: item.results_notes })
            }
          } catch (e) {
            results.errors.push(`GP guide result: ${String(e)}`)
          }
        }
      }
    }

    // 6. (Car Setups already imported in pre-pass above)

    // 7. Import User Custom Drivers (merge: upsert by name)
    if (importData.userCustomDrivers && Array.isArray(importData.userCustomDrivers)) {
      for (const item of importData.userCustomDrivers) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_custom_drivers')
            .select('id')
            .eq('user_id', userId)
            .eq('name', item.name)
            .single()

          const { id: _id, created_at, updated_at, user_id: _oldUserId, ...driverRest } = item
          const driverData = {
            ...driverRest,
            user_id: userId,
            season_id: item.season_id ?? null,
          }

          if (existing) {
            const { error } = await supabaseAdmin
              .from('user_custom_drivers')
              .update(driverData)
              .eq('id', existing.id)
            if (!error) results.updated.customDrivers++
            else results.errors.push(`Custom driver ${item.name}: ${error.message}`)
          } else {
            const { error } = await supabaseAdmin
              .from('user_custom_drivers')
              .insert(driverData)
            if (!error) results.imported.customDrivers++
            else results.errors.push(`Custom driver ${item.name}: ${error.message}`)
          }
        } catch (e) {
          results.errors.push(`Custom driver: ${String(e)}`)
        }
      }
      console.log(`  ✅ Custom drivers: ${results.imported.customDrivers} imported, ${results.updated.customDrivers} updated`)
    }

    // 8. Import User Rotation Series Data (upsert by user_id + rotation_set_id + series_index)
    if (importData.userRotationSeriesData && Array.isArray(importData.userRotationSeriesData)) {
      // Build a map from set_number → id for cross-environment resolution
      const { data: rotationSets } = await supabaseAdmin.from('track_rotation_sets').select('id, set_number')
      const rotationSetByNumber = new Map((rotationSets || []).map(s => [s.set_number, s.id]))
      const validRotationSetIds = new Set((rotationSets || []).map(s => s.id))

      const resolveRotationSetId = (item: { rotation_set_id: string; _rotation_set_number?: number | null }): string | null => {
        // 1. Prefer set_number lookup (cross-environment safe)
        if (item._rotation_set_number != null) return rotationSetByNumber.get(item._rotation_set_number) ?? null
        // 2. Fall back to direct UUID if it exists in this environment
        if (validRotationSetIds.has(item.rotation_set_id)) return item.rotation_set_id
        return null
      }

      // Pre-load catalog data for cross-environment ID resolution
      const { data: allDriversCatalog } = await supabaseAdmin.from('drivers').select('id, name')
      const driverIdSet = new Set((allDriversCatalog || []).map(d => d.id))
      const driverNameToIdMap = new Map((allDriversCatalog || []).map(d => [d.name, d.id]))

      const { data: allCarPartsCatalog } = await supabaseAdmin.from('car_parts').select('id, name, car_part_type')
      const carPartIdSet = new Set((allCarPartsCatalog || []).map(p => p.id))
      const carPartNameTypeToIdMap = new Map(
        (allCarPartsCatalog || []).map(p => [`${p.name}:${p.car_part_type}`, p.id])
      )

      const resolveDriverId = (id: string | null | undefined, name?: string | null): string | null => {
        if (!id) return null
        if (driverIdSet.has(id)) return id
        if (name) return driverNameToIdMap.get(name) ?? null
        return null
      }

      // car_part_type values: 0=Gearbox, 1=Brake, 2=Engine, 3=Suspension, 4=Front Wing, 5=Rear Wing
      const resolveCarPartId = (id: string | null | undefined, name: string | null | undefined, type: number): string | null => {
        if (!id) return null
        if (carPartIdSet.has(id)) return id
        if (name) return carPartNameTypeToIdMap.get(`${name}:${type}`) ?? null
        return null
      }

      for (const item of importData.userRotationSeriesData) {
        try {
          const rotationSetId = resolveRotationSetId(item)
          if (!rotationSetId) {
            results.errors.push(`Rotation series data ${item.rotation_set_id}/${item.series_index}: rotation set not found in this environment, skipping`)
            continue
          }

          const { data: existing } = await supabaseAdmin
            .from('user_rotation_series_data')
            .select('id')
            .eq('user_id', userId)
            .eq('rotation_set_id', rotationSetId)
            .eq('series_index', item.series_index)
            .single()

          const rowData = {
            user_id: userId,
            rotation_set_id: rotationSetId,
            series_index: item.series_index,
            driver_1_id: resolveDriverId(item.driver_1_id, item._driver_1_name),
            driver_2_id: resolveDriverId(item.driver_2_id, item._driver_2_name),
            setup_brake_id:      resolveCarPartId(item.setup_brake_id,      item._setup_brake_name,      1),
            setup_gearbox_id:    resolveCarPartId(item.setup_gearbox_id,    item._setup_gearbox_name,    0),
            setup_rear_wing_id:  resolveCarPartId(item.setup_rear_wing_id,  item._setup_rear_wing_name,  5),
            setup_front_wing_id: resolveCarPartId(item.setup_front_wing_id, item._setup_front_wing_name, 4),
            setup_suspension_id: resolveCarPartId(item.setup_suspension_id, item._setup_suspension_name, 3),
            setup_engine_id:     resolveCarPartId(item.setup_engine_id,     item._setup_engine_name,     2),
            setup_bonus_percentage: item.setup_bonus_percentage ?? 0,
            setup_series_filter:    item.setup_series_filter ?? 12,
          }

          if (existing) {
            const { error } = await supabaseAdmin.from('user_rotation_series_data').update(rowData).eq('id', existing.id)
            if (!error) results.updated.rotationSeriesData++
            else results.errors.push(`Rotation series data ${item.rotation_set_id}/${item.series_index}: ${error.message}`)
          } else {
            const { error } = await supabaseAdmin.from('user_rotation_series_data').insert(rowData)
            if (!error) results.imported.rotationSeriesData++
            else results.errors.push(`Rotation series data ${item.rotation_set_id}/${item.series_index}: ${error.message}`)
          }
        } catch (e) {
          results.errors.push(`Rotation series data ${item.rotation_set_id}/${item.series_index}: ${String(e)}`)
        }
      }
      console.log(`  ✅ Rotation series data: ${results.imported.rotationSeriesData} imported, ${results.updated.rotationSeriesData} updated`)
    }

    // 9. Import User Rotation Track Data (upsert by user_id + rotation_set_id + series_index + track_position)
    if (importData.userRotationTrackData && Array.isArray(importData.userRotationTrackData)) {
      const { data: rotationSets2 } = await supabaseAdmin.from('track_rotation_sets').select('id, set_number')
      const rotationSetByNumber2 = new Map((rotationSets2 || []).map(s => [s.set_number, s.id]))
      const validRotationSetIds2 = new Set((rotationSets2 || []).map(s => s.id))

      const resolveRotationSetId2 = (item: { rotation_set_id: string; _rotation_set_number?: number | null }): string | null => {
        if (item._rotation_set_number != null) return rotationSetByNumber2.get(item._rotation_set_number) ?? null
        if (validRotationSetIds2.has(item.rotation_set_id)) return item.rotation_set_id
        return null
      }

      // Pre-load boosts catalog for cross-environment boost ID resolution
      const { data: allBoostsCatalog } = await supabaseAdmin.from('boosts').select('id, name')
      const boostIdSet = new Set((allBoostsCatalog || []).map(b => b.id))
      const boostNameToIdMap = new Map((allBoostsCatalog || []).map(b => [b.name, b.id]))

      const resolveBoostId = (id: string | null | undefined, name?: string | null): string | null => {
        if (!id) return null
        if (boostIdSet.has(id)) return id
        if (name) return boostNameToIdMap.get(name) ?? null
        return null
      }

      for (const item of importData.userRotationTrackData) {
        try {
          const rotationSetId = resolveRotationSetId2(item)
          if (!rotationSetId) {
            results.errors.push(`Rotation track data ${item.rotation_set_id}/${item.series_index}/${item.track_position}: rotation set not found in this environment, skipping`)
            continue
          }

          const { data: existing } = await supabaseAdmin
            .from('user_rotation_track_data')
            .select('id')
            .eq('user_id', userId)
            .eq('rotation_set_id', rotationSetId)
            .eq('series_index', item.series_index)
            .eq('track_position', item.track_position)
            .single()

          const rowData = {
            user_id: userId,
            rotation_set_id: rotationSetId,
            series_index: item.series_index,
            track_position: item.track_position,
            boost_id: resolveBoostId(item.boost_id, item._boost_name),
            dry_strategy: item.dry_strategy,
            wet_strategy: item.wet_strategy,
          }

          if (existing) {
            const { error } = await supabaseAdmin.from('user_rotation_track_data').update(rowData).eq('id', existing.id)
            if (!error) results.updated.rotationTrackData++
            else results.errors.push(`Rotation track data ${item.rotation_set_id}/${item.series_index}/${item.track_position}: ${error.message}`)
          } else {
            const { error } = await supabaseAdmin.from('user_rotation_track_data').insert(rowData)
            if (!error) results.imported.rotationTrackData++
            else results.errors.push(`Rotation track data ${item.rotation_set_id}/${item.series_index}/${item.track_position}: ${error.message}`)
          }
        } catch (e) {
          results.errors.push(`Rotation track data ${item.rotation_set_id}/${item.series_index}/${item.track_position}: ${String(e)}`)
        }
      }
      console.log(`  ✅ Rotation track data: ${results.imported.rotationTrackData} imported, ${results.updated.rotationTrackData} updated`)
    }

    console.log('📥 Import complete')
    return NextResponse.json({
      message: 'User data imported successfully',
      results,
    })

  } catch (error) {
    console.error('Import user data error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}