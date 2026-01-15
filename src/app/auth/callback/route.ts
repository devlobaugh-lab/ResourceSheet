import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔄 Auth callback called')

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('📋 Auth params:', { hasCode: !!code, next })

  if (code) {
    console.log('🔑 Exchanging code for session...')

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookies = request.cookies.getAll()
            console.log('📤 Auth callback getting cookies:', cookies.map(c => c.name))
            return cookies
          },
          setAll(cookiesToSet) {
            console.log('📥 Auth callback setting cookies:', cookiesToSet.map(c => c.name))
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('🔄 Exchange result:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
      error: error?.message
    })

    if (!error && data.session) {
      console.log('✅ Session created successfully, redirecting...')
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.log('❌ Session exchange failed:', error?.message)
    }
  } else {
    console.log('❌ No code parameter received')
  }

  // return the user to an error page with instructions
  console.log('🔄 Redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
