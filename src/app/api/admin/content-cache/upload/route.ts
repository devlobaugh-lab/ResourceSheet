import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase'
import { preprocessDrivers } from '@/lib/preprocessing'

// Schema for content cache data
const contentCacheSchema = z.object({
  _contentResponse: z.object({
    drivers: z.array(z.any()).optional(),
    carparts: z.array(z.any()).optional(),
    boosts: z.array(z.any()).optional(),
    collections: z.array(z.any()).optional(),
    trackAILoadouts: z.array(z.any()).optional(),
    series: z.array(z.any()).optional(),
    trackData: z.array(z.any()).optional(),
  }).optional(),
  // Support both wrapped and unwrapped formats
  drivers: z.array(z.any()).optional(),
  carparts: z.array(z.any()).optional(),
  boosts: z.array(z.any()).optional(),
  collections: z.array(z.any()).optional(),
  trackAILoadouts: z.array(z.any()).optional(),
  series: z.array(z.any()).optional(),
  trackData: z.array(z.any()).optional(),
})

// POST /api/admin/content-cache/upload - Upload and process content_cache.json (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createAuthenticatedSupabaseClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

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
    
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const allowModifications = formData.get('allow_modifications') === 'true'
    const targetSeasonOverride = (formData.get('target_season_id') as string) || null
    
    console.log('Content cache upload - Allow modifications:', allowModifications)

    if (!file) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'No file uploaded' } },
        { status: 400 }
      )
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'File must be a JSON file' } },
        { status: 400 }
      )
    }

    let seasonNumbers: number[] = []
    let targetSeasonId: string | null = targetSeasonOverride

    // Load seasons and determine mapping from season number -> season id
    const seasonIdMap: Record<number, string> = {}
    try {
      // Order by is_active DESC then created_at DESC so that for duplicate season
      // numbers the active (or most recently created) season wins.
      const { data: seasons } = await supabaseAdmin
        .from('seasons')
        .select('id,name,is_active,created_at')
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false })
      if (Array.isArray(seasons)) {
        for (const s of seasons) {
          if (s && s.name) {
            const match = (s.name || '').match(/(\d+)/)
            if (match) {
              const num = parseInt(match[1], 10)
              // First season seen for each number wins (active/most-recent due to ordering)
              if (!isNaN(num) && !(num in seasonIdMap)) {
                seasonIdMap[num] = s.id
              }
            }
          }
        }
      }

      if (Object.keys(seasonIdMap).length === 0) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'No seasons are configured. Please add at least one season before importing content cache data.' } },
          { status: 400 }
        )
      }

      // Derive season number from the target season (override or active).
      // This ensures drivers/car parts are filtered to the same season being targeted.
      const targetIdForFilter = targetSeasonOverride
        ?? seasons?.find((s: any) => s.is_active)?.id
        ?? null
      targetSeasonId = targetIdForFilter
      const targetNum = targetIdForFilter
        ? Number(Object.keys(seasonIdMap).find(k => seasonIdMap[Number(k)] === targetIdForFilter))
        : NaN
      if (!isNaN(targetNum)) {
        seasonNumbers = [targetNum]
        console.log('Derived season filter from target season:', targetNum)
      } else {
        // Target season name has no parseable number — fall back to all configured seasons
        seasonNumbers = Object.keys(seasonIdMap).map(Number).sort((a, b) => a - b)
        console.warn('Could not derive season number from target season — importing all configured seasons:', seasonNumbers)
      }
    } catch (err) {
      console.warn('Could not load seasons for mapping — importing without season mapping', err)
    }

    // Read and parse the uploaded file
    let fileText: string;
    const isCompressed = formData.get('compressed') === 'true';
    if (isCompressed) {
      const { gunzipSync } = await import('zlib');
      const buffer = Buffer.from(await file.arrayBuffer());
      fileText = gunzipSync(buffer).toString('utf-8');
    } else {
      fileText = await file.text();
    }
    let contentCacheData: any
    
    try {
      contentCacheData = JSON.parse(fileText)
    } catch (parseError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON file' } },
        { status: 400 }
      )
    }

    // Validate content cache structure
    const validatedData = contentCacheSchema.parse(contentCacheData)

    // Process and import data with change detection
    const results = await processContentCache(validatedData, seasonNumbers, allowModifications, seasonIdMap, targetSeasonOverride)

    // Mark the target season as having content cache loaded (non-fatal if it fails)
    if (targetSeasonId) {
      await supabaseAdmin
        .from('seasons')
        .update({ content_cache_loaded: true })
        .eq('id', targetSeasonId)
        .eq('content_cache_loaded', false)
    }

    return NextResponse.json({
      message: 'Content cache processed successfully',
      results,
      summary: {
        total_new: results.drivers.new + results.car_parts.new + results.boosts.new,
        total_modified: results.drivers.modified + results.car_parts.modified + results.boosts.modified,
        total_unchanged: results.drivers.unchanged + results.car_parts.unchanged + results.boosts.unchanged,
        drivers: results.drivers,
        car_parts: results.car_parts,
        boosts: results.boosts,
        series: results.series,
        tracks: results.tracks,
        ai_track_loadouts: results.ai_track_loadouts,
      }
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Content cache upload error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// Helper function to parse trackAILoadouts name into track_name and difficulty
// Format: "Bahrain Champion" -> { trackName: "Bahrain", difficulty: "Champion" }
function parseAILoadoutName(name: string): { trackName: string; difficulty: string } {
  // Known difficulty levels (in order of precedence for matching)
  const difficulties = [
    'Champion', 'Contender', 'Challenger', 'Junior',
    'Series 12', 'Series 11', 'Series 10',
    'Easy Races'  // Special case for "2025 Easy Races"
  ]
  
  // Check for "Easy Races" special case
  if (name.includes('Easy Races')) {
    return { trackName: name.replace('Easy Races', '').trim(), difficulty: 'Easy Races' }
  }
  
  // Try to match each difficulty
  for (const diff of difficulties) {
    if (name.endsWith(diff)) {
      const trackName = name.slice(0, -diff.length).trim()
      return { trackName, difficulty: diff }
    }
    // Also check if difficulty is in the middle (e.g., "Americas Series 10")
    if (name.includes(diff)) {
      const parts = name.split(diff)
      return { trackName: parts[0].trim(), difficulty: diff }
    }
  }
  
  // Fallback: assume last word is difficulty
  const parts = name.split(' ')
  if (parts.length >= 2) {
    const difficulty = parts.pop() || ''
    const trackName = parts.join(' ')
    return { trackName, difficulty }
  }
  
  return { trackName: name, difficulty: 'Unknown' }
}

// Helper function to process content cache with change detection
async function processContentCache(validatedData: any, seasonNumbers: number[], allowModifications: boolean = false, seasonIdMap: Record<number, string> = {}, targetSeasonOverride: string | null = null) {
  // Determine which season ID to tag all imported data with.
  // A content cache always represents the current game season, so we default
  // to the season marked is_active=true in the DB.  Admins can override this
  // (e.g. to test a future season) by passing target_season_id explicitly.
  let targetSeasonId: string | null = targetSeasonOverride ?? null
  if (!targetSeasonId) {
    const { data: activeSeason } = await supabaseAdmin
      .from('seasons')
      .select('id')
      .eq('is_active', true)
      .single()
    targetSeasonId = activeSeason?.id ?? null
  }

  const results = {
    drivers: { new: 0, modified: 0, unchanged: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }> },
    car_parts: { new: 0, modified: 0, unchanged: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }> },
    boosts: { new: 0, modified: 0, unchanged: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }> },
    collections: { new: 0, modified: 0, unchanged: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }> },
    ai_track_loadouts: { new: 0, modified: 0, unchanged: 0, deleted: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }>, error: null as string | null, skipped: false },
    series: { new: 0, modified: 0, unchanged: 0, deleted: 0, error: null as string | null, skipped: false },
    tracks: { new: 0, modified: 0, unchanged: 0 }
  }

  // Process collections FIRST - handle both wrapped and unwrapped formats
  // This ensures collections exist before drivers are processed (foreign key relationships)
  let collectionsData = validatedData._contentResponse?.collections || (validatedData as any).collections
  if (collectionsData) {
    const collections = collectionsData.map((c: any) => ({
      id: c.id,
      name: c.name ?? null,
      theme: c.theme ?? null,
      ordinal: c.ordinal ?? null,
    }))

    if (collections.length > 0) {
      console.log(`📦 Processing ${collections.length} collections...`);
      console.log('📋 Collections to import:');
      collections.forEach((coll: { id: string; theme: string | null; name: string | null; ordinal: number | null }, i: number) => {
        console.log(`  ${i + 1}. ID: ${coll.id}, Theme: '${coll.theme}', Name: '${coll.name}', Ordinal: ${coll.ordinal}`);
      });
      
      try {
        // Insert or update collections depending on allowModifications
        const collResults = await processItems(collections, 'collections', 'id', allowModifications)
        results.collections.new = collResults.new
        results.collections.modified = collResults.modified
        results.collections.unchanged = collResults.unchanged
        results.collections.modified_items = collResults.modified_items
        console.log(`✅ Collections processed: new=${collResults.new} modified=${collResults.modified} unchanged=${collResults.unchanged}`)
        
        // Verify collections were actually inserted
        const { data: insertedCollections, error: verifyError } = await supabaseAdmin.from('collections').select('*')
        if (verifyError) {
          console.error('❌ Error verifying collections after import:', verifyError)
        } else {
          console.log(`📊 Collections in DB after import: ${insertedCollections.length}`)
          insertedCollections.forEach((coll: any, i: number) => {
            console.log(`  ${i + 1}. ID: ${coll.id}, Theme: '${coll.theme}', Name: '${coll.name}', Ordinal: ${coll.ordinal}`)
          })
        }
      } catch (err) {
        console.error('❌ Failed to process collections from content cache upload:', err)
      }
    }
  } else {
    console.log('⚠️  No collections data found in content_cache')
  }
  
  // Process drivers - handle both wrapped and unwrapped formats
  let driversData = validatedData._contentResponse?.drivers || validatedData.drivers;
  
  if (driversData) {
    const drivers = driversData
      .filter((driver: any) => shouldImportBySeason(driver, seasonNumbers))
      .map((driver: any) => ({
        id: driver.id,
        name: driver.name,
        series: driver.series,
        ordinal: driver.ordinal || 0,
        rarity: driver.rarity || 0,
        icon: driver.icon,
        cc_price: driver.ccPrice || 0,
        num_duplicates_after_unlock: driver.numDuplicatesAfterUnlock || 0,
        collection_id: driver.collectionId || null,
        visual_override: driver.visualOverride || null,
        collection_sub_name: driver.collectionSubName || null,
        min_gp_tier: driver.minGpTier || null, // Map camelCase to snake_case
        tag_name: driver.tagName || null, // Map camelCase to snake_case
        stats_per_level: driver.driverStatsPerLevel || [], // Map camelCase to snake_case
        season_id: seasonIdMap[driver.season] || null
      }))

    // Apply preprocessing to drivers before comparison and database insertion
    // This ensures JSON data is processed the same way as database data
    console.log('Before preprocessing:', drivers.length, 'drivers')
    console.log('Sample driver before preprocessing:', JSON.stringify(drivers[0], null, 2))
    
    const processedDrivers = preprocessDrivers(drivers)
    console.log('After preprocessing:', processedDrivers.length, 'drivers')
    console.log('Sample driver after preprocessing:', JSON.stringify(processedDrivers[0], null, 2))
    
    // Log SE Turbo drivers specifically
    // const seTurboDrivers = processedDrivers.filter(d => d.collection_sub_name && d.collection_sub_name.endsWith('SUBTITLE_2'))
    // console.log('SE Turbo drivers after preprocessing:', seTurboDrivers.length)
    // seTurboDrivers.forEach(driver => {
    //   console.log(`  ${driver.name} - Rarity: ${driver.rarity} - ID: ${driver.id}`)
    // })

    if (processedDrivers.length > 0) {
      const driverResults = await processItems(processedDrivers, 'drivers', 'id', allowModifications, ['season_id'])
      results.drivers.new = driverResults.new
      results.drivers.modified = driverResults.modified
      results.drivers.unchanged = driverResults.unchanged
      results.drivers.modified_items = driverResults.modified_items
    }
  }

  // Process car parts - handle both wrapped and unwrapped formats
  let carPartsData = validatedData._contentResponse?.carparts || validatedData.carparts;
  
  if (carPartsData) {
    const carParts = carPartsData
      .filter((part: any) => shouldImportBySeason(part, seasonNumbers))
      .map((part: any) => ({
        id: part.id,
        name: part.name,
        rarity: part.rarity || 0,
        series: part.series,
        icon: part.icon,
        cc_price: part.ccPrice || 0,
        num_duplicates_after_unlock: part.numDuplicatesAfterUnlock || 0,
        collection_id: part.collectionId || null,
        visual_override: part.visualOverride || null,
        collection_sub_name: part.collectionSubName || null,
        car_part_type: part.carPartType || 0,
        stats_per_level: (part.carPartStatsPerLevel || []).map((stat: any) => ({
          ...stat,
          drs: stat.drs ?? 0,
        })),
        season_id: seasonIdMap[part.season] || null
      }))

    if (carParts.length > 0) {
      const carPartResults = await processItems(carParts, 'car_parts', 'id', allowModifications, ['season_id'])
      results.car_parts.new = carPartResults.new
      results.car_parts.modified = carPartResults.modified
      results.car_parts.unchanged = carPartResults.unchanged
      results.car_parts.modified_items = carPartResults.modified_items
    }
  }

  // Process boosts - handle both wrapped and unwrapped formats
  let boostsData = validatedData._contentResponse?.boosts || validatedData.boosts;
  
  if (boostsData) {
    const boosts = boostsData.map((boost: any) => ({
      id: boost.id,
      name: boost.name.startsWith('BOOST_NAME_') ? `Boost ${boost.name.split('_')[2]}` : boost.name,
      icon: boost.icon,
      boost_stats: {
        speed: boost.speedTier || 0,
        block: boost.blockTier || 0,
        overtake: boost.overtakeTier || 0,
        corners: boost.cornersTier || 0,
        tyre_use: boost.tyreUseTier || 0,
        pit_stop: boost.pitStopTimeTier || 0,
        power_unit: boost.powerUnitTier || 0,
        race_start: boost.raceStartTier || 0,
        duration: 30
      }
    }))

    if (boosts.length > 0) {
      const boostResults = await processItems(boosts, 'boosts', 'id', allowModifications)
      results.boosts.new = boostResults.new
      results.boosts.modified = boostResults.modified
      results.boosts.unchanged = boostResults.unchanged
      results.boosts.modified_items = boostResults.modified_items
    }
  }

  // Process trackAILoadouts - handle both wrapped and unwrapped formats
  // This is a full refresh: delete old data and insert new data
  let trackAILoadoutsData = validatedData._contentResponse?.trackAILoadouts || validatedData.trackAILoadouts;
  
  if (!trackAILoadoutsData) {
    results.ai_track_loadouts.skipped = true;
  }

  if (trackAILoadoutsData) {
    console.log(`🏎️ Processing ${trackAILoadoutsData.length} trackAILoadouts entries...`);
    
    // Build rows for ai_track_loadouts table
    // Each loadout has multiple teams, each team has 2 drivers (driver_slot 1 and 2)
    const loadoutRows: any[] = [];
    
    for (const loadout of trackAILoadoutsData) {
      const { trackName, difficulty } = parseAILoadoutName(loadout.name);
      
      if (loadout.botLoadouts && Array.isArray(loadout.botLoadouts)) {
        for (const team of loadout.botLoadouts) {
          // Create row for Driver 1
          if (team.m_driver1) {
            loadoutRows.push({
              name: loadout.name,
              track_name: trackName,
              difficulty: difficulty,
              team_name: team.teamName,
              driver_slot: 1,
              overtaking: team.m_driver1.overtaking || 0,
              blocking: team.m_driver1.blocking || 0,
              qualifying: team.m_driver1.qualifying || 0,
              tyre_use: team.m_driver1.tyreUse || 0,
              race_start: team.m_driver1.raceStart || 0,
              car_parts: {
                frontWing: team.m_frontWing || null,
                rearWing: team.m_rearWing || null,
                suspension: team.m_suspension || null,
                engine: team.m_engine || null,
                gearbox: team.m_gearbox || null,
                brakes: team.m_brakes || null
              },
              season_id: targetSeasonId,
            });
          }
          
          // Create row for Driver 2
          if (team.m_driver2) {
            loadoutRows.push({
              name: loadout.name,
              track_name: trackName,
              difficulty: difficulty,
              team_name: team.teamName,
              driver_slot: 2,
              overtaking: team.m_driver2.overtaking || 0,
              blocking: team.m_driver2.blocking || 0,
              qualifying: team.m_driver2.qualifying || 0,
              tyre_use: team.m_driver2.tyreUse || 0,
              race_start: team.m_driver2.raceStart || 0,
              car_parts: {
                frontWing: team.m_frontWing || null,
                rearWing: team.m_rearWing || null,
                suspension: team.m_suspension || null,
                engine: team.m_engine || null,
                gearbox: team.m_gearbox || null,
                brakes: team.m_brakes || null
              },
              season_id: targetSeasonId,
            });
          }
        }
      }
    }
    
    if (loadoutRows.length > 0) {
      console.log(`📊 Prepared ${loadoutRows.length} AI loadout rows for import`);
      
      // For AI loadouts, we do a full refresh: delete all existing and insert new
      // This is because trackAILoadouts is reference data that gets completely replaced
      
      // First, count existing rows for reporting
      const countQuery = supabaseAdmin
        .from('ai_track_loadouts')
        .select('*', { count: 'exact', head: true })
      if (targetSeasonId) countQuery.eq('season_id', targetSeasonId)
      const { count: existingCount } = await countQuery;

      // Delete existing AI loadouts for this season (or all if no season)
      const deleteQuery = supabaseAdmin.from('ai_track_loadouts').delete()
      if (targetSeasonId) {
        deleteQuery.eq('season_id', targetSeasonId)
      } else {
        deleteQuery.neq('id', '00000000-0000-0000-0000-000000000000') // Delete all fallback
      }
      const { error: deleteError } = await deleteQuery;
      
      if (deleteError) {
        console.error('❌ Failed to clear existing AI loadouts:', deleteError);
      } else {
        results.ai_track_loadouts.deleted = existingCount || 0;
        
        // Insert new rows in batches
        const BATCH_SIZE = 100;
        let inserted = 0;
        
        for (let i = 0; i < loadoutRows.length; i += BATCH_SIZE) {
          const batch = loadoutRows.slice(i, i + BATCH_SIZE);
          const { error: insertError } = await supabaseAdmin
            .from('ai_track_loadouts')
            .insert(batch);
          
          if (insertError) {
            console.error(`❌ Failed to insert AI loadouts batch ${i / BATCH_SIZE + 1}:`, insertError);
            results.ai_track_loadouts.error = insertError.message;
          } else {
            inserted += batch.length;
          }
        }
        
        results.ai_track_loadouts.new = inserted;
        console.log(`✅ AI loadouts processed: deleted=${results.ai_track_loadouts.deleted}, inserted=${inserted}`);
      }
    }
  }

  // Process series data - handle both wrapped and unwrapped formats
  // This is a full refresh: delete old data and insert new data
  // We also need trackData to populate track_names and track_info
  let seriesData = validatedData._contentResponse?.series || validatedData.series;
  let trackDataForSeries = validatedData._contentResponse?.trackData || validatedData.trackData || [];
  
  // Build a map of trackId -> track info for looking up track details
  const trackIdToInfo: Map<string, { name: string; laps: number; driverStat: string; carStat: string }> = new Map();
  
  // Helper function to convert stat names to lowercase
  const convertStatName = (stat: string): string => {
    const statMap: Record<string, string> = {
      'TyreUse': 'tyreUse',
      'Overtaking': 'overtaking',
      'Blocking': 'defending',
      'RaceStart': 'raceStart',
      'Cornering': 'cornering',
      'PowerUnit': 'powerUnit',
      'Speed': 'speed',
      'None': 'none'
    };
    return statMap[stat] || stat.toLowerCase();
  };
  
  for (const track of trackDataForSeries) {
    trackIdToInfo.set(track.id, {
      name: track.name,
      laps: track.lapcount,
      driverStat: convertStatName(track.strongStatA),
      carStat: convertStatName(track.strongStatB)
    });
  }
  
  if (!seriesData) {
    results.series.skipped = true;
  }

  if (seriesData) {
    console.log(`🏎️ Processing ${seriesData.length} series entries...`);
    
    // Build rows for series_data table
    const seriesRows = seriesData.map((s: any) => {
      // Get track names and full track info from track_ids
      const trackNames: string[] = [];
      const trackInfo: Array<{ name: string; laps: number; driverStat: string; carStat: string }> = [];
      
      for (const trackId of (s.trackIds || [])) {
        const info = trackIdToInfo.get(trackId);
        if (info) {
          trackNames.push(info.name);
          trackInfo.push({
            name: info.name,
            laps: info.laps,
            driverStat: info.driverStat,
            carStat: info.carStat
          });
        } else {
          trackNames.push(trackId);
        }
      }
      
      return {
        index: s.index,
        entry_fee: s.entryFee || 0,
        win_flags: s.winFlags || 0,
        loss_flags: s.lossFlags || 0,
        win_rep: s.winRep || 0,
        flags_to_unlock: s.flagsToUnlock || 0,
        max_flags: s.maxFlags || 0,
        track_ids: s.trackIds || [],
        track_names: trackNames,
        track_info: trackInfo,
        bot_loadout: s.botLoadout || null,
        ai_car_loadouts: s.aiCarLoadouts || null,
        season_id: targetSeasonId,
      };
    });
    
    if (seriesRows.length > 0) {
      // Count existing rows for reporting
      const seriesCountQuery = supabaseAdmin
        .from('series_data')
        .select('*', { count: 'exact', head: true })
      if (targetSeasonId) seriesCountQuery.eq('season_id', targetSeasonId)
      const { count: existingCount } = await seriesCountQuery;

      // Delete existing series data for this season (or all if no season)
      const seriesDeleteQuery = supabaseAdmin.from('series_data').delete()
      if (targetSeasonId) {
        seriesDeleteQuery.eq('season_id', targetSeasonId)
      } else {
        seriesDeleteQuery.neq('index', -999) // Delete all fallback
      }
      const { error: deleteError } = await seriesDeleteQuery;
      
      if (deleteError) {
        console.error('❌ Failed to clear existing series data:', deleteError);
      } else {
        results.series.deleted = existingCount || 0;
        
        // Insert new rows
        const { error: insertError } = await supabaseAdmin
          .from('series_data')
          .insert(seriesRows);
        
        if (insertError) {
          console.error('❌ Failed to insert series data:', insertError);
          console.error('❌ Series rows that failed:', seriesRows);
          results.series.error = insertError.message;
        } else {
          results.series.new = seriesRows.length;
          console.log(`✅ Series data processed: deleted=${results.series.deleted}, inserted=${seriesRows.length}`);
          
          // Verify the insert worked by checking what's actually in the database
          const { data: verifyData, error: verifyError } = await supabaseAdmin
            .from('series_data')
            .select('index')
            .order('index', { ascending: true });
          
          if (verifyError) {
            console.error('❌ Failed to verify series data:', verifyError);
          } else {
            console.log(`📊 Series in database after insert:`, verifyData.map(s => s.index));
          }
        }
      }
    }
  }

  // Process trackData - handle both wrapped and unwrapped formats
  // This uses series data to determine active tracks and deduplicate by name
  // Deduplication is important for track guides and tracks listing pages
  let trackDataRaw = validatedData._contentResponse?.trackData || validatedData.trackData;
  
  if (trackDataRaw && seriesData) {
    console.log(`🏁 Processing ${trackDataRaw.length} trackData entries...`);
    
    // Build a map of trackId -> series indices where it appears (for deduplication priority)
    const trackToSeries: Map<string, number[]> = new Map();
    for (let i = 0; i < seriesData.length; i++) {
      const trackIds = seriesData[i].trackIds || [];
      for (const trackId of trackIds) {
        const existing = trackToSeries.get(trackId) || [];
        existing.push(i);
        trackToSeries.set(trackId, existing);
      }
    }
    
    // Filter trackData to only include tracks that appear in any series
    const activeTrackIds = new Set(trackToSeries.keys());
    const activeTracks = trackDataRaw.filter((t: any) => activeTrackIds.has(t.id));

    console.log(`📊 Found ${activeTrackIds.size} track IDs across all series`);
    console.log(`📊 Found ${activeTracks.length} matching entries in trackData`);

    // Group by name to deduplicate - pick track from highest series (prefer later series)
    const tracksByName: Map<string, any> = new Map();
    for (const track of activeTracks) {
      const existing = tracksByName.get(track.name);
      if (!existing) {
        tracksByName.set(track.name, track);
      } else {
        // Keep the one from the higher series (later series have more relevant data)
        const existingSeries = Math.max(...(trackToSeries.get(existing.id) || [0]));
        const currentSeries = Math.max(...(trackToSeries.get(track.id) || [0]));
        if (currentSeries > existingSeries) {
          tracksByName.set(track.name, track);
        }
      }
    }

    // Helper function to convert stat names to lowercase
    const convertStatName = (stat: string): string => {
      const statMap: Record<string, string> = {
        'TyreUse': 'tyreUse',
        'Overtaking': 'overtaking',
        'Blocking': 'defending',  // Blocking maps to defending
        'RaceStart': 'raceStart',
        'Cornering': 'cornering',
        'PowerUnit': 'powerUnit',
        'Speed': 'speed',
        'None': 'none'
      };
      return statMap[stat] || stat.toLowerCase();
    };

    console.log(`📊 Deduplicated to ${tracksByName.size} unique tracks by name`);

    // Fetch all existing tracks for this season (to detect what is already linked)
    // and all existing tracks by name globally (to avoid creating duplicate track rows).
    // Using targetSeasonId (the game season) ensures we check the right season.
    const existingTracksByName: Map<string, any> = new Map();  // name → track row (any season)
    const existingSeasonTrackIds = new Set<string>();           // IDs already in track_seasons for targetSeasonId

    // Load all tracks by name (across all seasons) to prevent duplicate track rows
    const { data: allTracks } = await supabaseAdmin
      .from('tracks')
      .select('id, name, laps, driver_track_stat, car_track_stat, min_weather_factor, max_weather_factor, weather_freq');
    for (const track of allTracks || []) {
      existingTracksByName.set(track.name, track);
    }

    // Load which of those are already linked to the target season
    if (targetSeasonId) {
      const { data: existingSeasonTracks } = await supabaseAdmin
        .from('track_seasons')
        .select('track_id')
        .eq('season_id', targetSeasonId);
      for (const row of existingSeasonTracks || []) {
        existingSeasonTrackIds.add(row.track_id);
      }
      console.log(`📊 Found ${existingSeasonTrackIds.size} tracks already linked to target season`);
    }

    console.log(`📊 Found ${existingTracksByName.size} tracks in DB across all seasons`);

    // Classify each deduplicated track as: new, changed, or needs season link
    const toInsert: any[] = [];         // brand new tracks not in DB at all
    const toUpdate: any[] = [];         // existing tracks with changed fields
    const newSeasonLinks: any[] = [];   // track_seasons rows to create

    for (const cacheTrack of Array.from(tracksByName.values())) {
      if (!cacheTrack.id) continue;
      const incoming = {
        name: cacheTrack.name,
        laps: cacheTrack.lapcount,
        driver_track_stat: convertStatName(cacheTrack.strongStatA),
        car_track_stat: convertStatName(cacheTrack.strongStatB),
        min_weather_factor: cacheTrack.weather?.MinWeatherFactor ?? null,
        max_weather_factor: cacheTrack.weather?.MaxWeatherFactor ?? null,
        weather_freq: cacheTrack.weather?.Frequency ?? null,
      };

      const existing = existingTracksByName.get(cacheTrack.name);
      if (existing) {
        // Track already exists in DB — update fields if changed
        const changed =
          existing.laps !== incoming.laps ||
          existing.driver_track_stat !== incoming.driver_track_stat ||
          existing.car_track_stat !== incoming.car_track_stat ||
          existing.min_weather_factor !== incoming.min_weather_factor ||
          existing.max_weather_factor !== incoming.max_weather_factor ||
          existing.weather_freq !== incoming.weather_freq;
        if (changed) toUpdate.push({ id: existing.id, ...incoming });
        // Link to target season if not already linked
        if (targetSeasonId && !existingSeasonTrackIds.has(existing.id)) {
          newSeasonLinks.push({ track_id: existing.id, season_id: targetSeasonId, is_active: true });
        }
      } else {
        // Truly new track — insert using content-cache ID
        toInsert.push({ id: cacheTrack.id, ...incoming });
        if (targetSeasonId) {
          newSeasonLinks.push({ track_id: cacheTrack.id, season_id: targetSeasonId, is_active: true });
        }
      }
    }

    results.tracks.unchanged = existingSeasonTrackIds.size - toUpdate.length;

    if (toInsert.length > 0) {
      const { error } = await supabaseAdmin.from('tracks').insert(toInsert);
      if (error) console.error('❌ Failed to insert new tracks:', error);
      else {
        results.tracks.new = toInsert.length;
        console.log(`✅ Inserted ${toInsert.length} new tracks`);
      }
    }

    if (toUpdate.length > 0) {
      for (const track of toUpdate) {
        const { id, ...fields } = track;
        const { error } = await supabaseAdmin.from('tracks').update(fields).eq('id', id);
        if (error) console.error(`❌ Failed to update track ${id}:`, error);
      }
      results.tracks.modified = toUpdate.length;
      console.log(`✅ Updated ${toUpdate.length} changed tracks`);
    }

    if (newSeasonLinks.length > 0) {
      const { error } = await supabaseAdmin.from('track_seasons').insert(newSeasonLinks);
      if (error) console.error('❌ Failed to insert track_seasons:', error);
      else console.log(`✅ Linked ${newSeasonLinks.length} tracks to game season`);
    }

    console.log(`✅ Tracks: ${results.tracks.new} new, ${results.tracks.modified} updated, ${results.tracks.unchanged} unchanged`);
  }

  return results
}

