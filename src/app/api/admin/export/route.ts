import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase'

// GET /api/admin/export - Export admin backup (all user data + admin-managed system config)
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

    const userId = user.id

    const data: Record<string, unknown> = {}

    // === USER DATA (all users) ===
    const { data: userDrivers } = await supabaseAdmin.from('user_drivers').select('*')
    data.userDrivers = userDrivers || []

    const { data: userCarParts } = await supabaseAdmin.from('user_car_parts').select('*')
    data.userCarParts = userCarParts || []

    const { data: userBoosts } = await supabaseAdmin.from('user_boosts').select('*')
    data.userBoosts = userBoosts || []

    const { data: userTrackGuides } = await supabaseAdmin.from('user_track_guides').select('*')
    data.userTrackGuides = userTrackGuides || []

    const { data: userTrackGuideDrivers } = await supabaseAdmin.from('user_track_guide_drivers').select('*')
    data.userTrackGuideDrivers = userTrackGuideDrivers || []

    const { data: userGpGuides } = await supabaseAdmin.from('user_gp_guides').select('*')
    data.userGpGuides = userGpGuides || []

    const { data: userGpGuideTracks } = await supabaseAdmin.from('user_gp_guide_tracks').select('*')
    data.userGpGuideTracks = userGpGuideTracks || []

    const { data: userGpGuideResults } = await supabaseAdmin.from('user_gp_guide_results').select('*')
    data.userGpGuideResults = userGpGuideResults || []

    const { data: userCarSetups } = await supabaseAdmin.from('user_car_setups').select('*')
    data.userCarSetups = userCarSetups || []

    // User rotation data (all users)
    const { data: userRotationSeriesData } = await supabaseAdmin.from('user_rotation_series_data').select('*')
    data.userRotationSeriesData = userRotationSeriesData || []

    const { data: userRotationTrackData } = await supabaseAdmin.from('user_rotation_track_data').select('*')
    data.userRotationTrackData = userRotationTrackData || []

    // === ADMIN-MANAGED SYSTEM CONFIG (not content cache) ===
    const { data: seasons } = await supabaseAdmin.from('seasons').select('*').order('created_at')
    data.seasons = seasons || []

    const { data: trackNameAliases } = await supabaseAdmin.from('track_name_aliases').select('id, system_name, display_name')
    data.trackNameAliases = trackNameAliases || []

    const { data: boostIconData } = await supabaseAdmin.from('boost_icon_data').select('icon_name, custom_name, is_free')
    data.boostIconData = boostIconData || []

    const { data: trackRotationSets } = await supabaseAdmin.from('track_rotation_sets').select('*').order('set_number')
    data.trackRotationSets = trackRotationSets || []

    const { data: trackRotationSchedule } = await supabaseAdmin.from('track_rotation_schedule').select('*').order('start_date')
    data.trackRotationSchedule = trackRotationSchedule || []

    return NextResponse.json({
      version: '2.0',
      exportType: 'adminBackup',
      exportedAt: new Date().toISOString(),
      data
    })

  } catch (error) {
    console.error('Admin export error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
