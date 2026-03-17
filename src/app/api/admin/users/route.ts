import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    // Use server-side Supabase client that handles cookies
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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin === true

    if (profileError || !isAdmin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    // Get all users with their profiles
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch users' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create a new user (invite)
export async function POST(request: NextRequest) {
  try {
    // Use server-side Supabase client that handles cookies
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

    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = adminProfile?.is_admin === true

    if (profileError || !isAdmin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email, username, is_admin: makeAdmin } = body

    if (!email) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email is required' } },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (checkError) {
      console.error('Error checking existing users:', checkError)
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to check existing users' } },
        { status: 500 }
      )
    }

    const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (existingUser) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'A user with this email already exists' } },
        { status: 400 }
      )
    }

    // Create user with Supabase Admin API
    // Generate a random password - user will reset it via email
    const randomPassword = crypto.randomUUID()
    
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        username: username || null,
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: `Failed to create user: ${createError.message}` } },
        { status: 500 }
      )
    }

    if (!newUser.user) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to create user' } },
        { status: 500 }
      )
    }

    // Update the profile with admin status
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_admin: makeAdmin === true,
        username: username || null,
      })
      .eq('id', newUser.user.id)

    if (updateProfileError) {
      console.error('Error updating profile:', updateProfileError)
      // Try to clean up the created user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to create user profile' } },
        { status: 500 }
      )
    }

    // Send password reset email so user can set their own password
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin')}/auth/update-password`,
    })

    if (resetError) {
      console.error('Error sending password reset:', resetError)
      // Don't fail - user exists, they just need to request a password reset manually
    }

    return NextResponse.json({
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        username: username || null,
        is_admin: makeAdmin === true,
        is_active: true,
        created_at: newUser.user.created_at,
      },
      message: 'User created successfully. A password reset email has been sent.'
    })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}