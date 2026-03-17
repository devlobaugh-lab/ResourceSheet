import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/ai-loadouts/track/[trackName]/[difficulty] - Get loadout rows for specific track/difficulty
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackName: string; difficulty: string }> }
) {
  const { trackName, difficulty } = await params
  try {

    // Decode URL-encoded track name
    const decodedTrackName = decodeURIComponent(trackName)
    const decodedDifficulty = decodeURIComponent(difficulty)
    const seasonId = request.nextUrl.searchParams.get('season_id')

    // Get all loadout rows for this track/difficulty
    let loadoutsQuery = supabaseAdmin
      .from('ai_track_loadouts')
      .select('*')
      .eq('track_name', decodedTrackName)
      .eq('difficulty', decodedDifficulty)
      .order('team_name')
      .order('driver_slot')
    if (seasonId) loadoutsQuery = loadoutsQuery.eq('season_id', seasonId)
    const { data: loadouts, error } = await loadoutsQuery
    
    if (error) {
      console.error('Error fetching AI loadouts:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch AI loadouts' } },
        { status: 500 }
      )
    }
    
    // Get team driver name mappings
    const teamNames = Array.from(new Set(loadouts?.map(l => l.team_name) || []))
    const { data: driverNames } = await supabaseAdmin
      .from('team_driver_names')
      .select('*')
      .in('team_name', teamNames)
    
    const driverNameMap = new Map(
      (driverNames || []).map(d => [`${d.team_name}-${d.driver_slot}`, d.driver_name])
    )
    
    // Helper function to sum car part stats
    const sumCarPartStats = (carParts: Record<string, any> | null) => {
      if (!carParts) return { speed: 0, cornering: 0, powerUnit: 0, qualifying: 0, pitStopTime: 0, drs: 0 }
      
      const parts = ['frontWing', 'rearWing', 'suspension', 'engine', 'gearbox', 'brakes']
      const totals = { speed: 0, cornering: 0, powerUnit: 0, qualifying: 0, pitStopTime: 0, drs: 0 }
      
      for (const part of parts) {
        const partStats = carParts[part]
        if (partStats) {
          totals.speed += partStats.speed || 0
          totals.cornering += partStats.cornering || 0
          totals.powerUnit += partStats.powerUnit || 0
          totals.qualifying += partStats.qualifying || 0
          totals.pitStopTime += partStats.pitStopTime || 0
          totals.drs += partStats.drs || 0
        }
      }
      
      return totals
    }
    
    // Enrich loadouts with driver names and consolidated car part stats
    const enrichedLoadouts = (loadouts || []).map(loadout => {
      const carPartStats = sumCarPartStats(loadout.car_parts)
      return {
        ...loadout,
        driver_name: driverNameMap.get(`${loadout.team_name}-${loadout.driver_slot}`) ||
          `${loadout.team_name} - D${loadout.driver_slot}`,
        // Consolidated car part stats
        cp_speed: carPartStats.speed,
        cp_cornering: carPartStats.cornering,
        cp_powerUnit: carPartStats.powerUnit,
        cp_qualifying: carPartStats.qualifying,
        cp_pitStopTime: carPartStats.pitStopTime,
        cp_drs: carPartStats.drs,
        // Qualifying total (driver + parts)
        qualifying_total: loadout.qualifying + carPartStats.qualifying
      }
    })
    
    return NextResponse.json({
      data: enrichedLoadouts,
      count: enrichedLoadouts.length,
      track_name: decodedTrackName,
      difficulty: decodedDifficulty
    })
    
  } catch (error) {
    console.error('AI loadouts detail API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}