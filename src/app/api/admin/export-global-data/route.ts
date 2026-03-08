import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/export-global-data - Export global/admin-configured data (admin only)
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

    // Export global data
    const data: Record<string, unknown> = {}

    // Seasons
    const { data: seasons } = await supabaseAdmin.from('seasons').select('*').order('created_at')
    data.seasons = seasons || []

    // Tracks
    const { data: tracks } = await supabaseAdmin.from('tracks').select('*').order('name')
    data.tracks = tracks || []

    // Boost custom names (admin-configured)
    const { data: boostCustomNames } = await supabaseAdmin.from('boost_custom_names').select('*')
    data.boostCustomNames = boostCustomNames || []

    // Boosts with is_free flag
    const { data: boosts } = await supabaseAdmin.from('boosts').select('*').order('name')
    data.boosts = boosts || []

    return NextResponse.json({
      version: '1.0',
      exportType: 'globalData',
      exportedAt: new Date().toISOString(),
      data
    })

  } catch (error) {
    console.error('Export global data error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}