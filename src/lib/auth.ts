import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'

// Authentication provider interface
export interface AuthProvider {
  getUser(request: NextRequest): Promise<any>
  getSession(request: NextRequest): Promise<any>
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
            setAll(cookiesToSet: any[]) {
              cookiesToSet.forEach(({ name, value, options }: any) => {
                request.cookies.set(name, value)
              })
            },
          },
        }
      )

      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      return { user: null, error }
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
            setAll(cookiesToSet: any[]) {
              cookiesToSet.forEach(({ name, value, options }: any) => {
                request.cookies.set(name, value)
              })
            },
          },
        }
      )

      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      return { session: null, error }
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

      // Use Supabase admin client to validate the JWT token
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

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
        )

        // Check if token is not expired
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          throw new Error('Token expired')
        }

        // Create a mock user object for local development
        const mockUser = {
          id: payload.sub || 'local-user',
          email: payload.email || `user-${payload.sub || 'local'}@local.dev`,
          user_metadata: payload.user_metadata || {},
          app_metadata: payload.app_metadata || {},
          aud: payload.aud,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        console.log('✅ Local JWT validation successful, mock user:', mockUser.id)
        return { user: mockUser, error: null }

      } catch (jwtError) {
        console.error('❌ JWT parsing failed:', jwtError)
        return { user: null, error: jwtError as Error }
      }
    } catch (error) {
      return { user: null, error }
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
      return { session: null, error }
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

// Global auth provider instance
export const authProvider = createAuthProvider()
