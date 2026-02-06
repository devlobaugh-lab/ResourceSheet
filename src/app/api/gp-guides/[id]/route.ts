import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/gp-guides/:id - Get single GP guide by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Try to get user from Authorization header first, then fall back to cookies
    let user = null
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
            user = { id: payload.sub }
          }
        }
      } catch (error) {
        console.warn('JWT validation failed:', error)
      }
    }

    if (!user) {
      try {
        const supabase = createServerSupabaseClient()
        const { data: { user: cookieUser } } = await supabase.auth.getUser()
        if (cookieUser) user = cookieUser
      } catch (error) {
        console.log('Auth failed')
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Use RPC function to bypass RLS and get GP guide with tracks
    const { data, error } = await supabase
      .rpc('get_gp_guide_with_tracks', {
        p_guide_id: params.id,
        p_user_id: user.id,
      })

    if (error) {
      console.error('GP guide fetch error:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'GP guide not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: data[0] })

  } catch (error) {
    console.error('GP guide GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
