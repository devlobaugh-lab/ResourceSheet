import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase'

// Validation schema for import data
const importDataSchema = z.object({
  userDrivers: z.array(z.object({
    driver_id: z.string(),
    level: z.number().min(0),
    card_count: z.number().min(0)
  })).optional(),
  userCarParts: z.array(z.object({
    car_part_id: z.string(),
    level: z.number().min(0),
    card_count: z.number().min(0)
  })).optional(),
  userBoosts: z.array(z.object({
    boost_id: z.string(),
    level: z.number().min(0),
    card_count: z.number().min(0)
  })).optional()
})

// POST /api/import-collection - Import collection data
export async function POST(request: NextRequest) {
  try {
    // Try to get user from Authorization header first, then fall back to cookies
    let user = null
    const authHeader = request.headers.get('authorization')

    if (authHeader?.startsWith('Bearer ')) {
      // Try to validate JWT token directly
      const token = authHeader.substring(7)
      try {
        // For local development, trust the JWT and extract user info
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
          )

          if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
            user = {
              id: payload.sub,
              email: payload.email,
              user_metadata: payload.user_metadata || {},
              app_metadata: payload.app_metadata || {},
            }
            console.log('✅ Authenticated user from JWT token:', user.id)
          }
        }
      } catch (error) {
        console.warn('JWT validation failed:', error)
      }
    }

    // If JWT didn't work, try cookie-based auth
    if (!user) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet: any[]) {
              cookiesToSet.forEach(({ name, value, options }: any) => {
                request.cookies.set(name, value)
              })
            },
          },
        }
      )
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        )
      }
      user = cookieUser
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = importDataSchema.parse(body)

    // Check if user is admin for custom boost names import
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || false

    console.log('Import data received:', {
      hasUserDrivers: !!validatedData.userDrivers,
      userDriversCount: validatedData.userDrivers?.length || 0,
      hasUserCarParts: !!validatedData.userCarParts,
      userCarPartsCount: validatedData.userCarParts?.length || 0,
      hasUserBoosts: !!validatedData.userBoosts,
      userBoostsCount: validatedData.userBoosts?.length || 0
    })

    // Import results tracking
    const importResults = {
      imported: {
        drivers: 0,
        carParts: 0,
        boosts: 0
      },
      skipped: {
        drivers: 0,
        carParts: 0,
        boosts: 0
      },
      errors: [] as string[]
    }

    // Process driver imports with UUID matching (for now)
    if (validatedData.userDrivers) {
      console.log(`Processing ${validatedData.userDrivers.length} driver imports`)

      // For now, try UUID matching. If it fails, we'll need to enhance export format
      const driverIds = validatedData.userDrivers.map(item => item.driver_id)
      const { data: existingDrivers, error: driversError } = await supabaseAdmin
        .from('drivers')
        .select('id')
        .in('id', driverIds)

      if (driversError) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Failed to validate drivers' } },
          { status: 400 }
        )
      }

      const existingDriverIds = new Set((existingDrivers || []).map(item => item.id))
      const invalidIds = driverIds.filter(id => !existingDriverIds.has(id))

      if (invalidIds.length > 0) {
        // Instead of failing completely, let's provide a more helpful error
        // and suggest that the user may need to rebuild their collection
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: `Some driver IDs not found in current catalog. This usually happens after database reseeding. You may need to rebuild your collection or contact support.`,
              details: `Invalid driver IDs: ${invalidIds.join(', ')}`
            }
          },
          { status: 400 }
        )
      }

      // Delete existing user drivers and insert new ones
      console.log('Deleting existing user drivers for user:', user.id)
      const { error: deleteError } = await supabaseAdmin
        .from('user_drivers')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Delete drivers error:', deleteError)
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: 'Failed to delete existing user drivers: ' + deleteError.message } },
          { status: 500 }
        )
      }

      // Only insert drivers that the user actually owns (level > 0 or card_count > 0)
      const ownedDrivers = validatedData.userDrivers.filter(item => item.level > 0 || item.card_count > 0)

      if (ownedDrivers.length > 0) {
        const driversToInsert = ownedDrivers.map(item => ({
          user_id: user.id,
          driver_id: item.driver_id,
          level: item.level,
          card_count: item.card_count
        }))

        console.log('Inserting user drivers:', driversToInsert.length)
        const { error: insertError } = await supabaseAdmin
          .from('user_drivers')
          .insert(driversToInsert)

        if (insertError) {
          console.error('Insert drivers error:', insertError)
          console.error('Insert drivers error details:', JSON.stringify(insertError, null, 2))
          return NextResponse.json(
            { error: { code: 'DATABASE_ERROR', message: 'Failed to import user drivers: ' + insertError.message } },
            { status: 500 }
          )
        }
        console.log('Successfully inserted user drivers')
        importResults.imported.drivers = driversToInsert.length
      }
    }

    // Process car part imports
    if (validatedData.userCarParts) {
      const carPartIds = validatedData.userCarParts.map(item => item.car_part_id)
      const { data: existingCarParts, error: carPartsError } = await supabaseAdmin
        .from('car_parts')
        .select('id')
        .in('id', carPartIds)

      if (carPartsError) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Failed to validate car parts' } },
          { status: 400 }
        )
      }

      const existingCarPartIds = new Set((existingCarParts || []).map(item => item.id))
      const invalidIds = carPartIds.filter(id => !existingCarPartIds.has(id))

      if (invalidIds.length > 0) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: `Some car part IDs not found in current catalog. This usually happens after database reseeding.`,
              details: `Invalid car part IDs: ${invalidIds.join(', ')}`
            }
          },
          { status: 400 }
        )
      }

      // Delete existing user car parts and insert new ones
      console.log('Deleting existing user car parts for user:', user.id)
      const { error: deleteError } = await supabaseAdmin
        .from('user_car_parts')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: 'Failed to delete existing user car parts' } },
          { status: 500 }
        )
      }

      // Only insert car parts that the user actually owns (level > 0 or card_count > 0)
      const ownedCarParts = validatedData.userCarParts.filter(item => item.level > 0 || item.card_count > 0)

      if (ownedCarParts.length > 0) {
        const carPartsToInsert = ownedCarParts.map(item => ({
          user_id: user.id,
          car_part_id: item.car_part_id,
          level: item.level,
          card_count: item.card_count
        }))

        console.log('Inserting user car parts:', carPartsToInsert.length)
        const { error: insertError } = await supabaseAdmin
          .from('user_car_parts')
          .insert(carPartsToInsert)

        if (insertError) {
          console.error('Insert car parts error:', insertError)
          console.error('Insert car parts error details:', JSON.stringify(insertError, null, 2))
          return NextResponse.json(
            { error: { code: 'DATABASE_ERROR', message: 'Failed to import user car parts: ' + insertError.message } },
            { status: 500 }
          )
        }
        console.log('Successfully inserted user car parts')
        importResults.imported.carParts = carPartsToInsert.length
      }
    }

    // Process boost imports
    if (validatedData.userBoosts) {
      const boostIds = validatedData.userBoosts.map(boost => boost.boost_id)
      const { data: existingBoosts, error: boostsError } = await supabaseAdmin
        .from('boosts')
        .select('id')
        .in('id', boostIds)

      if (boostsError) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Failed to validate boosts' } },
          { status: 400 }
        )
      }

      const existingBoostIds = new Set((existingBoosts || []).map(boost => boost.id))
      const invalidIds = boostIds.filter(id => !existingBoostIds.has(id))

      if (invalidIds.length > 0) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: `Some boost IDs not found in current catalog. This usually happens after database reseeding.`,
              details: `Invalid boost IDs: ${invalidIds.join(', ')}`
            }
          },
          { status: 400 }
        )
      }

      // Delete existing user boosts and insert new ones
      await supabaseAdmin
        .from('user_boosts')
        .delete()
        .eq('user_id', user.id)

      // Only insert boosts that the user actually owns (card_count > 0)
      const ownedBoosts = validatedData.userBoosts.filter(item => item.card_count > 0)

      if (ownedBoosts.length > 0) {
        const boostsToInsert = ownedBoosts.map(boost => ({
          user_id: user.id,
          boost_id: boost.boost_id,
          level: boost.level,
          card_count: boost.card_count
        }))

        console.log('Inserting user boosts:', boostsToInsert.length)
        const { error: insertError } = await supabaseAdmin
          .from('user_boosts')
          .insert(boostsToInsert)

        if (insertError) {
          console.error('Insert boosts error:', insertError)
          console.error('Insert boosts error details:', JSON.stringify(insertError, null, 2))
          return NextResponse.json(
            { error: { code: 'DATABASE_ERROR', message: 'Failed to import user boosts: ' + insertError.message } },
            { status: 500 }
          )
        }
        console.log('Successfully inserted user boosts')
        importResults.imported.boosts = boostsToInsert.length
      }
    }



    return NextResponse.json({ message: 'Collection imported successfully' })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid import data format', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Import collection error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
