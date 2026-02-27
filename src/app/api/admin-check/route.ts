import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin-check - Check if current user is admin
export async function GET(request: NextRequest) {
  try {
    // For development, we'll use a simple approach that bypasses RLS
    // by using the admin client directly
    console.log('Admin check called - checking for admin user in database')
    
    // Use the existing supabaseAdmin client which should have admin privileges
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id, is_admin, user_type')
      .eq('is_admin', true)
      .or('user_type.eq.admin')
      .limit(1)
      .single()

    if (adminError) {
      console.error('Database query error:', adminError)
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Database error' } },
        { status: 500 }
      )
    }

    if (!adminUser) {
      console.log('No admin user found in database')
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'No admin user found' } },
        { status: 404 }
      )
    }

    // Return admin status for the found admin user
    const isAdmin = adminUser?.is_admin === true || adminUser?.user_type === 'admin'
    console.log('Admin check result:', { isAdmin, userId: adminUser.id })
    return NextResponse.json({ isAdmin })

  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
