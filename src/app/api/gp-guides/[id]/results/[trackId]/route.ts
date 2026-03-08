import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, createServerSupabaseClient, createAuthenticatedSupabaseClient } from '@/lib/supabase'

const upsertResultsSchema = z.object({
  results_notes: z.string().nullable().optional(),
})

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
    const supabase = createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!error && user) return user
  } catch { /* Auth failed */ }
  return null
}

/**
 * PUT /api/gp-guides/[id]/results/[trackId]
 * Upserts results notes for a specific track within a GP guide.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; trackId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = upsertResultsSchema.parse(body)

    // Debug logging
    console.log('Attempting to upsert race results with data:', validated)
    console.log('gp_guide_id:', params.id)
    console.log('track_id:', params.trackId)

    // Use admin client to bypass RLS entirely
    const supabase = supabaseAdmin

    // First, get the GP guide to verify ownership and get the user_id
    const { data: gpGuide, error: gpGuideError } = await supabase
      .from('user_gp_guides')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (gpGuideError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to verify GP guide ownership' } },
        { status: 500 }
      )
    }

    if (!gpGuide) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'GP guide not found' } },
        { status: 404 }
      )
    }

    // Verify the user owns the GP guide
    if (gpGuide.user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You do not own this GP guide' } },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('user_gp_guide_results')
      .upsert(
        {
          gp_guide_id: params.id,
          track_id: params.trackId,
          results_notes: validated.results_notes ?? null,
        },
        { onConflict: 'gp_guide_id,track_id' }
      )
      .select('*')
      .single()

    console.log('Race results upsert result:', { data, error })

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
    console.error('GP guide results PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
