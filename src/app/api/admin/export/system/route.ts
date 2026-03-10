import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, createAuthenticatedSupabaseClient } from '@/lib/supabase'

// GET /api/admin/export/system - Export admin-managed system configuration
export async function GET(request: NextRequest) {
  try {
    const supabase = createAuthenticatedSupabaseClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profile?.is_admin !== true) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }

    const { data: seasons } = await supabaseAdmin.from('seasons').select('*').order('created_at')
    const { data: trackNameAliases } = await supabaseAdmin.from('track_name_aliases').select('id, system_name, display_name')
    const { data: boostOverrides } = await supabaseAdmin.from('boosts').select('id, is_free')
    const { data: boostCustomNames } = await supabaseAdmin.from('boost_custom_names').select('*')

    return NextResponse.json({
      version: '1.0',
      exportType: 'systemData',
      exportedAt: new Date().toISOString(),
      data: {
        seasons: seasons || [],
        trackNameAliases: trackNameAliases || [],
        boostOverrides: boostOverrides || [],
        boostCustomNames: boostCustomNames || [],
      }
    })

  } catch (error) {
    console.error('System export error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
