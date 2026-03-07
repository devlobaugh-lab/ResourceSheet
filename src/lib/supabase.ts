/**
 * Supabase client configuration and initialization
 * Provides three different client types for different use cases
 */

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

/**
 * Server-side admin client with full privileges
 * Uses the service role key for unrestricted database access
 * Should only be used in server-side code (API routes, server components)
 *
 * @example
 * const { data, error } = await supabaseAdmin
 *   .from('users')
 *   .select('*')
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * Client-side public client with user-level privileges
 * Uses the anonymous key and respects Row-Level Security (RLS) policies
 * Safe to use in browser code
 *
 * @example
 * const { data, error } = await supabase
 *   .from('public_items')
 *   .select('*')
 */
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

/**
 * Create a server-side client for API routes that handles cookies
 * Automatically manages authentication tokens via cookies
 * Should be used in Next.js API routes and server functions
 *
 * @returns A Supabase client configured to handle cookie-based sessions
 *
 * @example
 * const supabase = createServerSupabaseClient()
 * const { data: { user } } = await supabase.auth.getUser()
 */
export function createServerSupabaseClient() {
  const { cookies } = require('next/headers')
  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}

/**
 * Create a server-side client for API routes that handles both cookies and request headers
 * This client passes the user's JWT from the request Authorization header to PostgreSQL
 * enabling proper Row-Level Security (RLS) policy enforcement
 * Should be used in Next.js API routes that need RLS enforcement
 *
 * @param request - The NextRequest object containing the Authorization header
 * @returns A Supabase client configured to handle both cookie-based sessions and request headers
 *
 * @example
 * const supabase = createAuthenticatedSupabaseClient(request)
 * const { data: { user } } = await supabase.auth.getUser()
 * // Database queries will now respect RLS policies
 */
export function createAuthenticatedSupabaseClient(request: Request) {
  const { cookies } = require('next/headers')
  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
      global: {
        headers: {
          Authorization: request.headers.get('authorization') || ''
        }
      }
    }
  )
}
