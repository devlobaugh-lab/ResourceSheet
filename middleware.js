import { NextResponse } from 'next/server'
import { createAuthProvider } from './src/lib/auth'

const authProvider = createAuthProvider()

/**
 * Middleware to handle authentication checks
 * Currently minimal - can be expanded for auth-specific route handling
 */
export async function middleware(request) {
  try {
    // Test auth provider
    const { user, error } = await authProvider.getUser(request)

    const response = NextResponse.next()
    response.headers.set('X-Middleware-Working', 'yes')
    response.headers.set('X-Auth-User', user?.id || 'none')

    return response
  } catch (error) {
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
