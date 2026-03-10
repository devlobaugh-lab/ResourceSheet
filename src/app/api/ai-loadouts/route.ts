import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/ai-loadouts - List unique track/difficulty combinations
export async function GET(request: NextRequest) {
  try {
    // Fetch both loadouts and track name aliases in parallel
    // Use a raw query to get DISTINCT combinations efficiently
    const [loadoutsResult, aliasesResult] = await Promise.all([
      supabaseAdmin.from('ai_track_loadouts').select('name, track_name, difficulty', { count: 'exact' }).limit(1000),
      supabaseAdmin
        .from('track_name_aliases')
        .select('system_name, display_name')
    ])
    
    const { data, error } = loadoutsResult
    const { data: aliases } = aliasesResult
    
    if (error) {
      console.error('Error fetching AI loadouts:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch AI loadouts' } },
        { status: 500 }
      )
    }
    
    // Build a map of system_name -> display_name
    const aliasMap = new Map<string, string>()
    for (const alias of aliases || []) {
      aliasMap.set(alias.system_name, alias.display_name)
    }
    
    // Function to get display track name (supports partial matching)
    const getDisplayTrackName = (trackName: string): string => {
      // First try exact match
      if (aliasMap.has(trackName)) {
        return aliasMap.get(trackName)!
      }
      
      // Try partial matching - check if trackName starts with any alias key
      const aliasEntries = Array.from(aliasMap.entries())
      for (const [systemName, displayName] of aliasEntries) {
        if (trackName.startsWith(systemName)) {
          // Replace the matching part with the display name
          return displayName + trackName.slice(systemName.length)
        }
      }
      
      return trackName
    }
    
    // Deduplicate to get unique combinations
    const uniqueCombinations = new Map<string, { name: string; track_name: string; difficulty: string }>()
    
    for (const row of data || []) {
      const key = `${row.difficulty}-${row.track_name}`
      if (!uniqueCombinations.has(key)) {
        uniqueCombinations.set(key, {
          name: row.name,
          track_name: row.track_name,
          difficulty: row.difficulty
        })
      }
    }
    
    // Convert to array and format for dropdown
    // Replace track names with display names where aliases exist
    const options = Array.from(uniqueCombinations.values()).map(item => {
      // Get the display name for the track using partial matching
      const displayTrackName = getDisplayTrackName(item.track_name)
      
      // Build the display name by replacing the track name at the beginning
      // The name format is typically "TrackName Difficulty" (e.g., "Americas Champion")
      // We need to replace just the track name part, preserving the rest
      let display_name = item.name
      
      // Check if the name starts with the track_name (case-sensitive match)
      if (item.name.startsWith(item.track_name)) {
        display_name = displayTrackName + item.name.slice(item.track_name.length)
      } else {
        // Try case-insensitive match at the start
        const lowerName = item.name.toLowerCase()
        const lowerTrack = item.track_name.toLowerCase()
        if (lowerName.startsWith(lowerTrack)) {
          // Preserve original casing for the rest
          display_name = displayTrackName + item.name.slice(item.track_name.length)
        }
      }
      
      return {
        id: `${item.track_name} ${item.difficulty}`, // Keep system track_name in ID for lookups
        name: item.name, // Original name for reference
        track_name: item.track_name, // System track name (for API calls)
        display_track_name: displayTrackName, // User-facing track name
        difficulty: item.difficulty,
        display_name: display_name
      }
    })
    
    // Sort by display_name for consistent user-friendly ordering
    options.sort((a, b) => a.display_name.localeCompare(b.display_name))
    
    return NextResponse.json({
      data: options,
      count: options.length
    })
    
  } catch (error) {
    console.error('AI loadouts API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}