import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin-check - Check if current user is admin
export async function GET(request: NextRequest) {
  try {
    console.log('Admin check called - checking current user authentication')
    
    // Use server-side Supabase client that handles cookies
    // Create client directly instead of using the helper function
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
          },
        },
      }
    )
    
    // Get the current session from cookies
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Get the authenticated user (more secure than using session.user directly)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('User error:', userError)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    console.log('Admin check - found user:', { userId: user.id, email: user.email })

    // Check if the authenticated user is admin
    // Use the admin client for database access since the anonymous client doesn't have permission
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log('Admin check - profile not found or error:', { profileError, profile })
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    const isAdmin = profile?.is_admin === true
    console.log('Admin check result:', { isAdmin, userId: user.id, profile })
    return NextResponse.json({ isAdmin })

  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
