import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, createAuthenticatedSupabaseClient } from '@/lib/supabase'

// GET /api/profiles/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAuthenticatedSupabaseClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Users can only access their own profile
    if (user.id !== params.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Profile not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json(profile)

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
