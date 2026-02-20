import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'

// Helper to verify admin access
async function verifyAdmin(request: NextRequest) {
  // Try to get user from Authorization header first
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
          user = {
            id: payload.sub,
            email: payload.email,
          }
        }
      }
    } catch (error) {
      console.warn('JWT validation failed:', error)
    }
  }

  // Fall back to cookie-based auth
  if (!user) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !cookieUser) {
      return { authorized: false, userId: null, error: 'UNAUTHORIZED' }
    }
    user = cookieUser
  }

  // Check if user is admin (with fallback for missing user_type column)
  let profile = null
  let profileError = null
  
  try {
    const result = await supabaseAdmin
      .from('profiles')
      .select('user_type, is_admin, id')
      .eq('id', user.id)
      .single()
    profile = result.data
    profileError = result.error
  } catch (e) {
    console.log('First query failed')
  }

  // If user_type column doesn't exist, fall back to just checking is_admin
  if (profileError?.code === '42703' || profileError?.message?.includes('user_type')) {
    const fallbackResult = await supabaseAdmin
      .from('profiles')
      .select('is_admin, id')
      .eq('id', user.id)
      .single()
    profile = fallbackResult.data
    profileError = fallbackResult.error
  }

  const isAdmin = (profile as any)?.user_type === 'admin' || (profile as any)?.is_admin === true

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
    const { username, user_type, is_active } = body

    // Prevent admin from changing their own user_type
    if (targetUserId === userId && user_type !== undefined) {
      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('user_type, is_admin')
        .eq('id', userId)
        .single()

      const isAdmin = (currentProfile as any)?.user_type === 'admin' || (currentProfile as any)?.is_admin === true
      if (isAdmin && user_type !== 'admin') {
        return NextResponse.json(
          { error: { code: 'FORBIDDEN', message: 'You cannot change your own admin status' } },
          { status: 403 }
        )
      }
    }

    // Build update object
    const updates: Record<string, unknown> = {}
    if (username !== undefined) updates.username = username || null
    if (user_type !== undefined) updates.user_type = user_type === 'admin' ? 'admin' : 'normal'
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

    // Delete the user from auth (this cascades to profiles via ON DELETE CASCADE)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: `Failed to delete user: ${deleteError.message}` } },
        { status: 500 }
      )
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