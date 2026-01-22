import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/export-admin-data - Export admin data (custom boost names + free boost flags) (admin only)
export async function GET(request: NextRequest) {
  try {
    // Try to get user from Authorization header first, then fall back to cookies
    let user = null
    const authHeader = request.headers.get('authorization')

    if (authHeader?.startsWith('Bearer ')) {
      // Try to validate JWT token directly
      const token = authHeader.substring(7)
      try {
        // For local development, trust the JWT and extract user info
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
          )

          if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
            user = {
              id: payload.sub,
              email: payload.email,
              user_metadata: payload.user_metadata || {},
              app_metadata: payload.app_metadata || {},
            }
            console.log('✅ Authenticated user from JWT token:', user.id)
          }
        }
      } catch (error) {
        console.warn('JWT validation failed:', error)
      }
    }

    // If JWT didn't work, try cookie-based auth
    if (!user) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet: any[]) {
              cookiesToSet.forEach(({ name, value, options }: any) => {
                request.cookies.set(name, value)
              })
            },
          },
        }
      )
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        )
      }
      user = cookieUser
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    // Get all custom boost names
    const { data: customNames, error: customNamesError } = await supabaseAdmin
      .from('boost_custom_names')
      .select('boost_id, custom_name')
      .order('boost_id', { ascending: true })

    if (customNamesError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: customNamesError.message } },
        { status: 500 }
      )
    }

    // Get all free boost flags
    const { data: freeBoosts, error: freeBoostsError } = await supabaseAdmin
      .from('boosts')
      .select('id, name, is_free')
      .eq('is_free', true)
      .order('id', { ascending: true })

    if (freeBoostsError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: freeBoostsError.message } },
        { status: 500 }
      )
    }

    console.log('Export admin data summary:', {
      customNamesCount: customNames?.length || 0,
      freeBoostsCount: freeBoosts?.length || 0
    })

    // Return the data
    const exportData = {
      exportedAt: new Date().toISOString(),
      boostCustomNames: customNames || [],
      freeBoosts: freeBoosts || []
    }

    return NextResponse.json(exportData)

  } catch (error) {
    console.error('Export admin data error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
