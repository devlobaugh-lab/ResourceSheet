import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'

// Helper to verify admin access
async function verifyAdmin(request: NextRequest) {
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
    return { authorized: false, userId: null, error: 'UNAUTHORIZED' }
  }

  // Get the authenticated user (more secure than using session.user directly)
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('User error:', userError)
    return { authorized: false, userId: null, error: 'UNAUTHORIZED' }
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('is_admin, id')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_admin === true

  if (profileError || !isAdmin) {
    return { authorized: false, userId: null, error: 'FORBIDDEN' }
  }

  return { authorized: true, userId: user.id, error: null }
}

// PATCH /api/admin/users/[id] - Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, userId, error } = await verifyAdmin(request)
    
    if (!authorized) {
      return NextResponse.json(
        { error: { code: error, message: error === 'UNAUTHORIZED' ? 'Authentication required' : 'Admin access required' } },
        { status: error === 'UNAUTHORIZED' ? 401 : 403 }
      )
    }

    const targetUserId = params.id
    const body = await request.json()
    const { username, is_admin: makeAdmin, is_active } = body

    // Prevent admin from removing their own admin status
    if (targetUserId === userId && makeAdmin === false) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You cannot remove your own admin status' } },
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = {}
    if (username !== undefined) updates.username = username || null
    if (makeAdmin !== undefined) updates.is_admin = makeAdmin === true
    if (is_active !== undefined) updates.is_active = is_active

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } },
        { status: 400 }
      )
    }

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', targetUserId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to update user' } },
        { status: 500 }
      )
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: updatedProfile })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, userId, error } = await verifyAdmin(request)
    
    if (!authorized) {
      return NextResponse.json(
        { error: { code: error, message: error === 'UNAUTHORIZED' ? 'Authentication required' : 'Admin access required' } },
        { status: error === 'UNAUTHORIZED' ? 401 : 403 }
      )
    }

    const targetUserId = params.id

    // Prevent admin from deleting themselves
    if (targetUserId === userId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You cannot delete your own account' } },
        { status: 403 }
      )
    }

    // Check if user exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, username')
      .eq('id', targetUserId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    // Try to delete the user from auth first (this should cascade to profiles)
    let deleteError = null;
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)
      deleteError = error;
    } catch (authError) {
      console.error('Auth delete failed, trying manual deletion:', authError);
      deleteError = authError;
    }

    // If auth delete failed, try manual deletion from profiles
    if (deleteError) {
      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', targetUserId);

      if (profileDeleteError) {
        return NextResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: `Failed to delete user: ${profileDeleteError.message}` } },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: targetUserId,
        email: profile.email,
        username: profile.username
      }
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
