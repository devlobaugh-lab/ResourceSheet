import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Track, Updates } from '@/types/database'

// GET /api/tracks/[id] - Get a single track
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    const { data, error } = await supabase
      .from('tracks')
      .select(`
        *,
        seasons (
          id,
          name,
          is_active
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Track not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching track:', error)
      return NextResponse.json(
        { error: 'Failed to fetch track' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in GET /api/tracks/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/tracks/[id] - Update a track (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updateData: Updates<'tracks'> = {}

    // Only include fields that were provided
    if (body.name !== undefined) updateData.name = body.name
    if (body.alt_name !== undefined) updateData.alt_name = body.alt_name
    if (body.laps !== undefined) updateData.laps = body.laps
    if (body.driver_track_stat !== undefined) updateData.driver_track_stat = body.driver_track_stat
    if (body.car_track_stat !== undefined) updateData.car_track_stat = body.car_track_stat
    if (body.season_id !== undefined) updateData.season_id = body.season_id

    // Validate stat values if provided
    if (updateData.driver_track_stat) {
      const validDriverStats = ['overtaking', 'defending', 'raceStart', 'tyreUse']
      if (!validDriverStats.includes(updateData.driver_track_stat)) {
        return NextResponse.json(
          { error: 'Invalid driver track stat' },
          { status: 400 }
        )
      }
    }

    if (updateData.car_track_stat) {
      const validCarStats = ['speed', 'cornering', 'powerUnit']
      if (!validCarStats.includes(updateData.car_track_stat)) {
        return NextResponse.json(
          { error: 'Invalid car track stat' },
          { status: 400 }
        )
      }
    }

    // Verify season exists if season_id is being updated
    if (updateData.season_id) {
      const { data: season, error: seasonError } = await supabase
        .from('seasons')
        .select('id')
        .eq('id', updateData.season_id)
        .single()

      if (seasonError || !season) {
        return NextResponse.json(
          { error: 'Invalid season' },
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabase
      .from('tracks')
      .update(updateData)
      .eq('id', id)
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
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Track not found' },
          { status: 404 }
        )
      }
      console.error('Error updating track:', error)
      return NextResponse.json(
        { error: 'Failed to update track' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in PUT /api/tracks/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/tracks/[id] - Delete a track (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting track:', error)
      return NextResponse.json(
        { error: 'Failed to delete track' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/tracks/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
