import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase'

// Validation schema for import data
const importDataSchema = z.object({
  boostIconData: z.array(z.object({
    icon_name: z.string(),
    custom_name: z.string().nullable().optional(),
    is_free: z.boolean().optional()
  })).optional()
})

// POST /api/import-admin-data - Import admin data (custom boost names + free boost flags) (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createAuthenticatedSupabaseClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

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

    const boostIconDataCount = validatedData.boostIconData?.length || 0

    console.log('Import admin data received:', { boostIconDataCount })

    // Handle boost icon data import (upsert by icon_name)
    if (validatedData.boostIconData && validatedData.boostIconData.length > 0) {
      for (const item of validatedData.boostIconData) {
        const { data: existing } = await supabaseAdmin
          .from('boost_icon_data').select('id').eq('icon_name', item.icon_name).single()
        if (existing) {
          await supabaseAdmin.from('boost_icon_data')
            .update({ custom_name: item.custom_name ?? null, is_free: item.is_free ?? false })
            .eq('id', existing.id)
        } else {
          await supabaseAdmin.from('boost_icon_data').insert({
            icon_name: item.icon_name,
            custom_name: item.custom_name ?? null,
            is_free: item.is_free ?? false
          })
        }
      }
      console.log('Successfully imported boost icon data')
    }

    return NextResponse.json({
      message: 'Admin data imported successfully',
      imported: { boostIconData: boostIconDataCount }
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
