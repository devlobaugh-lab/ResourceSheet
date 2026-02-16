import { NextRequest, NextResponse } from 'next/server'
import { createAuthProvider } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug API called')

    // Check authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔍 Auth header present:', !!authHeader)

    if (authHeader) {
      console.log('🔍 Auth header starts with:', authHeader.substring(0, 20) + '...')
    }

    // Test auth provider
    console.log('🔍 Testing auth provider...')
    const authProvider = createAuthProvider()
    const { user, error } = await authProvider.getUser(request)

    console.log('🔍 Auth provider result:', {
      hasUser: !!user,
      userId: user?.id,
      error: error instanceof Error ? error.message : String(error)
    })

    return NextResponse.json({
      success: true,
      authHeader: authHeader ? 'present' : 'missing',
      authProvider: process.env.AUTH_PROVIDER || 'middleware',
      user: user ? { id: user.id, email: user.email } : null,
      error: error?.message
    })

  } catch (error) {
    console.error('❌ Debug API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
