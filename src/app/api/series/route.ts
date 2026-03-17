import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
import type { SeriesData, SeriesWithTracks, SeriesTrack, SeriesTrackInfo } from '@/types/database'

// Stat display names mapping
const statDisplayNames: Record<string, string> = {
  'tyreUse': 'Tyre Management',
  'overtaking': 'Overtaking',
  'defending': 'Defending',
  'raceStart': 'Race Start',
  'speed': 'Speed',
  'cornering': 'Cornering',
  'powerUnit': 'Power Unit',
  'none': 'None'
}

// Helper function to find common track stat
function findCommonTrackStat(tracks: SeriesTrack[]): string | null {
  if (tracks.length === 0) return null

  // Collect all stats from both driver and car stats
  const allStats: string[] = []
  for (const track of tracks) {
    if (track.driver_track_stat && track.driver_track_stat !== 'none') {
      allStats.push(track.driver_track_stat)
    }
    if (track.car_track_stat && track.car_track_stat !== 'none') {
      allStats.push(track.car_track_stat)
    }
  }

  if (allStats.length === 0) return null

  // Count occurrences of each stat
  const statCounts: Record<string, number> = {}
  for (const stat of allStats) {
    statCounts[stat] = (statCounts[stat] || 0) + 1
  }

  // Check if all tracks share a common stat (all 4 tracks have the same stat)
  const totalTracks = tracks.length
  for (const [stat, count] of Object.entries(statCounts)) {
    // If stat appears in all tracks (count >= totalTracks means all tracks have this stat)
    if (count >= totalTracks) {
      return statDisplayNames[stat] || stat
    }
  }

  // Check if 3 out of 4 tracks share a common stat
  const threshold = Math.ceil(totalTracks * 0.75) // 3 out of 4
  for (const [stat, count] of Object.entries(statCounts)) {
    if (count >= threshold) {
      return statDisplayNames[stat] || stat
    }
  }

  // No commonality found
  return 'Mixed'
}

// GET /api/series - Get all series data with track information
export async function GET(request: NextRequest) {
  try {
    console.log('Starting series API request...')
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get('season_id')

    // Fetch all series data
    let seriesQuery = supabaseAdmin
      .from('series_data')
      .select('*')
      .order('index', { ascending: true })

    if (seasonId) {
      seriesQuery = seriesQuery.eq('season_id', seasonId)
    }

    const { data: seriesData, error: seriesError } = await seriesQuery

    if (seriesError) {
      console.error('Error fetching series data:', seriesError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch series data' } },
        { status: 500 }
      )
    }

    console.log('Series data fetched:', seriesData?.length || 0, 'series')

    if (!seriesData || seriesData.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Collect all track names from all series for lookup and aliases
    const allTrackNames = new Set<string>()
    for (const series of seriesData) {
      // Get names from track_info if available
      const trackInfo = series.track_info as SeriesTrackInfo[] | null
      if (trackInfo && trackInfo.length > 0) {
        for (const info of trackInfo) {
          allTrackNames.add(info.name)
        }
      } else {
        // Fallback to track_names
        for (const trackName of (series.track_names || [])) {
          allTrackNames.add(trackName)
        }
      }
    }

    console.log('Track names collected:', allTrackNames.size)

    // Fetch track name aliases for display names
    const { data: aliasesData } = await supabaseAdmin
      .from('track_name_aliases')
      .select('system_name, display_name')
      .in('system_name', Array.from(allTrackNames))

    // Build alias map
    const aliasMap: Record<string, string> = {}
    for (const alias of (aliasesData || [])) {
      aliasMap[alias.system_name] = alias.display_name
    }

    console.log('Aliases loaded:', Object.keys(aliasMap).length)

    // Fetch tracks from deduplicated tracks table for fallback
    // Season filtering goes through track_seasons junction table
    let tracksData: any[] | null = null
    if (seasonId) {
      const { data: tsData } = await supabaseAdmin
        .from('track_seasons')
        .select('tracks(id, name, laps, driver_track_stat, car_track_stat)')
        .eq('season_id', seasonId)
        .in('tracks.name', Array.from(allTrackNames))
      tracksData = (tsData || []).map((row: any) => row.tracks).filter(Boolean)
    } else {
      const { data } = await supabaseAdmin
        .from('tracks')
        .select('id, name, laps, driver_track_stat, car_track_stat')
        .in('name', Array.from(allTrackNames))
      tracksData = data
    }

    // Build track map by name for fallback lookup
    const trackMap: Record<string, { id: string; laps: number; driver_track_stat: string; car_track_stat: string }> = {}
    for (const track of (tracksData || [])) {
      trackMap[track.name] = {
        id: track.id,
        laps: track.laps,
        driver_track_stat: track.driver_track_stat,
        car_track_stat: track.car_track_stat
      }
    }

    console.log('Tracks loaded:', Object.keys(trackMap).length)

    // Build series with tracks - use track_info if available (has correct lap counts)
    const seriesWithTracks: SeriesWithTracks[] = seriesData.map((series: SeriesData) => {
      let seriesTracks: SeriesTrack[]
      
      // Use track_info if available (has series-specific lap counts)
      const trackInfo = series.track_info as SeriesTrackInfo[] | null
      if (trackInfo && trackInfo.length > 0) {
        seriesTracks = trackInfo.map((info, idx) => ({
          id: series.track_ids[idx] || `unknown-${idx}`,
          name: info.name,
          display_name: aliasMap[info.name] || null,
          laps: info.laps,
          driver_track_stat: info.driverStat,
          car_track_stat: info.carStat
        }))
      } else {
        // Fallback: lookup from tracks table using track_names
        seriesTracks = (series.track_names || []).map((trackName, idx) => {
          const trackData = trackMap[trackName]
          return {
            id: trackData?.id || series.track_ids[idx] || `unknown-${idx}`,
            name: trackName,
            display_name: aliasMap[trackName] || null,
            laps: trackData?.laps || 0,
            driver_track_stat: trackData?.driver_track_stat || 'none',
            car_track_stat: trackData?.car_track_stat || 'none'
          }
        })
      }

      // Find common track stat
      const commonStat = findCommonTrackStat(seriesTracks)

      return {
        index: series.index,
        entry_fee: series.entry_fee,
        win_flags: series.win_flags,
        loss_flags: series.loss_flags,
        win_rep: series.win_rep,
        flags_to_unlock: series.flags_to_unlock,
        max_flags: series.max_flags,
        bot_loadout: series.bot_loadout,
        ai_car_loadouts: series.ai_car_loadouts,
        created_at: series.created_at,
        updated_at: series.updated_at,
        track_names: series.track_names,
        track_info: trackInfo || undefined,
        tracks: seriesTracks,
        common_track_stat: commonStat
      }
    })

    console.log('Series with tracks built:', seriesWithTracks.length)
    return NextResponse.json({ data: seriesWithTracks })
  } catch (error) {
    console.error('Unexpected error in /api/series:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
