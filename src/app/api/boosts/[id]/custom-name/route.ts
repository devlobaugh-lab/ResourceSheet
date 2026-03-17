import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Validation schema for custom name
const customNameSchema = z.object({
  custom_name: z
    .string()
    .min(1, 'Custom name cannot be empty')
    .max(64, 'Custom name cannot exceed 64 characters')
    .regex(/^[A-Za-z0-9\.\-\s]+$/, 'Only letters, numbers, hyphens, periods, and spaces allowed')
    .refine(name => name.trim().length > 0, 'Custom name cannot be only whitespace')
    .refine(name => name === name.trim(), 'Custom name cannot start or end with spaces')
})

// GET /api/boosts/[id]/custom-name - Get custom name for a boost
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const boostId = id

    // Get the boost's icon
    const { data: boost, error: boostError } = await supabaseAdmin
      .from('boosts')
      .select('icon')
      .eq('id', boostId)
      .single()

    if (boostError || !boost) {
      return NextResponse.json({ error: 'Boost not found' }, { status: 404 })
    }

    const { data: iconData, error } = await supabaseAdmin
      .from('boost_icon_data')
      .select('custom_name')
      .eq('icon_name', boost.icon)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching boost custom name:', error)
      return NextResponse.json(
        { error: 'Failed to fetch custom name' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      custom_name: iconData?.custom_name || null
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/boosts/[id]/custom-name - Set/update custom name for a boost
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
            console.log('✅ Boost custom name authenticated user from JWT token:', user.id)
          }
        }
      } catch (error) {
        console.warn('JWT validation failed:', error)
      }
    }

    // If JWT didn't work, try cookie-based auth
    if (!user) {
      const supabase = await createServerSupabaseClient()
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        console.log('❌ Boost custom name auth failed:', { authError: authError?.message, hasUser: !!user })
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      user = cookieUser
      console.log('✅ Boost custom name authenticated user from cookies:', user.id)
    }

    const boostId = id

    // Check admin status
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Verify boost exists and get its icon
    const { data: boost, error: boostError } = await supabaseAdmin
      .from('boosts')
      .select('id, icon')
      .eq('id', boostId)
      .single()

    if (boostError || !boost) {
      return NextResponse.json(
        { error: 'Boost not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    console.log('Custom name input received:', JSON.stringify(body))

    const validation = customNameSchema.safeParse(body)
    console.log('Validation result:', validation.success, validation.error?.errors)

    if (!validation.success) {
      console.log('Validation failed with error:', validation.error.errors[0].message)
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { custom_name } = validation.data
    const trimmedName = custom_name.trim()

    // Check for duplicate names across all icon data (excluding current boost's icon)
    const { data: existingName } = await supabaseAdmin
      .from('boost_icon_data')
      .select('id')
      .eq('custom_name', trimmedName)
      .neq('icon_name', boost.icon)
      .single()

    if (existingName) {
      return NextResponse.json(
        { error: 'Custom name already exists for another boost' },
        { status: 409 }
      )
    }

    // Upsert by icon_name
    const { error: upsertError } = await supabaseAdmin
      .from('boost_icon_data')
      .upsert({
        icon_name: boost.icon,
        custom_name: trimmedName
      }, {
        onConflict: 'icon_name'
      })

    if (upsertError) {
      console.error('Error upserting boost custom name:', upsertError)
      return NextResponse.json(
        { error: 'Failed to save custom name' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      custom_name: trimmedName
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/boosts/[id]/custom-name - Remove custom name for a boost
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
            console.log('✅ Boost custom name DELETE authenticated user from JWT token:', user.id)
          }
        }
      } catch (error) {
        console.warn('JWT validation failed:', error)
      }
    }

    // If JWT didn't work, try cookie-based auth
    if (!user) {
      const supabase = await createServerSupabaseClient()
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        console.log('❌ Boost custom name DELETE auth failed:', { authError: authError?.message, hasUser: !!user })
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      user = cookieUser
      console.log('✅ Boost custom name DELETE authenticated user from cookies:', user.id)
    }

    const boostId = id

    // Check admin status
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get the boost's icon
    const { data: boost, error: boostLookupError } = await supabaseAdmin
      .from('boosts')
      .select('icon')
      .eq('id', boostId)
      .single()

    if (boostLookupError || !boost) {
      return NextResponse.json({ error: 'Boost not found' }, { status: 404 })
    }

    // Clear the custom name from boost_icon_data (set to null, preserve is_free)
    const { error: deleteError } = await supabaseAdmin
      .from('boost_icon_data')
      .update({ custom_name: null })
      .eq('icon_name', boost.icon)

    if (deleteError) {
      console.error('Error deleting boost custom name:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete custom name' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Custom name removed'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
