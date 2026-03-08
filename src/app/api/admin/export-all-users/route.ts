import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/export-all-users - Export ALL user data across all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin - check Authorization header
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

    // Check admin status
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    const isAdmin = profile?.is_admin === true
    if (!isAdmin) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }

    // Export all user data
    const data: Record<string, unknown> = {}

    // All user_drivers
    const { data: userDrivers } = await supabaseAdmin.from('user_drivers').select('*')
    data.userDrivers = userDrivers || []

    // All user_car_parts
    const { data: userCarParts } = await supabaseAdmin.from('user_car_parts').select('*')
    data.userCarParts = userCarParts || []

    // All user_boosts
    const { data: userBoosts } = await supabaseAdmin.from('user_boosts').select('*')
    data.userBoosts = userBoosts || []

    // All user_track_guides
    const { data: userTrackGuides } = await supabaseAdmin.from('user_track_guides').select('*')
    data.userTrackGuides = userTrackGuides || []

    // All user_track_guide_drivers
    const { data: userTrackGuideDrivers } = await supabaseAdmin.from('user_track_guide_drivers').select('*')
    data.userTrackGuideDrivers = userTrackGuideDrivers || []

    // All user_gp_guides
    const { data: userGpGuides } = await supabaseAdmin.from('user_gp_guides').select('*')
    data.userGpGuides = userGpGuides || []

    // All user_gp_guide_tracks
    const { data: userGpGuideTracks } = await supabaseAdmin.from('user_gp_guide_tracks').select('*')
    data.userGpGuideTracks = userGpGuideTracks || []

    // All user_gp_guide_results
    const { data: userGpGuideResults } = await supabaseAdmin.from('user_gp_guide_results').select('*')
    data.userGpGuideResults = userGpGuideResults || []

    // All user_car_setups
    const { data: userCarSetups } = await supabaseAdmin.from('user_car_setups').select('*')
    data.userCarSetups = userCarSetups || []

    return NextResponse.json({
      version: '1.0',
      exportType: 'allUsers',
      exportedAt: new Date().toISOString(),
      data
    })

  } catch (error) {
    console.error('Export all users error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}