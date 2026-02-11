import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { createCatalogItemSchema, createBoostSchema, createSeasonSchema } from '@/lib/validation'
import { preprocessDrivers } from '@/lib/preprocessing'

// Schema for season filtering
const seasonFilterSchema = z.object({
  season_filter: z.string().optional(),
})

// Schema for content cache data
const contentCacheSchema = z.object({
  _contentResponse: z.object({
    drivers: z.array(z.any()).optional(),
    carparts: z.array(z.any()).optional(),
    boosts: z.array(z.any()).optional(),
  }).optional(),
  // Support both wrapped and unwrapped formats
  drivers: z.array(z.any()).optional(),
  carparts: z.array(z.any()).optional(),
  boosts: z.array(z.any()).optional(),
})

// POST /api/admin/content-cache/upload - Upload and process content_cache.json (admin only)
export async function POST(request: NextRequest) {
  try {
    // For local development, use a simpler authentication approach
    // Check if user is authenticated by checking for a valid session
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // For local development, we'll trust the JWT token if it's present
    // In production, this would use proper Supabase authentication
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Validate JWT format (basic check)
    const parts = token.split('.')
    if (parts.length !== 3) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid authentication token' } },
        { status: 401 }
      )
    }

    // Create a mock user for local development
    const mockUser = {
      id: 'local-admin-user',
      email: 'admin@local.dev',
      user_metadata: {},
      app_metadata: { role: 'authenticated' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Check if user is admin (for local dev, we'll check if they have admin access)
    // In a real setup, this would query the database
    const isAdmin = true // For local development, assume admin access
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }
    
    // For local development, we'll skip the admin check since we're assuming admin access
    // In production, this would query the database to verify admin status
    console.log('✅ Local development: Assuming admin access for user:', mockUser.id)
    
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const seasonFilter = formData.get('season_filter') as string
    const allowModifications = formData.get('allow_modifications') === 'true'
    
    console.log('Content cache upload - Allow modifications:', allowModifications)

    if (!file) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'No file uploaded' } },
        { status: 400 }
      )
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'File must be a JSON file' } },
        { status: 400 }
      )
    }

    // Parse season filter
    let seasonNumbers = parseSeasonFilter(seasonFilter)

    // Load seasons and determine mapping from season number -> season id
    const seasonIdMap: Record<number, string> = {}
    try {
      const { data: seasons } = await supabaseAdmin.from('seasons').select('id,name,is_active')
      if (Array.isArray(seasons)) {
        for (const s of seasons) {
          if (s && s.name) {
            const match = (s.name || '').match(/(\d+)/)
            if (match) {
              const num = parseInt(match[1], 10)
              if (!isNaN(num)) {
                seasonIdMap[num] = s.id
              }
            }
          }
        }
      }

      // If no season filter provided, default to the active season (local/dev)
      if (seasonNumbers.length === 0) {
        const active = (seasons || []).find((s: any) => s.is_active)
        if (active && active.name) {
          const match = (active.name || '').match(/(\d+)/)
          if (match) {
            const num = parseInt(match[1], 10)
            if (!isNaN(num)) {
              seasonNumbers = [num]
              console.log('No season_filter provided — defaulting import to active season:', num)
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not load seasons for mapping — importing without season mapping', err)
    }

    // Read and parse the uploaded file
    const fileText = await file.text()
    let contentCacheData: any
    
    try {
      contentCacheData = JSON.parse(fileText)
    } catch (parseError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON file' } },
        { status: 400 }
      )
    }

    // Validate content cache structure
    const validatedData = contentCacheSchema.parse(contentCacheData)

    // Process and import data with change detection
    const results = await processContentCache(validatedData, seasonNumbers, allowModifications, seasonIdMap)

    return NextResponse.json({
      message: 'Content cache processed successfully',
      results,
      summary: {
        total_new: results.drivers.new + results.car_parts.new + results.boosts.new,
        total_modified: results.drivers.modified + results.car_parts.modified + results.boosts.modified,
        total_unchanged: results.drivers.unchanged + results.car_parts.unchanged + results.boosts.unchanged,
        drivers: results.drivers,
        car_parts: results.car_parts,
        boosts: results.boosts
      }
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Content cache upload error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// Helper function to parse season filter
function parseSeasonFilter(seasonFilter: string): number[] {
  if (!seasonFilter || seasonFilter.trim() === '') {
    return []; // Import all seasons
  }
  
  try {
    const seasons = seasonFilter
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(s => !isNaN(s) && s >= 0 && s <= 12)
      .sort((a, b) => a - b)
    
    return seasons
  } catch (error) {
    return [] // Import all seasons if parsing fails
  }
}

// Helper function to process content cache with change detection
async function processContentCache(validatedData: any, seasonNumbers: number[], allowModifications: boolean = false, seasonIdMap: Record<number, string> = {}) {
  const results = {
    drivers: { new: 0, modified: 0, unchanged: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }> },
    car_parts: { new: 0, modified: 0, unchanged: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }> },
    boosts: { new: 0, modified: 0, unchanged: 0, modified_items: [] as Array<{ id: string; name: string; changes: string[] }> }
  }

  // Process drivers - handle both wrapped and unwrapped formats
  let driversData = validatedData._contentResponse?.drivers || validatedData.drivers;
  
  // Process collections if present in the uploaded content cache
  let collectionsData = validatedData._contentResponse?.collections || (validatedData as any).collections
  if (collectionsData) {
        const collections = collectionsData.map((c: any) => ({
      id: c.id,
      name: c.name ?? c.theme ?? c.description ?? null,
      theme: c.theme ?? c.description ?? c.name ?? null,
      description: c.description ?? null,
      ordinal: c.ordinal ?? null,
    }))

    if (collections.length > 0) {
      try {
        // Insert or update collections depending on allowModifications
        const collResults = await processItems(collections, 'collections', 'id', allowModifications)
        console.log(`Content upload: processed collections - new=${collResults.new} modified=${collResults.modified} unchanged=${collResults.unchanged}`)
      } catch (err) {
        console.error('Failed to process collections from content cache upload:', err)
      }
    }
  }
  
  if (driversData) {
    const drivers = driversData
      .filter((driver: any) => shouldImportBySeason(driver, seasonNumbers))
      .map((driver: any) => ({
        id: driver.id,
        name: driver.name,
        series: driver.series,
        ordinal: driver.ordinal || 0,
        rarity: driver.rarity || 0,
        icon: driver.icon,
        cc_price: driver.ccPrice || 0,
        num_duplicates_after_unlock: driver.numDuplicatesAfterUnlock || 0,
        collection_id: driver.collectionId || null,
        visual_override: driver.visualOverride || null,
        collection_sub_name: driver.collectionSubName || null,
        min_gp_tier: driver.minGpTier || null, // Map camelCase to snake_case
        tag_name: driver.tagName || null, // Map camelCase to snake_case
        stats_per_level: driver.driverStatsPerLevel || [], // Map camelCase to snake_case
        season_id: seasonIdMap[driver.season] || null
      }))

    // Apply preprocessing to drivers before comparison and database insertion
    // This ensures JSON data is processed the same way as database data
    console.log('Before preprocessing:', drivers.length, 'drivers')
    console.log('Sample driver before preprocessing:', JSON.stringify(drivers[0], null, 2))
    
    const processedDrivers = preprocessDrivers(drivers)
    console.log('After preprocessing:', processedDrivers.length, 'drivers')
    console.log('Sample driver after preprocessing:', JSON.stringify(processedDrivers[0], null, 2))
    
    // Log SE Turbo drivers specifically
    // const seTurboDrivers = processedDrivers.filter(d => d.collection_sub_name && d.collection_sub_name.endsWith('SUBTITLE_2'))
    // console.log('SE Turbo drivers after preprocessing:', seTurboDrivers.length)
    // seTurboDrivers.forEach(driver => {
    //   console.log(`  ${driver.name} - Rarity: ${driver.rarity} - ID: ${driver.id}`)
    // })

    if (processedDrivers.length > 0) {
      const driverResults = await processItems(processedDrivers, 'drivers', 'id', allowModifications)
      results.drivers.new = driverResults.new
      results.drivers.modified = driverResults.modified
      results.drivers.unchanged = driverResults.unchanged
      results.drivers.modified_items = driverResults.modified_items
    }
  }

  // Process car parts - handle both wrapped and unwrapped formats
  let carPartsData = validatedData._contentResponse?.carparts || validatedData.carparts;
  
  if (carPartsData) {
    const carParts = carPartsData
      .filter((part: any) => shouldImportBySeason(part, seasonNumbers))
      .map((part: any) => ({
        id: part.id,
        name: part.name,
        rarity: part.rarity || 0,
        series: part.series,
        icon: part.icon,
        cc_price: part.ccPrice || 0,
        num_duplicates_after_unlock: part.numDuplicatesAfterUnlock || 0,
        collection_id: part.collectionId || null,
        visual_override: part.visualOverride || null,
        collection_sub_name: part.collectionSubName || null,
        car_part_type: part.carPartType || 0,
        stats_per_level: part.carPartStatsPerLevel || [],
        season_id: seasonIdMap[part.season] || null
      }))

    if (carParts.length > 0) {
      const carPartResults = await processItems(carParts, 'car_parts', 'id', allowModifications)
      results.car_parts.new = carPartResults.new
      results.car_parts.modified = carPartResults.modified
      results.car_parts.unchanged = carPartResults.unchanged
      results.car_parts.modified_items = carPartResults.modified_items
    }
  }

  // Process boosts - handle both wrapped and unwrapped formats
  let boostsData = validatedData._contentResponse?.boosts || validatedData.boosts;
  
  if (boostsData) {
    const boosts = boostsData.map((boost: any) => ({
      id: boost.id,
      name: boost.name.startsWith('BOOST_NAME_') ? `Boost ${boost.name.split('_')[2]}` : boost.name,
      icon: boost.icon,
      boost_stats: {
        speed: boost.speedTier || 0,
        block: boost.blockTier || 0,
        overtake: boost.overtakeTier || 0,
        corners: boost.cornersTier || 0,
        tyre_use: boost.tyreUseTier || 0,
        pit_stop: boost.pitStopTimeTier || 0,
        power_unit: boost.powerUnitTier || 0,
        race_start: boost.raceStartTier || 0,
        duration: 30
      }
    }))

    if (boosts.length > 0) {
      const boostResults = await processItems(boosts, 'boosts', 'id', allowModifications)
      results.boosts.new = boostResults.new
      results.boosts.modified = boostResults.modified
      results.boosts.unchanged = boostResults.unchanged
      results.boosts.modified_items = boostResults.modified_items
    }
  }

  return results
}

// Helper function to check if item should be imported based on season filter
function shouldImportBySeason(item: any, seasonNumbers: number[]): boolean {
  if (seasonNumbers.length === 0) {
    return true // Import all if no filter specified
  }
  
  // Check if item's season is in the filter list
  return seasonNumbers.includes(item.season)
}

// Helper function to process items with change detection
async function processItems(items: any[], tableName: string, idField: string, allowModifications: boolean = false) {
  const results = {
    new: 0,
    modified: 0,
    unchanged: 0,
    modified_items: [] as Array<{ id: string; name: string; changes: string[] }>
  }

  // Get existing items by IDs
  const existingItems = await getExistingItems(items, tableName, idField)
  const existingMap = new Map(existingItems.map(item => [item[idField], item]))

  for (const newItem of items) {
    const existingItem = existingMap.get(newItem[idField])
    
    if (!existingItem) {
      // New item - add to database
      const { error } = await supabaseAdmin
        .from(tableName)
        .insert([newItem])
        .select()

      if (!error) {
        results.new++
      }
    } else {
      // Existing item - check for changes
      const changes = detectChanges(existingItem, newItem)
      
      if (changes.length > 0) {
        results.modified++
        results.modified_items.push({
          id: newItem[idField],
          name: newItem.name,
          changes: changes
        })
        
        // Update the database if modifications are allowed
        if (allowModifications) {
          const { error } = await supabaseAdmin
            .from(tableName)
            .update(newItem)
            .eq(idField, newItem[idField])
          
          if (!error) {
            console.log(`✅ Updated ${tableName} item: ${newItem[idField]} (${newItem.name})`)
          } else {
            console.error(`❌ Failed to update ${tableName} item: ${newItem[idField]} (${newItem.name})`, error)
          }
        }
      } else {
        results.unchanged++
      }
    }
  }

  return results
}

// Helper function to get existing items from database
async function getExistingItems(items: any[], tableName: string, idField: string) {
  const ids = items.map(item => item[idField]).filter(Boolean)

  if (ids.length === 0) return []

  // Split into batches to avoid creating extremely long URIs for the Supabase
  // REST requests when many ids are passed to `.in()`.
  // Use 50 to be safe with UUID-length IDs
  const BATCH_SIZE = 50
  const batches: string[][] = []
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    batches.push(ids.slice(i, i + BATCH_SIZE))
  }

  let merged: any[] = []

  for (const batch of batches) {
    try {
  const { data, error } = await supabaseAdmin
    .from(tableName)
    .select('*')
        .in(idField, batch)

  if (error) {
        console.error(`Error fetching existing ${tableName} for batch:`, error)
        // Continue with other batches rather than aborting entirely
        continue
      }

      if (Array.isArray(data)) {
        merged = merged.concat(data)
      }
    } catch (err) {
      console.error(`Unexpected error fetching existing ${tableName} for batch:`, err)
    }
  }

  // Remove duplicates just in case
  const seen = new Set()
  const unique = []
  for (const row of merged) {
    const key = row && row[idField]
    if (!key) continue
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(row)
    }
  }

  return unique
}

// Helper function to detect changes between existing and new items
function detectChanges(existingItem: any, newItem: any): string[] {
  const changes: string[] = []
  
  // Compare each field (excluding metadata fields like created_at, updated_at)
  const fieldsToCompare = Object.keys(newItem).filter(key => 
    !['created_at', 'updated_at', 'id'].includes(key)
  )

  for (const field of fieldsToCompare) {
    const existingValue = existingItem[field]
    const newValue = newItem[field]
    
    if (!deepEqual(existingValue, newValue)) {
      changes.push(`${field} changed`)
    }
  }

  return changes
}

// Helper function for deep equality comparison
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return false
  
  if (typeof a !== typeof b) return false
  
  if (typeof a !== 'object') return false
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }
  
  return true
}