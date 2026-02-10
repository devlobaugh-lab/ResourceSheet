import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'

/**
 * Represents an authenticated user from either JWT or cookie-based auth
 */
export interface AuthenticatedUser {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
  aud?: string
  created_at?: string
  updated_at?: string
}

/**
 * Generic authentication provider interface
 */
export interface AuthProvider {
  getUser(request: NextRequest): Promise<{ user: AuthenticatedUser | null; error: Error | null }>
  getSession(request: NextRequest): Promise<{ session: { user: AuthenticatedUser } | null; error: Error | null }>
}

// Middleware-based implementation
export class MiddlewareAuthProvider implements AuthProvider {
  async getUser(request: NextRequest) {
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

      const { data: { user }, error } = await supabase.auth.getUser()
      return { user: user as AuthenticatedUser | null, error: error as Error | null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  }

  async getSession(request: NextRequest) {
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

      const { data: { session }, error } = await supabase.auth.getSession()
      return { 
        session: session ? { user: session.user as AuthenticatedUser } : null, 
        error: error as Error | null 
      }
    } catch (error) {
      return { session: null, error: error as Error }
    }
  }
}

// Client-side JWT-based implementation
export class ClientAuthProvider implements AuthProvider {
  async getUser(request: NextRequest) {
    try {
      // Extract JWT token from Authorization header
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null, error: new Error('No authorization token') }
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix

      // For local development, implement simple JWT validation
      // This trusts that if a properly formatted JWT is present, the user is authenticated
      try {
        const parts = token.split('.')
        if (parts.length !== 3) {
          throw new Error('Invalid JWT format')
        }

        // Decode payload without signature verification (for local dev only)
        const payload = JSON.parse(
          Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
        ) as Record<string, unknown>

        // Check if token is not expired
        const exp = payload.exp as number | undefined
        if (exp && exp < Math.floor(Date.now() / 1000)) {
          throw new Error('Token expired')
        }

        // Create a mock user object for local development
        const mockUser: AuthenticatedUser = {
          id: (payload.sub as string) || 'local-user',
          email: (payload.email as string) || `user-${(payload.sub as string) || 'local'}@local.dev`,
          user_metadata: (payload.user_metadata as Record<string, unknown>) || {},
          app_metadata: (payload.app_metadata as Record<string, unknown>) || {},
          aud: payload.aud as string,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        return { user: mockUser, error: null }
      } catch (jwtError) {
        return { user: null, error: jwtError as Error }
      }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  }

  async getSession(request: NextRequest) {
    try {
      // For client-side auth, we mainly care about user validation
      // Sessions are managed client-side
      const { user, error } = await this.getUser(request)
      return {
        session: user ? { user } : null,
        error
      }
    } catch (error) {
      return { session: null, error: error as Error }
    }
  }
}

// Factory to create auth provider
export function createAuthProvider(): AuthProvider {
  // Try middleware first, fallback to client-side
  const providerType = process.env.AUTH_PROVIDER || 'middleware'

  switch (providerType) {
    case 'middleware':
      return new MiddlewareAuthProvider()
    case 'client':
      return new ClientAuthProvider()
    default:
      return new MiddlewareAuthProvider()
  }
}

/**
 * Convenience function to get authenticated user from a request
 * Tries JWT first, then falls back to provider method
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const provider = createAuthProvider()
  const { user } = await provider.getUser(request)
  return user
}

/**
 * Require authentication - throws if user not found
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

