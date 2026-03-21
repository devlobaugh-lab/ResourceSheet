import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase'
import { upsertRotationSeriesDataSchema } from '@/lib/validation'

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
        )
        if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
          return { id: payload.sub as string }
        }
      }
    } catch {
      // fall through to cookie auth
    }
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// GET /api/track-rotations/user-data?rotation_set_id=<uuid>
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const rotationSetId = searchParams.get('rotation_set_id')
    if (!rotationSetId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'rotation_set_id is required' } },
        { status: 400 }
      )
    }

    const [seriesResult, trackResult] = await Promise.all([
      supabaseAdmin
        .from('user_rotation_series_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('rotation_set_id', rotationSetId),
      supabaseAdmin
        .from('user_rotation_track_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('rotation_set_id', rotationSetId),
    ])

    if (seriesResult.error) throw seriesResult.error
    if (trackResult.error) throw trackResult.error

    return NextResponse.json({
      series_data: seriesResult.data ?? [],
      track_data: trackResult.data ?? [],
    })
  } catch (error) {
    console.error('Error fetching user rotation data:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/track-rotations/user-data — upsert series row
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = upsertRotationSeriesDataSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { rotation_set_id, series_index, driver_1_id, driver_2_id, saved_setup_id } = parsed.data

    const { data, error } = await supabaseAdmin
      .from('user_rotation_series_data')
      .upsert(
        {
          user_id: user.id,
          rotation_set_id,
          series_index,
          driver_1_id: driver_1_id ?? null,
          driver_2_id: driver_2_id ?? null,
          saved_setup_id: saved_setup_id ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,rotation_set_id,series_index' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error upserting rotation series data:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
