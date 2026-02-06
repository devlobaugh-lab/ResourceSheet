import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug GP guides API called')
    
    // Try to get user from Authorization header first
    let user = null
    const authHeader = request.headers.get('authorization')
    console.log('📋 Auth header:', authHeader)

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      console.log('🔑 Token received:', token.substring(0, 20) + '...')
      
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
          )
          console.log('👤 JWT payload:', payload)

          if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
            user = {
              id: payload.sub,
              email: payload.email,
              user_metadata: payload.user_metadata || {},
              app_metadata: payload.app_metadata || {},
            }
            console.log('✅ User authenticated from JWT:', user.id)
          } else {
            console.log('❌ JWT expired')
          }
        }
      } catch (error) {
        console.warn('⚠️ JWT validation failed:', error)
      }
    }

    // If JWT didn't work, try cookie-based auth
    if (!user) {
      console.log('🔄 Trying cookie-based auth...')
      try {
        const supabase = createServerSupabaseClient()
        const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

        if (!authError && cookieUser) {
          user = cookieUser
          console.log('✅ User authenticated from cookies:', user.id)
        } else {
          console.log('❌ Cookie auth failed:', authError)
        }
      } catch (error) {
        console.log('⚠️ Cookie auth error:', error)
      }
    }

    if (!user) {
      console.log('❌ No user found - returning 401')
      return NextResponse.json(
        { 
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          debug: {
            authHeader: authHeader,
            user: null
          }
        },
        { status: 401 }
      )
    }

    console.log('🎉 Authentication successful:', user.id)
    
    return NextResponse.json({
      message: 'Authentication working',
      user: {
        id: user.id,
        email: user.email
      }
    })

  } catch (error) {
    console.error('💥 Debug API error:', error)
    return NextResponse.json(
      { 
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
        debug: { error: error.message }
      },
      { status: 500 }
    )
  }
}