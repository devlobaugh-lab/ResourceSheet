import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { TrackRotationView, RotationTrackEntryWithInfo } from '@/types/database'
import { ROTATION_SERIES_INDICES } from '@/lib/track-rotation-constants'

// Strip accents and lowercase for fuzzy name matching (e.g. Montréal ↔ Montreal)
function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// GET /api/track-rotations?date=YYYY-MM-DD&season_id=UUID
// When season_id is provided: finds the rotation within that season for the given date.
// If the date is outside the season's range, falls back to the first or last entry in the season.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const seasonId = searchParams.get('season_id')
    const date = dateParam || new Date().toISOString().split('T')[0]

    let scheduleEntry: ReturnType<typeof Object.assign> | null = null

    if (seasonId) {
      // Fetch all entries for this season, ordered by start_date
      const { data: seasonEntries, error: seasonError } = await supabaseAdmin
        .from('track_rotation_schedule')
        .select('*')
        .eq('season_id', seasonId)
        .order('start_date', { ascending: true })

      if (seasonError || !seasonEntries || seasonEntries.length === 0) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'No rotations found for this season' } },
          { status: 404 }
        )
      }

      // Find entry whose date range contains the given date
      const exact = seasonEntries.find(e => e.start_date <= date && e.end_date >= date)
      if (exact) {
        scheduleEntry = exact
      } else if (date < seasonEntries[0].start_date) {
        // Date is before the season — show first rotation
        scheduleEntry = seasonEntries[0]
      } else {
        // Date is after the season — show last rotation
        scheduleEntry = seasonEntries[seasonEntries.length - 1]
      }
    } else {
      // Legacy date-based lookup (no season_id)
      const { data, error } = await supabaseAdmin
        .from('track_rotation_schedule')
        .select('*')
        .lte('start_date', date)
        .gte('end_date', date)
        .order('start_date', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'No rotation found for this date' } },
          { status: 404 }
        )
      }
      scheduleEntry = data
    }

    if (!scheduleEntry) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'No rotation found' } },
        { status: 404 }
      )
    }

    const [rotationSetResult, tracksResult, aliasesResult] = await Promise.all([
      supabaseAdmin
        .from('track_rotation_sets')
        .select('*')
        .eq('id', scheduleEntry.rotation_set_id)
        .single(),
      supabaseAdmin
        .from('tracks')
        .select('name, laps, driver_track_stat, car_track_stat'),
      supabaseAdmin
        .from('track_name_aliases')
        .select('system_name, display_name'),
    ])

    if (rotationSetResult.error || !rotationSetResult.data) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Rotation set not found' } },
        { status: 404 }
      )
    }

    const rotationSet = rotationSetResult.data

    // Build lookup: normalized display_name → track data (using first match per name)
    type TrackInfo = { laps: number; driver_track_stat: string; car_track_stat: string }
    const trackByNormalizedName = new Map<string, TrackInfo>()

    for (const track of tracksResult.data ?? []) {
      const key = normalize(track.name)
      if (!trackByNormalizedName.has(key)) {
        trackByNormalizedName.set(key, {
          laps: track.laps,
          driver_track_stat: track.driver_track_stat,
          car_track_stat: track.car_track_stat,
        })
      }
    }

    // Alias map: normalized display_name → normalized system_name
    const aliasToSystem = new Map<string, string>()
    for (const alias of aliasesResult.data ?? []) {
      aliasToSystem.set(normalize(alias.display_name), normalize(alias.system_name))
    }

    const lookupTrack = (rotationName: string): TrackInfo | undefined => {
      const norm = normalize(rotationName)
      if (trackByNormalizedName.has(norm)) return trackByNormalizedName.get(norm)
      const systemNorm = aliasToSystem.get(norm)
      if (systemNorm) return trackByNormalizedName.get(systemNorm)
      return undefined
    }

    const series = ROTATION_SERIES_INDICES.map((idx) => {
      const rawTracks = rotationSet.series_data[String(idx)] ?? []
      const tracks: RotationTrackEntryWithInfo[] = rawTracks.map((entry: { track: string; weather: string }) => {
        const info = lookupTrack(entry.track)
        return {
          track: entry.track,
          weather: entry.weather as RotationTrackEntryWithInfo['weather'],
          laps: info?.laps,
          driver_track_stat: info?.driver_track_stat,
          car_track_stat: info?.car_track_stat,
        }
      })
      return { series_index: idx, series_number: idx + 1, tracks }
    })

    const view: TrackRotationView = {
      schedule: scheduleEntry,
      rotation_set: rotationSet,
      series,
    }

    return NextResponse.json(view)
  } catch (error) {
    console.error('Error fetching track rotation:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
