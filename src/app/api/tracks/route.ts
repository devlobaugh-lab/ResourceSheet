import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase'
import { Track, Inserts, Updates } from '@/types/database'

// GET /api/tracks - List all tracks with optional season filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get('season_id')

    let query = supabase
      .from('tracks')
      .select(`
        *,
        seasons (
          id,
          name,
          is_active
        )
      `)
      .order('name')

    // Filter by season if provided
    if (seasonId) {
      query = query.eq('season_id', seasonId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tracks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tracks' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in GET /api/tracks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/tracks - Create a new track (admin only)
export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin status
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const trackData: Inserts<'tracks'> = {
      name: body.name,
      alt_name: body.alt_name,
      laps: body.laps,
      driver_track_stat: body.driver_track_stat,
      car_track_stat: body.car_track_stat,
      season_id: body.season_id
    }

    // Validate required fields
    if (!trackData.name || !trackData.laps || !trackData.driver_track_stat ||
        !trackData.car_track_stat || !trackData.season_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate stat values
    const validDriverStats = ['overtaking', 'defending', 'raceStart', 'tyreUse']
    const validCarStats = ['speed', 'cornering', 'powerUnit']

    if (!validDriverStats.includes(trackData.driver_track_stat)) {
      return NextResponse.json(
        { error: 'Invalid driver track stat' },
        { status: 400 }
      )
    }

    if (!validCarStats.includes(trackData.car_track_stat)) {
      return NextResponse.json(
        { error: 'Invalid car track stat' },
        { status: 400 }
      )
    }

    // Verify season exists
    const { data: season, error: seasonError } = await supabaseAdmin
      .from('seasons')
      .select('id')
      .eq('id', trackData.season_id)
      .single()

    if (seasonError || !season) {
      return NextResponse.json(
        { error: 'Invalid season' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('tracks')
      .insert(trackData)
      .select(`
        *,
        seasons (
          id,
          name,
          is_active
        )
      `)
      .single()

    if (error) {
      console.error('Error creating track:', error)
      return NextResponse.json(
        { error: 'Failed to create track' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/tracks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
