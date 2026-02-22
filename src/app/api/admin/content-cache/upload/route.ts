import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { createCatalogItemSchema, createBoostSchema, createSeasonSchema } from '@/lib/validation'
import { preprocessDrivers } from '@/lib/preprocessing'

// Schema for season filtering
const seasonFilterSchema = z.object({
  season_filter: z.string().optional(),
})

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
    // For local development, use a simpler authentication approach
    // Check if user is authenticated by checking for a valid session
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // For local development, we'll trust the JWT token if it's present
    // In production, this would use proper Supabase authentication
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Validate JWT format (basic check)
    const parts = token.split('.')
    if (parts.length !== 3) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid authentication token' } },
        { status: 401 }
      )
    }

    // Create a mock user for local development
    const mockUser = {
      id: 'local-admin-user',
      email: 'admin@local.dev',
      user_metadata: {},
      app_metadata: { role: 'authenticated' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Check if user is admin (for local dev, we'll check if they have admin access)
    // In a real setup, this would query the database
    const isAdmin = true // For local development, assume admin access
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }
    
    // For local development, we'll skip the admin check since we're assuming admin access
    // In production, this would query the database to verify admin status
    console.log('✅ Local development: Assuming admin access for user:', mockUser.id)
    
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const seasonFilter = formData.get('season_filter') as string
    const allowModifications = formData.get('allow_modifications') === 'true'
    
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

    // Parse season filter
    let seasonNumbers = parseSeasonFilter(seasonFilter)

    // Load seasons and determine mapping from season number -> season id
    const seasonIdMap: Record<number, string> = {}
    try {
      const { data: seasons } = await supabaseAdmin.from('seasons').select('id,name,is_active')
      if (Array.isArray(seasons)) {
        for (const s of seasons) {
          if (s && s.name) {
            const match = (s.name || '').match(/(\d+)/)
            if (match) {
              const num = parseInt(match[1], 10)
              if (!isNaN(num)) {
                seasonIdMap[num] = s.id
              }
            }
          }
        }
      }

      // If no season filter provided, default to the active season (local/dev)
      if (seasonNumbers.length === 0) {
        const active = (seasons || []).find((s: any) => s.is_active)
        if (active && active.name) {
          const match = (active.name || '').match(/(\d+)/)
          if (match) {
            const num = parseInt(match[1], 10)
            if (!isNaN(num)) {
              seasonNumbers = [num]
              console.log('No season_filter provided — defaulting import to active season:', num)
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not load seasons for mapping — importing without season mapping', err)
    }

    // Read and parse the uploaded file
    const fileText = await file.text()
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
    const results = await processContentCache(validatedData, seasonNumbers, allowModifications, seasonIdMap)

    return NextResponse.json({
      message: 'Content cache processed successfully',
      results,
      summary: {
        total_new: results.drivers.new + results.car_parts.new + results.boosts.new,
        total_modified: results.drivers.modified + results.car_parts.modified + results.boosts.modified,
        total_unchanged: results.drivers.unchanged + results.car_parts.unchanged + results.boosts.unchanged,
        drivers: results.drivers,
        car_parts: results.car_parts,
        boosts: results.boosts
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

// Helper function to parse season filter
function parseSeasonFilter(seasonFilter: string): number[] {
  if (!seasonFilter || seasonFilter.trim() === '') {
    return []; // Import all seasons
  }
  
  try {
    const seasons = seasonFilter
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(s => !isNaN(s) && s >= 0 && s <= 12)
      .sort((a, b) => a - b)
    
    return seasons
  } catch (error) {
    return [] // Import all seasons if parsing fails
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
async function processContentCache(validatedData: any, seasonNumbers: number[], allowModifications: boolean = false, seasonIdMap: Record<number, string> = {}) {
  const results = {
    drivers: { new: 0, modified: 0, unchanged: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }> },
    car_parts: { new: 0, modified: 0, unchanged: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }> },
    boosts: { new: 0, modified: 0, unchanged: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }> },
    collections: { new: 0, modified: 0, unchanged: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }> },
    ai_track_loadouts: { new: 0, modified: 0, unchanged: 0, deleted: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }> },
    series: { new: 0, modified: 0, unchanged: 0, deleted: 0 },
    tracks: { new: 0, modified: 0, unchanged: 0 }
  }

  // Process collections FIRST - handle both wrapped and unwrapped formats
  // This ensures collections exist before drivers are processed (foreign key relationships)
  let collectionsData = validatedData._contentResponse?.collections || (validatedData as any).collections
  if (collectionsData) {
    const collections = collectionsData.map((c: any) => ({
      id: c.id,
      name: c.name ?? null,                    // Use c.name (display name like "SERVLOC_TXT_PODIUM_STARS_COLLECTION_TITLE")
      theme: c.theme ?? null,                  // Use c.theme (theme name like "PodiumStars")
      description: c.description ?? null,
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
      const driverResults = await processItems(processedDrivers, 'drivers', 'id', allowModifications)
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
        stats_per_level: part.carPartStatsPerLevel || [],
        season_id: seasonIdMap[part.season] || null
      }))

    if (carParts.length > 0) {
      const carPartResults = await processItems(carParts, 'car_parts', 'id', allowModifications)
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
              }
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
              }
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
      const { count: existingCount } = await supabaseAdmin
        .from('ai_track_loadouts')
        .select('*', { count: 'exact', head: true });
      
      // Delete all existing AI loadouts
      const { error: deleteError } = await supabaseAdmin
        .from('ai_track_loadouts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (workaround for "delete all")
      
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
        ai_car_loadouts: s.aiCarLoadouts || null
      };
    });
    
    if (seriesRows.length > 0) {
      // Count existing rows for reporting
      const { count: existingCount } = await supabaseAdmin
        .from('series_data')
        .select('*', { count: 'exact', head: true });
      
      // Delete all existing series data
      const { error: deleteError } = await supabaseAdmin
        .from('series_data')
        .delete()
        .neq('index', -999); // Delete all (workaround for "delete all")
      
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
        } else {
          results.series.new = seriesRows.length;
          console.log(`✅ Series data processed: deleted=${results.series.deleted}, inserted=${seriesRows.length}`);
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
    
    // Get active season ID
    let activeSeasonId: string | null = null;
    const activeSeasons = Object.entries(seasonIdMap).filter(([num, id]) => {
      // The active season should be in seasonNumbers
      return seasonNumbers.includes(parseInt(num));
    });
    if (activeSeasons.length > 0) {
      activeSeasonId = activeSeasons[0][1];
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
    
    // Build track rows for database - deduplicated by name
    const trackRows = Array.from(tracksByName.values()).map((t: any) => ({
      id: t.id,
      name: t.name,
      laps: t.lapcount,
      driver_track_stat: convertStatName(t.strongStatA),
      car_track_stat: convertStatName(t.strongStatB),
      track_guid: t.trackGuid,
      season_id: activeSeasonId,
      is_active: true
    }));
    
    console.log(`📊 Deduplicated to ${trackRows.length} unique tracks`);
    console.log('Sample tracks:', trackRows.slice(0, 3).map((t: any) => `${t.name} (${t.laps} laps, ${t.driver_track_stat}/${t.car_track_stat})`));
    
    if (trackRows.length > 0) {
      // Clear existing tracks (they'll be replaced)
      const { error: deleteError } = await supabaseAdmin
        .from('tracks')
        .delete()
        .neq('id', ''); // Delete all
      
      if (deleteError) {
        console.error('❌ Failed to clear existing tracks:', deleteError);
      } else {
        // Insert new tracks
        const { error: insertError } = await supabaseAdmin
          .from('tracks')
          .insert(trackRows);
        
        if (insertError) {
          console.error('❌ Failed to insert tracks:', insertError);
        } else {
          results.tracks.new = trackRows.length;
          console.log(`✅ Tracks processed: inserted=${trackRows.length}`);
        }
      }
    }
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
async function processItems(items: any[], tableName: string, idField: string, allowModifications: boolean = false) {
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
      }
    } else {
      // Existing item - check for changes
      const changes = detectChanges(existingItem, newItem)
      
      if (changes.length > 0) {
        results.modified++
        results.modified_items.push({
          id: newItem[idField],
          name: newItem.name,
          changes: changes
        })
        
        // Update the database if modifications are allowed
        if (allowModifications) {
          const { error } = await supabaseAdmin
            .from(tableName)
            .update(newItem)
            .eq(idField, newItem[idField])
          
          if (!error) {
            console.log(`✅ Updated ${tableName} item: ${newItem[idField]} (${newItem.name})`)
          } else {
            console.error(`❌ Failed to update ${tableName} item: ${newItem[idField]} (${newItem.name})`, error)
          }
        }
      } else {
        results.unchanged++
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