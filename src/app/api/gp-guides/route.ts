import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, createServerSupabaseClient, createAuthenticatedSupabaseClient } from '@/lib/supabase'

// Validation schemas
const createGpGuideSchema = z.object({
  name: z.string().min(1).max(200),
  start_date: z.string().nullable().optional(),
  gp_level: z.number().int().min(0).max(3),
  notes: z.string().nullable().optional(),
  weekend_strategy_same: z.boolean().optional().default(true),
  season_id: z.string().uuid().nullable().optional(),
})

// Helper: extract authenticated user from request
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
    } catch {
      // Fall through to cookie auth
    }
  }

  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!error && user) return user
  } catch {
    // Auth failed
  }

  return null
}

// GET /api/gp-guides - List user's GP guides
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Use authenticated client for RLS enforcement
    const supabase = createAuthenticatedSupabaseClient(request)

    const url = new URL(request.url)
    const season_id = url.searchParams.get('season_id')

    let query = supabase
      .from('user_gp_guides')
      .select('*')
      .order('start_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (season_id) query = query.eq('season_id', season_id)

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('GP guides GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/gp-guides - Create new GP guide (with empty track slots)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = createGpGuideSchema.parse(body)

    // Create the GP guide
    const { data: guide, error: guideError } = await supabaseAdmin
      .from('user_gp_guides')
      .insert({
        user_id: user.id,
        name: validated.name,
        start_date: validated.start_date ?? null,
        gp_level: validated.gp_level,
        notes: validated.notes ?? null,
        weekend_strategy_same: validated.weekend_strategy_same ?? true,
        season_id: validated.season_id ?? null,
      })
      .select('*')
      .single()

    if (guideError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: guideError.message } },
        { status: 500 }
      )
    }

    // Pre-create empty track slots: 4 qualifying + 8 opening (final shares opening when toggle is on)
    const trackSlots = [
      // Qualifying: races 1-4
      ...Array.from({ length: 4 }, (_, i) => ({
        gp_guide_id: guide.id,
        race_type: 'qualifying' as const,
        race_number: i + 1,
        is_wet: false,
        alt_driver_ids: [],
        alt_boost_ids: [],
      })),
      // Opening Round: races 1-8
      ...Array.from({ length: 8 }, (_, i) => ({
        gp_guide_id: guide.id,
        race_type: 'opening' as const,
        race_number: i + 1,
        is_wet: false,
        alt_driver_ids: [],
        alt_boost_ids: [],
      })),
    ]

    const { error: slotsError } = await supabaseAdmin
      .from('user_gp_guide_tracks')
      .insert(trackSlots)

    if (slotsError) {
      console.error('Failed to create track slots:', slotsError)
      // Guide was created - return it even if slots failed, not a fatal error
    }

    return NextResponse.json({ data: guide }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }
    console.error('GP guides POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
