import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase'

// GET /api/admin/export/users - Export all users' personal data
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

    const { data: allProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, username, active_season_id')

    const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers()
    const authUserMap = new Map(authUsersData?.users.map(u => [u.id, u.email]) ?? [])

    const users = []

    for (const userProfile of allProfiles || []) {
      const userId = userProfile.id

      const [
        { data: userDrivers },
        { data: userCarParts },
        { data: userBoosts },
        { data: userCarSetups },
        { data: userTrackGuides },
        { data: userGpGuides },
        { data: userCustomDrivers },
      ] = await Promise.all([
        supabaseAdmin.from('user_drivers').select('*').eq('user_id', userId),
        supabaseAdmin.from('user_car_parts').select('*').eq('user_id', userId),
        supabaseAdmin.from('user_boosts').select('*').eq('user_id', userId),
        supabaseAdmin.from('user_car_setups').select('*').eq('user_id', userId),
        supabaseAdmin.from('user_track_guides').select('*').eq('user_id', userId),
        supabaseAdmin.from('user_gp_guides').select('*').eq('user_id', userId),
        supabaseAdmin.from('user_custom_drivers').select('*').eq('user_id', userId),
      ])

      const trackGuideIds = (userTrackGuides || []).map(g => g.id)
      const gpGuideIds = (userGpGuides || []).map(g => g.id)

      const [
        { data: userTrackGuideDrivers },
        { data: userGpGuideTracks },
        { data: userGpGuideResults },
      ] = await Promise.all([
        trackGuideIds.length
          ? supabaseAdmin.from('user_track_guide_drivers').select('*').in('track_guide_id', trackGuideIds)
          : Promise.resolve({ data: [] }),
        gpGuideIds.length
          ? supabaseAdmin.from('user_gp_guide_tracks').select('*').in('gp_guide_id', gpGuideIds)
          : Promise.resolve({ data: [] }),
        gpGuideIds.length
          ? supabaseAdmin.from('user_gp_guide_results').select('*').in('gp_guide_id', gpGuideIds)
          : Promise.resolve({ data: [] }),
      ])

      users.push({
        userId,
        email: authUserMap.get(userId) ?? null,
        username: userProfile.username,
        active_season_id: userProfile.active_season_id,
        data: {
          userDrivers: userDrivers || [],
          userCarParts: userCarParts || [],
          userBoosts: userBoosts || [],
          userCarSetups: userCarSetups || [],
          userTrackGuides: userTrackGuides || [],
          userTrackGuideDrivers: userTrackGuideDrivers || [],
          userGpGuides: userGpGuides || [],
          userGpGuideTracks: userGpGuideTracks || [],
          userGpGuideResults: userGpGuideResults || [],
          userCustomDrivers: userCustomDrivers || [],
        }
      })
    }

    return NextResponse.json({
      version: '1.1',
      exportType: 'allUsersData',
      exportedAt: new Date().toISOString(),
      users,
    })

  } catch (error) {
    console.error('Users export error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
