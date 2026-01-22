import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

// Validation schema for import data
const importDataSchema = z.object({
  boostCustomNames: z.array(z.object({
    boost_id: z.string(),
    custom_name: z.string()
  })).optional(),
  freeBoosts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    is_free: z.boolean()
  })).optional()
})

// POST /api/import-admin-data - Import admin data (custom boost names + free boost flags) (admin only)
export async function POST(request: NextRequest) {
  try {
    // Try to get user from Authorization header first, then fall back to cookies
    let user = null
    const authHeader = request.headers.get('authorization')

    if (authHeader?.startsWith('Bearer ')) {
      // Try to validate JWT token directly
      const token = authHeader.substring(7)
      try {
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
            console.log('✅ Authenticated user from JWT token:', user.id)
          }
        }
      } catch (error) {
        console.warn('JWT validation failed:', error)
      }
    }

    // If JWT didn't work, try cookie-based auth
    if (!user) {
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
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        )
      }
      user = cookieUser
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = importDataSchema.parse(body)

    const customNamesCount = validatedData.boostCustomNames?.length || 0
    const freeBoostsCount = validatedData.freeBoosts?.length || 0

    console.log('Import admin data received:', {
      customNamesCount,
      freeBoostsCount
    })

    // Handle custom boost names import
    if (validatedData.boostCustomNames && validatedData.boostCustomNames.length > 0) {
      // Validate boost IDs exist
      const boostIds = validatedData.boostCustomNames.map(item => item.boost_id)
      const { data: existingBoosts, error: boostsError } = await supabaseAdmin
        .from('boosts')
        .select('id')
        .in('id', boostIds)

      if (boostsError) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Failed to validate boost IDs for custom names' } },
          { status: 400 }
        )
      }

      const existingBoostIds = new Set((existingBoosts || []).map(item => item.id))
      const invalidIds = boostIds.filter(id => !existingBoostIds.has(id))

      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: `Invalid boost IDs for custom names: ${invalidIds.join(', ')}` } },
          { status: 400 }
        )
      }

      // Delete existing custom names and insert new ones
      console.log('Deleting existing custom names for boosts:', boostIds)
      await supabaseAdmin
        .from('boost_custom_names')
        .delete()
        .in('boost_id', boostIds)

      const customNamesToInsert = validatedData.boostCustomNames.map(item => ({
        boost_id: item.boost_id,
        custom_name: item.custom_name
      }))

      console.log('Inserting custom names:', customNamesToInsert.length)
      const { error: insertError } = await supabaseAdmin
        .from('boost_custom_names')
        .insert(customNamesToInsert)

      if (insertError) {
        console.error('Custom names insert error:', insertError)
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: 'Failed to import custom boost names' } },
          { status: 500 }
        )
      }
      console.log('Successfully imported custom boost names')
    }

    // Handle free boost flags import
    if (validatedData.freeBoosts && validatedData.freeBoosts.length > 0) {
      // First, set all boosts to not free
      console.log('Resetting all boost free flags to false')
      await supabaseAdmin
        .from('boosts')
        .update({ is_free: false })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Update all except non-existent ID

      // Then set specified boosts to free
      const freeBoostIds = validatedData.freeBoosts.map(item => item.id)
      console.log('Setting free boosts:', freeBoostIds)

      const { error: freeBoostsError } = await supabaseAdmin
        .from('boosts')
        .update({ is_free: true })
        .in('id', freeBoostIds)

      if (freeBoostsError) {
        console.error('Free boosts update error:', freeBoostsError)
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: 'Failed to import free boost flags' } },
          { status: 500 }
        )
      }
      console.log('Successfully imported free boost flags')
    }

    return NextResponse.json({
      message: 'Admin data imported successfully',
      imported: {
        customNames: customNamesCount,
        freeBoosts: freeBoostsCount
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid import data format', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Import admin data error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