// Helper function to check if item should be imported based on season filter
function shouldImportBySeason(item: any, seasonNumbers: number[]): boolean {
  if (seasonNumbers.length === 0) {
    return true // Import all if no filter specified
  }
  
  // Check if item's season is in the filter list
  return seasonNumbers.includes(item.season)
}

// Helper function to process items with change detection
async function processItems(items: any[], tableName: string, idField: string, allowModifications: boolean = false, forceUpdateFields: string[] = []) {
  const results = {
    new: 0,
    modified: 0,
    unchanged: 0,
    modified_items: [] as Array<{ id: string; name: string; changes: string[] }>
  }

  // Get existing items by IDs
  const existingItems = await getExistingItems(items, tableName, idField)
  const existingMap = new Map(existingItems.map(item => [item[idField], item]))

  for (const newItem of items) {
    const existingItem = existingMap.get(newItem[idField])

    if (!existingItem) {
      // New item - add to database
      const { error } = await supabaseAdmin
        .from(tableName)
        .insert([newItem])
        .select()

      if (!error) {
        results.new++
      } else {
        console.error(`❌ Failed to insert ${tableName} item: ${newItem[idField]}`, error)
      }
    } else {
      // Existing item - check for changes
      const changes = detectChanges(existingItem, newItem)

      const forcedChanges = changes.filter(c => forceUpdateFields.some(f => c.startsWith(f)))
      const optionalChanges = changes.filter(c => !forceUpdateFields.some(f => c.startsWith(f)))

      if (optionalChanges.length > 0) {
        results.modified++
        results.modified_items.push({
          id: newItem[idField],
          name: newItem.name,
          changes: optionalChanges
        })
      } else if (changes.length === 0) {
        results.unchanged++
      }

      const shouldUpdate = (allowModifications && changes.length > 0) || forcedChanges.length > 0
      if (shouldUpdate) {
        const updatePayload = allowModifications
          ? newItem
          : Object.fromEntries(forceUpdateFields.map(f => [f, newItem[f]]))

        const { error } = await supabaseAdmin
          .from(tableName)
          .update(updatePayload)
          .eq(idField, newItem[idField])

        if (!error) {
          console.log(`✅ Updated ${tableName} item: ${newItem[idField]} (${newItem.name})`)
        } else {
          console.error(`❌ Failed to update ${tableName} item: ${newItem[idField]} (${newItem.name})`, error)
        }
      }
    }
  }

  return results
}

