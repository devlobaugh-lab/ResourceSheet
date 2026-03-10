import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'

// POST /api/admin/import/system - Import admin-managed system configuration
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
          },
        },
      }
    )

    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
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

    const body = await request.json()
    const importData = body.data || body

    const results = {
      seasons: { imported: 0, updated: 0 },
      trackNameAliases: { imported: 0, updated: 0 },
      boostCustomNames: { imported: 0, updated: 0 },
      boosts: { updated: 0 },
      errors: [] as string[]
    }

    // seasons: upsert by id
    if (importData.seasons?.length) {
      for (const item of importData.seasons) {
        try {
          const { data: existing } = await supabaseAdmin.from('seasons').select('id').eq('id', item.id).single()
          if (existing) {
            const { id, created_at, ...updateData } = item
            await supabaseAdmin.from('seasons').update(updateData).eq('id', item.id)
            results.seasons.updated++
          } else {
            await supabaseAdmin.from('seasons').insert(item)
            results.seasons.imported++
          }
        } catch (e) { results.errors.push(`seasons: ${String(e)}`) }
      }
    }

    // track_name_aliases: upsert by system_name (unique)
    if (importData.trackNameAliases?.length) {
      for (const item of importData.trackNameAliases) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('track_name_aliases').select('id').eq('system_name', item.system_name).single()
          if (existing) {
            await supabaseAdmin.from('track_name_aliases').update({ display_name: item.display_name }).eq('id', existing.id)
            results.trackNameAliases.updated++
          } else {
            const { id, ...insertData } = item
            await supabaseAdmin.from('track_name_aliases').insert(insertData)
            results.trackNameAliases.imported++
          }
        } catch (e) { results.errors.push(`track_name_aliases: ${String(e)}`) }
      }
    }

    // boost_custom_names: upsert by boost_id
    if (importData.boostCustomNames?.length) {
      for (const item of importData.boostCustomNames) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('boost_custom_names').select('id').eq('boost_id', item.boost_id).single()
          if (existing) {
            await supabaseAdmin.from('boost_custom_names').update({ custom_name: item.custom_name }).eq('id', existing.id)
            results.boostCustomNames.updated++
          } else {
            const { id, ...insertData } = item
            await supabaseAdmin.from('boost_custom_names').insert(insertData)
            results.boostCustomNames.imported++
          }
        } catch (e) { results.errors.push(`boost_custom_names: ${String(e)}`) }
      }
    }

    // boosts: update is_free only (boostOverrides key from new format, boosts key from old format)
    const boostItems = importData.boostOverrides || importData.boosts
    if (boostItems?.length) {
      for (const item of boostItems) {
        try {
          const { data: existing } = await supabaseAdmin.from('boosts').select('id').eq('id', item.id).single()
          if (existing) {
            await supabaseAdmin.from('boosts').update({ is_free: item.is_free }).eq('id', item.id)
            results.boosts.updated++
          }
        } catch (e) { results.errors.push(`boosts: ${String(e)}`) }
      }
    }

    return NextResponse.json({ message: 'System data imported successfully', results })

  } catch (error) {
    console.error('System import error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
