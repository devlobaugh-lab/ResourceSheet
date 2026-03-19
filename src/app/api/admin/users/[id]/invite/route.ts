import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'

// POST /api/admin/users/[id]/invite - Generate a new invite link for an existing user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
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

    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
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

    if (profileError || adminProfile?.is_admin !== true) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    // Look up the target user's email
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single()

    if (targetError || !targetProfile?.email) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || ''
    const redirectTo = `${baseUrl}/auth/callback?next=/auth/update-password`

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: targetProfile.email,
      options: { redirectTo },
    })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('Error generating invite link:', linkError)
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to generate invite link' } },
        { status: 500 }
      )
    }

    const inviteLink = `${baseUrl}/auth/invite?th=${linkData.properties.hashed_token}`
    return NextResponse.json({ invite_link: inviteLink })

  } catch (error) {
    console.error('Generate invite link error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
