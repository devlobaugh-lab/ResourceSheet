import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'
import { Track, Inserts, Updates } from '@/types/database'

// GET /api/tracks - List all tracks with optional season filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get('season_id')

    // Also get track name aliases
    const { data: aliases } = await supabaseAdmin
      .from('track_name_aliases')
      .select('system_name, display_name')

    // Create a map for quick lookup
    const aliasMap = new Map(
      (aliases || []).map(a => [a.system_name, a.display_name])
    )

    if (seasonId) {
      // Query through junction table — returns only tracks in this season
      const { data: tsData, error } = await supabase
        .from('track_seasons')
        .select('is_active, seasons(id, name, is_active), tracks(*)')
        .eq('season_id', seasonId)

      if (error) {
        console.error('Error fetching tracks:', error)
        return NextResponse.json(
          { error: 'Failed to fetch tracks' },
          { status: 500 }
        )
      }

      const transformedData = (tsData || []).map(row => ({
        ...(row.tracks as any),
        is_active: row.is_active,
        season_name: (row.seasons as any)?.name || 'Unknown',
        season_is_active: (row.seasons as any)?.is_active || false,
        display_name: aliasMap.get((row.tracks as any).name) || null,
      })).sort((a: any, b: any) => a.name.localeCompare(b.name))

      return NextResponse.json(transformedData)
    }

    // No season filter — return all tracks without season info
    const { data, error } = await supabase.from('tracks').select('*').order('name')

    if (error) {
      console.error('Error fetching tracks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tracks' },
        { status: 500 }
      )
    }

    const transformedData = (data || []).map(track => ({
      ...track,
      is_active: null,
      season_name: null,
      season_is_active: false,
      display_name: aliasMap.get(track.name) || null,
    }))

    return NextResponse.json(transformedData)
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

    // Use server-side Supabase client that handles cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
          },
        },
      }
    )
    
    // Get the current session from cookies
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the authenticated user (more secure than using session.user directly)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('User error:', userError)
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
    const seasonId: string | undefined = body.season_id
    const trackData: Inserts<'tracks'> = {
      name: body.name,
      alt_name: body.alt_name,
      laps: body.laps,
      driver_track_stat: body.driver_track_stat,
      car_track_stat: body.car_track_stat,
    }

    // Validate required fields
    if (!trackData.name || !trackData.laps || !trackData.driver_track_stat ||
        !trackData.car_track_stat || !seasonId) {
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
      .eq('id', seasonId)
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
      .select('*')
      .single()

    if (error) {
      console.error('Error creating track:', error)
      return NextResponse.json(
        { error: 'Failed to create track' },
        { status: 500 }
      )
    }

    // Link track to season via junction table
    const { error: tsError } = await supabaseAdmin
      .from('track_seasons')
      .insert({ track_id: data.id, season_id: seasonId, is_active: true })

    if (tsError) {
      console.error('Error linking track to season:', tsError)
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
