import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/export - Export admin backup (all user data + admin-managed system config)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let userId = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
          )
          if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
            userId = payload.sub
          }
        }
      } catch (e) {
        console.warn('JWT parse failed')
      }
    }

    if (!userId) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (profile?.is_admin !== true) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }

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

    // === ADMIN-MANAGED SYSTEM CONFIG (not content cache) ===
    const { data: seasons } = await supabaseAdmin.from('seasons').select('*').order('created_at')
    data.seasons = seasons || []

    const { data: trackNameAliases } = await supabaseAdmin.from('track_name_aliases').select('id, system_name, display_name')
    data.trackNameAliases = trackNameAliases || []

    const { data: boostCustomNames } = await supabaseAdmin.from('boost_custom_names').select('*')
    data.boostCustomNames = boostCustomNames || []

    // Boosts: export only id + is_free (content cache fields excluded)
    const { data: boosts } = await supabaseAdmin.from('boosts').select('id, is_free')
    data.boosts = boosts || []

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
