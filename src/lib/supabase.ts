/**
 * Supabase client configuration and initialization
 * Provides browser and server client types
 */

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

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
      detectSessionInUrl: true,
      storage: {
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null
          const cookies = document.cookie.split(';')
          for (const cookie of cookies) {
            const [cookieKey, cookieValue] = cookie.trim().split('=')
            if (cookieKey === key) return decodeURIComponent(cookieValue)
          }
          return window.localStorage.getItem(key)
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/; SameSite=Lax`
          window.localStorage.setItem(key, value)
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          window.localStorage.removeItem(key)
        }
      }
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
export async function createServerSupabaseClient() {
  const { cookies } = require('next/headers')
  const cookieStore = await cookies()

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
export async function createAuthenticatedSupabaseClient(request: Request) {
  const { cookies } = require('next/headers')
  const cookieStore = await cookies()

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