// Helper function to get existing items from database
async function getExistingItems(items: any[], tableName: string, idField: string) {
  const ids = items.map(item => item[idField]).filter(Boolean)

  if (ids.length === 0) return []

  // Split into batches to avoid creating extremely long URIs for the Supabase
  // REST requests when many ids are passed to `.in()`.
  // Use 50 to be safe with UUID-length IDs
  const BATCH_SIZE = 50
  const batches: string[][] = []
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    batches.push(ids.slice(i, i + BATCH_SIZE))
  }

  let merged: any[] = []

  for (const batch of batches) {
    try {
  const { data, error } = await supabaseAdmin
    .from(tableName)
    .select('*')
        .in(idField, batch)

  if (error) {
        console.error(`Error fetching existing ${tableName} for batch:`, error)
        // Continue with other batches rather than aborting entirely
        continue
      }

      if (Array.isArray(data)) {
        merged = merged.concat(data)
      }
    } catch (err) {
      console.error(`Unexpected error fetching existing ${tableName} for batch:`, err)
    }
  }

  // Remove duplicates just in case
  const seen = new Set()
  const unique = []
  for (const row of merged) {
    const key = row && row[idField]
    if (!key) continue
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(row)
    }
  }

  return unique
}

// Helper function to detect changes between existing and new items
function detectChanges(existingItem: any, newItem: any): string[] {
  const changes: string[] = []
  
  // Compare each field (excluding metadata fields like created_at, updated_at)
  const fieldsToCompare = Object.keys(newItem).filter(key => 
    !['created_at', 'updated_at', 'id'].includes(key)
  )

  for (const field of fieldsToCompare) {
    const existingValue = existingItem[field]
    const newValue = newItem[field]
    
    if (!deepEqual(existingValue, newValue)) {
      changes.push(`${field} changed`)
    }
  }

  return changes
}

// Helper function for deep equality comparison
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return false
  
  if (typeof a !== typeof b) return false
  
  if (typeof a !== 'object') return false
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }
  
  return true
}