import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'

// POST /api/admin/import-global-data - Import global data (admin only, merge strategy)
export async function POST(request: NextRequest) {
  console.log('📥 Admin import global data called')
  try {
    // Use server-side Supabase client that handles cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
          },
        },
      }
    )
    
    // Get the current session from cookies
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    // Get the authenticated user (more secure than using session.user directly)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('User error:', userError)
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }

    const isAdmin = profile?.is_admin === true
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