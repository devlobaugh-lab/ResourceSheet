import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'

// GET /api/boosts/custom-names - Get all user's custom boost names
export async function GET(request: NextRequest) {
  try {
    // Try to get user from Authorization header first, then fall back to cookies
    let user = null
    const authHeader = request.headers.get('authorization')

    if (authHeader?.startsWith('Bearer ')) {
      // Try to validate JWT token directly
      const token = authHeader.substring(7)
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )

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
          }
        }
      } catch (error) {
        console.warn('JWT validation failed:', error)
      }
    }

    // If JWT didn't work, try cookie-based auth
    if (!user) {
      try {
        const supabase = createServerSupabaseClient()
        const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

        if (!authError && cookieUser) {
          user = cookieUser
        }
      } catch (error) {
        // Ignore auth errors - custom names are optional
      }
    }

    const userId = user?.id

    if (!userId) {
      return NextResponse.json({})
    }

    // Get user's custom names
    const { data: customNames, error: customNamesError } = await supabaseAdmin
      .from('boost_custom_names')
      .select('boost_id, custom_name')
      .eq('user_id', userId)

    if (customNamesError) {
      console.error('Custom names fetch error:', customNamesError)
      return NextResponse.json({})
    }

    // Convert to object format
    const customNamesMap: { [boostId: string]: string } = {}
    customNames?.forEach(cn => {
      customNamesMap[cn.boost_id] = cn.custom_name
    })

    return NextResponse.json(customNamesMap)

  } catch (error) {
    console.error('Custom names GET error:', error)
    return NextResponse.json({})
  }
}
