import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase'

// GET /api/admin/export/system - Export admin-managed system configuration
export async function GET(request: NextRequest) {
  try {
    const supabase = await createAuthenticatedSupabaseClient(request)
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
    const { data: boostIconData } = await supabaseAdmin.from('boost_icon_data').select('icon_name, custom_name, is_free')
    const { data: trackRotationSets } = await supabaseAdmin.from('track_rotation_sets').select('*').order('set_number')
    const { data: trackRotationSchedule } = await supabaseAdmin.from('track_rotation_schedule').select('*').order('start_date')
    const { data: profiles } = await supabaseAdmin.from('profiles').select('id, username, is_admin, is_active')
    const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers()
    const authEmailById = new Map((authUsersData?.users ?? []).map(u => [u.id, u.email]))
    const users = (profiles ?? []).map(p => ({
      email: authEmailById.get(p.id) ?? null,
      username: p.username,
      is_admin: p.is_admin,
      is_active: p.is_active,
    })).filter(u => u.email)

    return NextResponse.json({
      version: '1.1',
      exportType: 'systemData',
      exportedAt: new Date().toISOString(),
      data: {
        seasons: seasons || [],
        trackNameAliases: trackNameAliases || [],
        boostIconData: boostIconData || [],
        trackRotationSets: trackRotationSets || [],
        trackRotationSchedule: trackRotationSchedule || [],
        users,
      }
    })

  } catch (error) {
    console.error('System export error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
