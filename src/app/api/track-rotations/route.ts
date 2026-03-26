import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { TrackRotationView, RotationTrackEntryWithInfo } from '@/types/database'
import { ROTATION_SERIES_INDICES } from '@/lib/track-rotation-constants'

// Strip accents and lowercase for fuzzy name matching (e.g. Montréal ↔ Montreal)
function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// GET /api/track-rotations?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const date = dateParam || new Date().toISOString().split('T')[0]

    // Find the schedule entry that covers this date; on ties pick latest start_date
    const { data: scheduleEntry, error: scheduleError } = await supabaseAdmin
      .from('track_rotation_schedule')
      .select('*')
      .lte('start_date', date)
      .gte('end_date', date)
      .order('start_date', { ascending: false })
      .limit(1)
      .single()

    if (scheduleError || !scheduleEntry) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'No rotation found for this date' } },
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
