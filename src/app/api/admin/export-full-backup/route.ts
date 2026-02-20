import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/export-full-backup - Export ALL data for disaster recovery (admin only)
export async function GET(request: NextRequest) {
  console.log('📤 Admin export full backup called')
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
      .select('user_type, is_admin')
      .eq('id', userId)
      .single()

    const isAdmin = profile?.user_type === 'admin' || profile?.is_admin === true
    if (!isAdmin) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }

    const data: Record<string, unknown> = {}

    // === GLOBAL DATA ===
    console.log('Exporting global data...')
    
    const { data: seasons } = await supabaseAdmin.from('seasons').select('*')
    data.seasons = seasons || []
    console.log(`  ✅ seasons: ${seasons?.length || 0}`)

    const { data: drivers } = await supabaseAdmin.from('drivers').select('*')
    data.drivers = drivers || []
    console.log(`  ✅ drivers: ${drivers?.length || 0}`)

    const { data: carParts } = await supabaseAdmin.from('car_parts').select('*')
    data.carParts = carParts || []
    console.log(`  ✅ car_parts: ${carParts?.length || 0}`)

    const { data: boosts } = await supabaseAdmin.from('boosts').select('*')
    data.boosts = boosts || []
    console.log(`  ✅ boosts: ${boosts?.length || 0}`)

    const { data: tracks } = await supabaseAdmin.from('tracks').select('*')
    data.tracks = tracks || []
    console.log(`  ✅ tracks: ${tracks?.length || 0}`)

    const { data: boostCustomNames } = await supabaseAdmin.from('boost_custom_names').select('*')
    data.boostCustomNames = boostCustomNames || []
    console.log(`  ✅ boost_custom_names: ${boostCustomNames?.length || 0}`)

    // === USER DATA ===
    console.log('Exporting user data...')

    const { data: userDrivers } = await supabaseAdmin.from('user_drivers').select('*')
    data.userDrivers = userDrivers || []
    console.log(`  ✅ user_drivers: ${userDrivers?.length || 0}`)

    const { data: userCarParts } = await supabaseAdmin.from('user_car_parts').select('*')
    data.userCarParts = userCarParts || []
    console.log(`  ✅ user_car_parts: ${userCarParts?.length || 0}`)

    const { data: userBoosts } = await supabaseAdmin.from('user_boosts').select('*')
    data.userBoosts = userBoosts || []
    console.log(`  ✅ user_boosts: ${userBoosts?.length || 0}`)

    const { data: userTrackGuides } = await supabaseAdmin.from('user_track_guides').select('*')
    data.userTrackGuides = userTrackGuides || []
    console.log(`  ✅ user_track_guides: ${userTrackGuides?.length || 0}`)

    const { data: userTrackGuideDrivers } = await supabaseAdmin.from('user_track_guide_drivers').select('*')
    data.userTrackGuideDrivers = userTrackGuideDrivers || []
    console.log(`  ✅ user_track_guide_drivers: ${userTrackGuideDrivers?.length || 0}`)

    const { data: userGpGuides } = await supabaseAdmin.from('user_gp_guides').select('*')
    data.userGpGuides = userGpGuides || []
    console.log(`  ✅ user_gp_guides: ${userGpGuides?.length || 0}`)

    const { data: userGpGuideTracks } = await supabaseAdmin.from('user_gp_guide_tracks').select('*')
    data.userGpGuideTracks = userGpGuideTracks || []
    console.log(`  ✅ user_gp_guide_tracks: ${userGpGuideTracks?.length || 0}`)

    const { data: userGpGuideResults } = await supabaseAdmin.from('user_gp_guide_results').select('*')
    data.userGpGuideResults = userGpGuideResults || []
    console.log(`  ✅ user_gp_guide_results: ${userGpGuideResults?.length || 0}`)

    const { data: userCarSetups } = await supabaseAdmin.from('user_car_setups').select('*')
    data.userCarSetups = userCarSetups || []
    console.log(`  ✅ user_car_setups: ${userCarSetups?.length || 0}`)

    console.log('📤 Full backup complete')
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