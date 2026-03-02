import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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

    // Check if user is admin
    console.log('Checking admin status for user:', user.id, user.email)
    
    // First try with user_type column (new schema)
    let profile = null
    let profileError = null
    
    try {
      const result = await supabaseAdmin
        .from('profiles')
        .select('user_type, is_admin')
        .eq('id', user.id)
        .single()
      profile = result.data
      profileError = result.error
    } catch (e) {
      console.log('First query failed, trying without user_type')
    }

    // If user_type column doesn't exist, fall back to just checking is_admin
    if (profileError?.code === '42703' || profileError?.message?.includes('user_type')) {
      console.log('user_type column not found, falling back to is_admin only')
      const fallbackResult = await supabaseAdmin
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      profile = fallbackResult.data
      profileError = fallbackResult.error
    }

    console.log('Profile lookup result:', { profile, error: profileError })

    if (profileError) {
      console.error('Profile lookup error:', profileError)
    }

    const isAdmin = (profile as any)?.user_type === 'admin' || (profile as any)?.is_admin === true
    console.log('Is admin check:', isAdmin, { userType: (profile as any)?.user_type, isAdminFlag: (profile as any)?.is_admin })

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

    console.log('Fetched users:', users?.length || 0, 'users')
    if (users && users.length > 0) {
      console.log('First user:', JSON.stringify(users[0], null, 2))
      // Debug logging for all users to see their actual values
      users.forEach((user: any, index: number) => {
        console.log(`User ${index}:`, {
          id: user.id,
          email: user.email,
          username: user.username,
          user_type: user.user_type,
          is_admin: user.is_admin,
          is_active: user.is_active
        });
      });
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

    // Check if user is admin (with fallback for missing user_type column)
    let adminProfile = null
    let profileError = null
    
    try {
      const result = await supabaseAdmin
        .from('profiles')
        .select('user_type, is_admin')
        .eq('id', user.id)
        .single()
      adminProfile = result.data
      profileError = result.error
    } catch (e) {
      console.log('First query failed')
    }

    // If user_type column doesn't exist, fall back to just checking is_admin
    if (profileError?.code === '42703' || profileError?.message?.includes('user_type')) {
      const fallbackResult = await supabaseAdmin
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      adminProfile = fallbackResult.data
      profileError = fallbackResult.error
    }

    const isAdmin = (adminProfile as any)?.user_type === 'admin' || (adminProfile as any)?.is_admin === true

    if (profileError || !isAdmin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email, username, user_type } = body

    if (!email) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email is required' } },
        { status: 400 }
      )
    }

    // Validate user_type
    const validUserType = user_type === 'admin' ? 'admin' : 'normal'

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

    // Update the profile with user_type
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        user_type: validUserType,
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
        user_type: validUserType,
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