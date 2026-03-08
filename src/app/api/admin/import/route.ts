import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { createBoostSchema, createSeasonSchema } from '@/lib/validation'

// Import data schema
const importDataSchema = z.object({
  type: z.enum(['boosts', 'seasons']),
  data: z.array(z.object({
    name: z.string(),
    series: z.number(),
    season_id: z.string().optional(),
    icon: z.string().optional(),
    // Boost-specific fields
    boost_stats: z.any().optional(),
    is_free: z.boolean().optional(),
    // Season-specific fields
    is_active: z.boolean().optional(),
  })),
  truncate: z.boolean().default(false)
})

// POST /api/admin/import - Bulk import data (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Check admin status
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, data: importData, truncate } = importDataSchema.parse(body)

    // Truncate existing data if requested
    if (truncate) {
      const { error: truncateError } = await supabaseAdmin
        .from(type)
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (truncateError) {
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: `Failed to truncate ${type}: ${truncateError.message}` } },
          { status: 500 }
        )
      }
    }

    let result: { count: number; data: any[] }

    if (type === 'boosts') {
      // Validate and transform data for boosts
      const validatedBoosts = importData.map(item => {
        const validated = createBoostSchema.parse({
          name: item.name,
          icon: item.icon,
          boost_stats: item.boost_stats,
          is_free: item.is_free || false,
        })
        return validated
      })

      const { data, error } = await supabaseAdmin
        .from('boosts')
        .insert(validatedBoosts)
        .select()

      if (error) {
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: error.message } },
          { status: 500 }
        )
      }

      result = { count: data?.length || 0, data: data || [] }
    }
    else if (type === 'seasons') {
      // Validate and transform data for seasons
      const validatedSeasons = importData.map(item => {
        const validated = createSeasonSchema.parse({
          name: item.name,
          is_active: item.is_active || false
        })
        return validated
      })

      const { data, error } = await supabaseAdmin
        .from('seasons')
        .insert(validatedSeasons)
        .select()

      if (error) {
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: error.message } },
          { status: 500 }
        )
      }

      result = { count: data?.length || 0, data: data || [] }
    } else {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid import type' } },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `Successfully imported ${result.count} records into ${type}`,
      data: result.data
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid import data', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Admin import POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
