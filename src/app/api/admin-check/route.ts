import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin-check - Check if current user is admin
export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null

    // Try JWT auth first (app uses localStorage-based JWT)
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
            userId = payload.sub
          }
        }
      } catch {
        // JWT parse failed, fall through to cookie auth
      }
    }

    // Fall back to cookie-based auth
    if (!userId) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
              cookiesToSet.forEach(({ name, value }) => {
                request.cookies.set(name, value)
              })
            },
          },
        }
      )
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    }

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    return NextResponse.json({ isAdmin: profile.is_admin === true })

  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
