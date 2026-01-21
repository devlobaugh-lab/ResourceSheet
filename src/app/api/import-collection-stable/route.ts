import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

// Validation schema for stable import data
const stableImportDataSchema = z.object({
  exportedAt: z.string(),
  userId: z.string().optional(),
  userEmail: z.string().optional(),
  version: z.string(),
  format: z.string(),
  drivers: z.array(z.object({
    name: z.string(),
    series: z.number(),
    ordinal: z.number().optional(),
    rarity: z.number().optional(),
    level: z.number().min(0),
    card_count: z.number().min(0)
  })).optional(),
  carParts: z.array(z.object({
    name: z.string(),
    car_part_type: z.number(),
    series: z.number(),
    rarity: z.number().optional(),
    level: z.number().min(0),
    card_count: z.number().min(0)
  })).optional(),
  boosts: z.array(z.object({
    name: z.string(),
    icon: z.string().optional(),
    count: z.number().min(0)
  })).optional()
})

// POST /api/import-collection-stable - Import collection data using stable identifiers
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
    const validatedData = stableImportDataSchema.parse(body)

    console.log('Stable import data received:', {
      version: validatedData.version,
      format: validatedData.format,
      hasDrivers: !!validatedData.drivers,
      driversCount: validatedData.drivers?.length || 0,
      hasCarParts: !!validatedData.carParts,
      carPartsCount: validatedData.carParts?.length || 0,
      hasBoosts: !!validatedData.boosts,
      boostsCount: validatedData.boosts?.length || 0
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

    // Process driver imports using stable identifiers
    if (validatedData.drivers) {
      console.log(`Processing ${validatedData.drivers.length} driver imports using stable identifiers`)

      // Get all current drivers to build a lookup map
      const { data: allDrivers, error: driversError } = await supabaseAdmin
        .from('drivers')
        .select('id, name, series, ordinal, rarity')

      if (driversError) {
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch driver catalog' } },
          { status: 500 }
        )
      }

      // Build lookup map for drivers: key = "name|series|ordinal"
      const driverLookup = new Map<string, string>()
      ;(allDrivers || []).forEach(driver => {
        const key = `${driver.name}|${driver.series}|${driver.ordinal || 0}`
        driverLookup.set(key, driver.id)
      })

      // Match imported drivers to current catalog
      const matchedDrivers = []
      const unmatchedDrivers = []

      for (const importedDriver of validatedData.drivers) {
        const key = `${importedDriver.name}|${importedDriver.series}|${importedDriver.ordinal || 0}`
        const driverId = driverLookup.get(key)

        if (driverId) {
          matchedDrivers.push({
            driverId,
            level: importedDriver.level,
            card_count: importedDriver.card_count
          })
        } else {
          unmatchedDrivers.push(importedDriver)
          importResults.errors.push(`Driver not found: ${importedDriver.name} (Series ${importedDriver.series}, Ordinal ${importedDriver.ordinal || 0})`)
        }
      }

      console.log(`Matched ${matchedDrivers.length} drivers, ${unmatchedDrivers.length} unmatched`)

      if (matchedDrivers.length > 0) {
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
        const ownedDrivers = matchedDrivers.filter(item => item.level > 0 || item.card_count > 0)

        if (ownedDrivers.length > 0) {
          const driversToInsert = ownedDrivers.map(item => ({
            user_id: user.id,
            driver_id: item.driverId,
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
    }

    // Process car part imports using stable identifiers
    if (validatedData.carParts) {
      console.log(`Processing ${validatedData.carParts.length} car part imports using stable identifiers`)

      // Get all current car parts to build a lookup map
      const { data: allCarParts, error: carPartsError } = await supabaseAdmin
        .from('car_parts')
        .select('id, name, car_part_type, series, rarity')

      if (carPartsError) {
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch car parts catalog' } },
          { status: 500 }
        )
      }

      // Build lookup map for car parts: key = "name|car_part_type|series"
      const carPartLookup = new Map<string, string>()
      ;(allCarParts || []).forEach(carPart => {
        const key = `${carPart.name}|${carPart.car_part_type}|${carPart.series}`
        carPartLookup.set(key, carPart.id)
      })

      // Match imported car parts to current catalog
      const matchedCarParts = []
      const unmatchedCarParts = []

      for (const importedCarPart of validatedData.carParts) {
        const key = `${importedCarPart.name}|${importedCarPart.car_part_type}|${importedCarPart.series}`
        const carPartId = carPartLookup.get(key)

        if (carPartId) {
          matchedCarParts.push({
            carPartId,
            level: importedCarPart.level,
            card_count: importedCarPart.card_count
          })
        } else {
          unmatchedCarParts.push(importedCarPart)
          importResults.errors.push(`Car part not found: ${importedCarPart.name} (Type ${importedCarPart.car_part_type}, Series ${importedCarPart.series})`)
        }
      }

      console.log(`Matched ${matchedCarParts.length} car parts, ${unmatchedCarParts.length} unmatched`)

      if (matchedCarParts.length > 0) {
        // Delete existing user car parts and insert new ones
        console.log('Deleting existing user car parts for user:', user.id)
        const { error: deleteError } = await supabaseAdmin
          .from('user_car_parts')
          .delete()
          .eq('user_id', user.id)

        if (deleteError) {
          console.error('Delete car parts error:', deleteError)
          return NextResponse.json(
            { error: { code: 'DATABASE_ERROR', message: 'Failed to delete existing user car parts: ' + deleteError.message } },
            { status: 500 }
          )
        }

        // Only insert car parts that the user actually owns (level > 0 or card_count > 0)
        const ownedCarParts = matchedCarParts.filter(item => item.level > 0 || item.card_count > 0)

        if (ownedCarParts.length > 0) {
          const carPartsToInsert = ownedCarParts.map(item => ({
            user_id: user.id,
            car_part_id: item.carPartId,
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
    }

    // Process boost imports using stable identifiers
    if (validatedData.boosts) {
      console.log(`Processing ${validatedData.boosts.length} boost imports using stable identifiers`)

      // Get all current boosts to build a lookup map
      const { data: allBoosts, error: boostsError } = await supabaseAdmin
        .from('boosts')
        .select('id, name')

      if (boostsError) {
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch boosts catalog' } },
          { status: 500 }
        )
      }

      // Build lookup map for boosts: key = "name" (should be unique)
      const boostLookup = new Map<string, string>()
      ;(allBoosts || []).forEach(boost => {
        boostLookup.set(boost.name, boost.id)
      })

      // Match imported boosts to current catalog
      const matchedBoosts = []
      const unmatchedBoosts = []

      for (const importedBoost of validatedData.boosts) {
        const boostId = boostLookup.get(importedBoost.name)

        if (boostId) {
          matchedBoosts.push({
            boostId,
            count: importedBoost.count
          })
        } else {
          unmatchedBoosts.push(importedBoost)
          importResults.errors.push(`Boost not found: ${importedBoost.name}`)
        }
      }

      console.log(`Matched ${matchedBoosts.length} boosts, ${unmatchedBoosts.length} unmatched`)

      if (matchedBoosts.length > 0) {
        // Delete existing user boosts and insert new ones
        console.log('Deleting existing user boosts for user:', user.id)
        const { error: deleteError } = await supabaseAdmin
          .from('user_boosts')
          .delete()
          .eq('user_id', user.id)

        if (deleteError) {
          console.error('Delete boosts error:', deleteError)
          return NextResponse.json(
            { error: { code: 'DATABASE_ERROR', message: 'Failed to delete existing user boosts: ' + deleteError.message } },
            { status: 500 }
          )
        }

        // Only insert boosts that the user actually owns (count > 0)
        const ownedBoosts = matchedBoosts.filter(item => item.count > 0)

        if (ownedBoosts.length > 0) {
          const boostsToInsert = ownedBoosts.map(item => ({
            user_id: user.id,
            boost_id: item.boostId,
            count: item.count
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
    }

    // Return comprehensive import results
    return NextResponse.json({
      message: 'Stable collection imported successfully',
      results: importResults,
      summary: {
        imported: importResults.imported.drivers + importResults.imported.carParts + importResults.imported.boosts,
        skipped: importResults.skipped.drivers + importResults.skipped.carParts + importResults.skipped.boosts,
        errors: importResults.errors.length
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid stable import data format', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Stable import error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
