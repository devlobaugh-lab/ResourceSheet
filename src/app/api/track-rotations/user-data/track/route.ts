import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase'
import { upsertRotationTrackDataSchema } from '@/lib/validation'

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

// PUT /api/track-rotations/user-data/track — upsert track row
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
    const parsed = upsertRotationTrackDataSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { rotation_set_id, series_index, track_position, boost_id, dry_strategy, wet_strategy } = parsed.data

    const { data, error } = await supabaseAdmin
      .from('user_rotation_track_data')
      .upsert(
        {
          user_id: user.id,
          rotation_set_id,
          series_index,
          track_position,
          boost_id: boost_id ?? null,
          dry_strategy: dry_strategy ?? null,
          wet_strategy: wet_strategy ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,rotation_set_id,series_index,track_position' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error upserting rotation track data:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
