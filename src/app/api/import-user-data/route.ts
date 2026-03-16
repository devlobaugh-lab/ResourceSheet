import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, createAuthenticatedSupabaseClient } from '@/lib/supabase'

// POST /api/import-user-data - Import user's data (merge strategy)
export async function POST(request: NextRequest) {
  console.log('📥 Import user data API called')
  try {
    const supabase = createAuthenticatedSupabaseClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    const userId = user.id
    const body = await request.json()
    const importData = body.data || body // Support both formats

    const results = {
      imported: { drivers: 0, carParts: 0, boosts: 0, trackGuides: 0, gpGuides: 0, gpGuideTracks: 0, carSetups: 0, customDrivers: 0 },
      updated: { drivers: 0, carParts: 0, boosts: 0, trackGuides: 0, gpGuides: 0, gpGuideTracks: 0, carSetups: 0, customDrivers: 0 },
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
    if (importData.userTrackGuides && Array.isArray(importData.userTrackGuides)) {
      // Create track ID mapping for old UUIDs
      const trackIdMapping = new Map<string, string>()
      
      // Get current track IDs for reference
      const { data: currentTracks } = await supabaseAdmin.from('tracks').select('id, name')
      const trackMap = new Map(currentTracks?.map(t => [t.name, t.id]) || [])

      for (const item of importData.userTrackGuides) {
        try {
          // Map old track ID to current track ID first
          let trackId = item.track_id
          if (oldTrackMappings[item.track_id]) {
            trackId = oldTrackMappings[item.track_id]
            console.log(`🔄 Mapping old track ID ${item.track_id} to ${trackId}`)
          }

          // Now check if the (mapped) track exists
          const { data: existingTrack } = await supabaseAdmin
            .from('tracks')
            .select('id')
            .eq('id', trackId)
            .single()
          
          if (!existingTrack) {
            results.errors.push(`Track guide ${item.track_id}: Track not found, skipping`)
            continue
          }

          // Check by unique constraint: user_id + track_id + gp_level
          const { data: existing } = await supabaseAdmin
            .from('user_track_guides')
            .select('id')
            .eq('user_id', userId)
            .eq('track_id', trackId)
            .eq('gp_level', item.gp_level)
            .single()

          const guideData = {
            user_id: userId,
            track_id: trackId,
            gp_level: item.gp_level,
            suggested_drivers: item.suggested_drivers,
            free_boost_id: item.free_boost_id,
            suggested_boosts: item.suggested_boosts,
            saved_setup_id: item.saved_setup_id,
            setup_notes: item.setup_notes,
            dry_strategy: item.dry_strategy,
            wet_strategy: item.wet_strategy,
            driver_1_dry_strategy: item.driver_1_dry_strategy,
            driver_1_wet_strategy: item.driver_1_wet_strategy,
            driver_2_dry_strategy: item.driver_2_dry_strategy,
            driver_2_wet_strategy: item.driver_2_wet_strategy,
            notes: item.notes,
            driver_1_id: item.driver_1_id,
            driver_2_id: item.driver_2_id,
            driver_1_boost_id: item.driver_1_boost_id,
            driver_2_boost_id: item.driver_2_boost_id,
            alt_driver_ids: item.alt_driver_ids,
            alt_boost_ids: item.alt_boost_ids,
          }

          if (existing) {
            const { error } = await supabaseAdmin
              .from('user_track_guides')
              .update(guideData)
              .eq('id', existing.id)
            if (!error) results.updated.trackGuides++
            else results.errors.push(`Track guide ${item.track_id}: ${error.message}`)
          } else {
            const { error } = await supabaseAdmin
              .from('user_track_guides')
              .insert(guideData)
            if (!error) results.imported.trackGuides++
            else results.errors.push(`Track guide ${item.track_id}: ${error.message}`)
          }
        } catch (e) {
          results.errors.push(`Track guide ${item.track_id}: ${String(e)}`)
        }
      }
      console.log(`  ✅ Track guides: ${results.imported.trackGuides} imported, ${results.updated.trackGuides} updated`)
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
        for (const item of importData.userGpGuideTracks) {
          try {
            const newGuideId = guideIdMap.get(item.gp_guide_id)
            if (!newGuideId) {
              // Skip tracks for guides that weren't imported
              continue
            }

            // Map old track ID to current track ID for GP guide tracks first
            let trackId = item.track_id
            if (oldTrackMappings[item.track_id]) {
              trackId = oldTrackMappings[item.track_id]
              console.log(`🔄 Mapping old track ID ${item.track_id} to ${trackId} for GP guide track`)
            }

            // Now check if the (mapped) track exists
            const { data: existingTrack } = await supabaseAdmin
              .from('tracks')
              .select('id')
              .eq('id', trackId)
              .single()
            
            if (!existingTrack) {
              results.errors.push(`GP guide track ${item.track_id}: Track not found, skipping`)
              continue
            }

            const trackData = {
              gp_guide_id: newGuideId,
              track_id: trackId,
              race_number: item.race_number,
              race_type: item.race_type,
              is_wet: item.is_wet,
              driver_1_id: item.driver_1_id,
              driver_2_id: item.driver_2_id,
              driver_1_boost_id: item.driver_1_boost_id,
              driver_2_boost_id: item.driver_2_boost_id,
              alt_driver_ids: item.alt_driver_ids,
              alt_boost_ids: item.alt_boost_ids,
              saved_setup_id: item.saved_setup_id,
              setup_notes: item.setup_notes,
              driver_1_tire_strategy: item.driver_1_tire_strategy,
              driver_2_tire_strategy: item.driver_2_tire_strategy,
              strategy_notes: item.strategy_notes,
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
        for (const item of importData.userGpGuideResults) {
          try {
            const newGuideId = guideIdMap.get(item.gp_guide_id)
            if (!newGuideId) continue

            const { error } = await supabaseAdmin
              .from('user_gp_guide_results')
              .insert({
                gp_guide_id: newGuideId,
                track_id: item.track_id,
                results_notes: item.results_notes,
              })
            // Don't count results separately, they're part of the GP guide
          } catch (e) {
            results.errors.push(`GP guide result: ${String(e)}`)
          }
        }
      }
    }

    // 6. Import User Car Setups (merge: upsert by name)
    if (importData.userCarSetups && Array.isArray(importData.userCarSetups)) {
      for (const item of importData.userCarSetups) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('user_car_setups')
            .select('id')
            .eq('user_id', userId)
            .eq('name', item.name)
            .single()

          const setupData = {
            user_id: userId,
            name: item.name,
            notes: item.notes,
            brake_id: item.brake_id,
            gearbox_id: item.gearbox_id,
            rear_wing_id: item.rear_wing_id,
            front_wing_id: item.front_wing_id,
            suspension_id: item.suspension_id,
            engine_id: item.engine_id,
            series_filter: item.series_filter,
            bonus_percentage: item.bonus_percentage,
          }

          if (existing) {
            const { error } = await supabaseAdmin
              .from('user_car_setups')
              .update(setupData)
              .eq('id', existing.id)
            if (!error) results.updated.carSetups++
            else results.errors.push(`Car setup ${item.name}: ${error.message}`)
          } else {
            const { error } = await supabaseAdmin
              .from('user_car_setups')
              .insert(setupData)
            if (!error) results.imported.carSetups++
            else results.errors.push(`Car setup ${item.name}: ${error.message}`)
          }
        } catch (e) {
          results.errors.push(`Car setup: ${String(e)}`)
        }
      }
      console.log(`  ✅ Car setups: ${results.imported.carSetups} imported, ${results.updated.carSetups} updated`)
    }

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

          const driverData = {
            user_id: userId,
            name: item.name,
            qualifying: item.qualifying,
            race_start: item.race_start,
            overtaking: item.overtaking,
            blocking: item.blocking,
            tyre_use: item.tyre_use,
            car_parts: item.car_parts,
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