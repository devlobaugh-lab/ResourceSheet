import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/admin/import-global-data - Import global data (admin only, merge strategy)
export async function POST(request: NextRequest) {
  console.log('📥 Admin import global data called')
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

    const body = await request.json()
    const importData = body.data || body

    const results = {
      imported: { seasons: 0, tracks: 0, boostCustomNames: 0, boosts: 0 },
      updated: { seasons: 0, tracks: 0, boostCustomNames: 0, boosts: 0 },
      errors: [] as string[]
    }

    // Import seasons (upsert by id)
    if (importData.seasons?.length) {
      for (const item of importData.seasons) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('seasons')
            .select('id')
            .eq('id', item.id)
            .single()

          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('seasons').update(updateData).eq('id', existing.id)
            results.updated.seasons++
          } else {
            await supabaseAdmin.from('seasons').insert(item)
            results.imported.seasons++
          }
        } catch (e) { results.errors.push(`seasons: ${String(e)}`) }
      }
      console.log(`  ✅ seasons: ${results.imported.seasons} imported, ${results.updated.seasons} updated`)
    }

    // Import tracks (upsert by id)
    if (importData.tracks?.length) {
      for (const item of importData.tracks) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('tracks')
            .select('id')
            .eq('id', item.id)
            .single()

          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('tracks').update(updateData).eq('id', existing.id)
            results.updated.tracks++
          } else {
            await supabaseAdmin.from('tracks').insert(item)
            results.imported.tracks++
          }
        } catch (e) { results.errors.push(`tracks: ${String(e)}`) }
      }
      console.log(`  ✅ tracks: ${results.imported.tracks} imported, ${results.updated.tracks} updated`)
    }

    // Import boost_custom_names (upsert by boost_id)
    if (importData.boostCustomNames?.length) {
      for (const item of importData.boostCustomNames) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('boost_custom_names')
            .select('id')
            .eq('boost_id', item.boost_id)
            .single()

          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('boost_custom_names').update(updateData).eq('id', existing.id)
            results.updated.boostCustomNames++
          } else {
            const { id, ...insertData } = item
            await supabaseAdmin.from('boost_custom_names').insert(insertData)
            results.imported.boostCustomNames++
          }
        } catch (e) { results.errors.push(`boost_custom_names: ${String(e)}`) }
      }
      console.log(`  ✅ boost_custom_names: ${results.imported.boostCustomNames} imported, ${results.updated.boostCustomNames} updated`)
    }

    // Import boosts - only update is_free flag (preserve rest from content_cache)
    if (importData.boosts?.length) {
      for (const item of importData.boosts) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('boosts')
            .select('id, is_free')
            .eq('id', item.id)
            .single()

          if (existing) {
            // Only update is_free flag
            await supabaseAdmin.from('boosts').update({ is_free: item.is_free }).eq('id', existing.id)
            results.updated.boosts++
          }
          // Don't insert new boosts - those come from content_cache
        } catch (e) { results.errors.push(`boosts: ${String(e)}`) }
      }
      console.log(`  ✅ boosts: ${results.updated.boosts} updated`)
    }

    console.log('📥 Import global data complete')
    return NextResponse.json({ message: 'Global data imported successfully', results })

  } catch (error) {
    console.error('Import global data error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}