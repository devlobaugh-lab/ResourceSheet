import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
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
      boostIconData: { imported: 0, updated: 0 },
      trackRotationSets: { imported: 0, updated: 0 },
      trackRotationSchedule: { imported: 0, updated: 0 },
      users: { imported: 0, updated: 0 },
      errors: [] as string[]
    }

    // seasons: upsert by id
    if (importData.seasons?.length) {
      for (const item of importData.seasons) {
        try {
          const { data: existing } = await supabaseAdmin.from('seasons').select('id').eq('id', item.id).maybeSingle()
          if (existing) {
            const { id, created_at, ...updateData } = item
            const { error: updateError } = await supabaseAdmin.from('seasons').update(updateData).eq('id', item.id)
            if (updateError) throw updateError
            results.seasons.updated++
          } else {
            const { error: insertError } = await supabaseAdmin.from('seasons').insert(item)
            if (insertError) throw insertError
            results.seasons.imported++
          }
        } catch (e) { results.errors.push(`seasons: ${e instanceof Error ? e.message : JSON.stringify(e)}`) }
      }
    }

    // track_name_aliases: upsert by system_name (unique)
    if (importData.trackNameAliases?.length) {
      for (const item of importData.trackNameAliases) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('track_name_aliases').select('id').eq('system_name', item.system_name).maybeSingle()
          if (existing) {
            const { error: updateError } = await supabaseAdmin.from('track_name_aliases').update({ display_name: item.display_name }).eq('id', existing.id)
            if (updateError) throw updateError
            results.trackNameAliases.updated++
          } else {
            const { id, ...insertData } = item
            const { error: insertError } = await supabaseAdmin.from('track_name_aliases').insert(insertData)
            if (insertError) throw insertError
            results.trackNameAliases.imported++
          }
        } catch (e) { results.errors.push(`track_name_aliases: ${e instanceof Error ? e.message : JSON.stringify(e)}`) }
      }
    }

    // boost_icon_data: upsert by icon_name
    if (importData.boostIconData?.length) {
      for (const item of importData.boostIconData) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('boost_icon_data').select('id').eq('icon_name', item.icon_name).maybeSingle()
          if (existing) {
            const { error: updateError } = await supabaseAdmin.from('boost_icon_data').update({ custom_name: item.custom_name, is_free: item.is_free }).eq('id', existing.id)
            if (updateError) throw updateError
            results.boostIconData.updated++
          } else {
            const { error: insertError } = await supabaseAdmin.from('boost_icon_data').insert({ icon_name: item.icon_name, custom_name: item.custom_name, is_free: item.is_free })
            if (insertError) throw insertError
            results.boostIconData.imported++
          }
        } catch (e) { results.errors.push(`boost_icon_data: ${e instanceof Error ? e.message : JSON.stringify(e)}`) }
      }
    }

    // track_rotation_sets: upsert by set_number (unique)
    // Build a map from export UUID -> DB UUID so schedule entries can be remapped
    const rotationSetIdMap = new Map<string, string>()
    if (importData.trackRotationSets?.length) {
      for (const item of importData.trackRotationSets) {
        try {
          const { data: existing } = await supabaseAdmin
            .from('track_rotation_sets').select('id').eq('set_number', item.set_number).maybeSingle()
          if (existing) {
            const { error: updateError } = await supabaseAdmin.from('track_rotation_sets').update({ series_data: item.series_data }).eq('id', existing.id)
            if (updateError) throw updateError
            rotationSetIdMap.set(item.id, existing.id)
            results.trackRotationSets.updated++
          } else {
            const { created_at, updated_at, ...insertData } = item
            const { data: inserted, error: insertError } = await supabaseAdmin.from('track_rotation_sets').insert(insertData).select('id').single()
            if (insertError) throw insertError
            rotationSetIdMap.set(item.id, inserted.id)
            results.trackRotationSets.imported++
          }
        } catch (e) { results.errors.push(`track_rotation_sets: ${e instanceof Error ? e.message : JSON.stringify(e)}`) }
      }
    }

    // track_rotation_schedule: upsert by (rotation_set_id, start_date)
    // Remap rotation_set_id from export UUID to the actual DB UUID
    if (importData.trackRotationSchedule?.length) {
      for (const item of importData.trackRotationSchedule) {
        try {
          const dbRotationSetId = rotationSetIdMap.get(item.rotation_set_id) ?? item.rotation_set_id
          const { data: existing } = await supabaseAdmin
            .from('track_rotation_schedule').select('id')
            .eq('rotation_set_id', dbRotationSetId).eq('start_date', item.start_date).maybeSingle()
          if (existing) {
            const { error: updateError } = await supabaseAdmin.from('track_rotation_schedule').update({ end_date: item.end_date }).eq('id', existing.id)
            if (updateError) throw updateError
            results.trackRotationSchedule.updated++
          } else {
            const { id, created_at, updated_at, ...insertData } = item
            const { error: insertError } = await supabaseAdmin.from('track_rotation_schedule').insert({ ...insertData, rotation_set_id: dbRotationSetId })
            if (insertError) throw insertError
            results.trackRotationSchedule.imported++
          }
        } catch (e) { results.errors.push(`track_rotation_schedule: ${e instanceof Error ? e.message : JSON.stringify(e)}`) }
      }
    }

    // users: create auth user if not exists, upsert profile
    if (importData.users?.length) {
      const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers()
      const existingByEmail = new Map((authUsersData?.users ?? []).map(u => [u.email, u]))
      for (const item of importData.users as Array<{ email: string; username: string; is_admin: boolean; is_active: boolean }>) {
        try {
          let userId: string
          const existingUser = existingByEmail.get(item.email)
          if (existingUser) {
            userId = existingUser.id
            results.users.updated++
          } else {
            const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
              email: item.email,
              email_confirm: true,
            })
            if (error || !newUser.user) {
              results.errors.push(`users (${item.email}): ${error?.message ?? 'failed to create'}`)
              continue
            }
            userId = newUser.user.id
            results.users.imported++
          }
          await supabaseAdmin.from('profiles').upsert({
            id: userId,
            email: item.email,
            username: item.username,
            is_admin: item.is_admin ?? false,
            is_active: item.is_active ?? true,
          }, { onConflict: 'id' })
        } catch (e) { results.errors.push(`users (${item.email}): ${e instanceof Error ? e.message : JSON.stringify(e)}`) }
      }
    }

    return NextResponse.json({ message: 'System data imported successfully', results })

  } catch (error) {
    console.error('System import error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
