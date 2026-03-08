import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/export-full-backup - Export ALL data for disaster recovery (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin
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

    const isAdmin = profile?.is_admin === true
    if (!isAdmin) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }

    const data: Record<string, unknown> = {}

    // === GLOBAL DATA ===
    const { data: seasons } = await supabaseAdmin.from('seasons').select('*')
    data.seasons = seasons || []

    const { data: drivers } = await supabaseAdmin.from('drivers').select('*')
    data.drivers = drivers || []

    const { data: carParts } = await supabaseAdmin.from('car_parts').select('*')
    data.carParts = carParts || []

    const { data: boosts } = await supabaseAdmin.from('boosts').select('*')
    data.boosts = boosts || []

    const { data: tracks } = await supabaseAdmin.from('tracks').select('*')
    data.tracks = tracks || []

    const { data: boostCustomNames } = await supabaseAdmin.from('boost_custom_names').select('*')
    data.boostCustomNames = boostCustomNames || []

    // === USER DATA ===
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

    return NextResponse.json({
      version: '1.0',
      exportType: 'fullBackup',
      exportedAt: new Date().toISOString(),
      data
    })

  } catch (error) {
    console.error('Export full backup error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}