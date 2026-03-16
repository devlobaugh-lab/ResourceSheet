import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, createServerSupabaseClient, createAuthenticatedSupabaseClient } from '@/lib/supabase'

const updateTrackSlotSchema = z.object({
  track_id: z.string().uuid().nullable().optional(),
  is_wet: z.boolean().optional(),
  is_ready: z.boolean().optional(),
  driver_1_id: z.string().uuid().nullable().optional(),
  driver_2_id: z.string().uuid().nullable().optional(),
  driver_1_boost_id: z.string().uuid().nullable().optional(),
  driver_2_boost_id: z.string().uuid().nullable().optional(),
  alt_driver_ids: z.array(z.string().uuid()).optional(),
  alt_boost_ids: z.array(z.string().uuid()).optional(),
  saved_setup_id: z.string().uuid().nullable().optional(),
  setup_notes: z.string().nullable().optional(),
  driver_1_tire_strategy: z.string().nullable().optional(),
  driver_2_tire_strategy: z.string().nullable().optional(),
  strategy_notes: z.string().nullable().optional(),
}).partial()

async function getAuthUser(request: NextRequest) {
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
          return { id: payload.sub, email: payload.email }
        }
      }
    } catch { /* Fall through */ }
  }
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!error && user) return user
  } catch { /* Auth failed */ }
  return null
}

// PUT /api/gp-guides/[id]/tracks/[slotId] - Update a track slot
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  const { id, slotId } = await params
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = updateTrackSlotSchema.parse(body)

    // Use authenticated client for RLS enforcement
    const supabase = await createAuthenticatedSupabaseClient(request)

    // Verify the track slot belongs to the user's GP guide (RLS will enforce ownership)
    const { data: slot } = await supabase
      .from('user_gp_guide_tracks')
      .select('id, gp_guide_id')
      .eq('id', slotId)
      .eq('gp_guide_id', id)
      .single()

    if (!slot) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Track slot not found' } },
        { status: 404 }
      )
    }

    // Update the track slot (RLS will enforce ownership)
    const { data, error } = await supabase
      .from('user_gp_guide_tracks')
      .update(validated)
      .eq('id', slotId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }
    console.error('GP guide track slot PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
