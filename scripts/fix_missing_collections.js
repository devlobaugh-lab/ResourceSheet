const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

console.log('🔧 Using Supabase configuration:')
console.log(`  URL: ${supabaseUrl}`)
console.log(`  Anon Key: ${supabaseAnonKey ? '***' : 'NOT_SET'}`)
console.log(`  Service Key: ${supabaseServiceKey ? '***' : 'NOT_SET'}`)

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixMissingCollections() {
  console.log('🔧 Fixing missing collections and updating driver data...')
  
  try {
    // 1. Check current collections
    console.log('📊 Checking current collections...')
    const { data: currentCollections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .order('ordinal', { ascending: true })

    if (collectionsError) {
      throw collectionsError
    }

    console.log(`Found ${currentCollections.length} collections:`)
    currentCollections.forEach(c => {
      console.log(`  - ${c.name} (${c.theme}) - ID: ${c.id}`)
    })

    // 2. Define the expected collections
    const expectedCollections = [
      {
        id: "fa44edf3-f712-4e32-a94b-46f0187757c2",
        name: "SERVLOC_TXT_HOT_PROSPECT_COLLECTION_TITLE",
        theme: "HotProspects",
        ordinal: 1,
        description: "Hot Prospects Collection"
      },
      {
        id: "podium-stars-id",
        name: "SERVLOC_TXT_PODIUM_STARS_COLLECTION_TITLE", 
        theme: "PodiumStars",
        ordinal: 2,
        description: "Podium Stars Collection"
      },
      {
        id: "podium-stars-legends-id",
        name: "SERVLOC_TXT_PODIUM_STARS_LEGENDS_COLLECTION_TITLE",
        theme: "PodiumStarsLegends", 
        ordinal: 3,
        description: "Podium Stars Legends Collection"
      }
    ]

    // 3. Add missing collections
    const missingCollections = expectedCollections.filter(expected => 
      !currentCollections.some(existing => existing.theme === expected.theme)
    )

    if (missingCollections.length > 0) {
      console.log(`\n➕ Adding ${missingCollections.length} missing collections...`)
      
      for (const collection of missingCollections) {
        const { data, error } = await supabase
          .from('collections')
          .insert([collection])
          .select()
          .single()

        if (error) {
          console.error(`❌ Failed to insert collection ${collection.theme}:`, error)
        } else {
          console.log(`✅ Added collection: ${collection.theme}`)
        }
      }
    } else {
      console.log('✅ All expected collections already exist')
    }

    // 4. Check Special Edition drivers and their collection assignments
    console.log('\n🚗 Checking Special Edition drivers...')
    const { data: seDrivers, error: driversError } = await supabase
      .from('drivers')
      .select('*')
      .eq('rarity', 5)
      .order('name', { ascending: true })

    if (driversError) {
      throw driversError
    }

    console.log(`Found ${seDrivers.length} Special Edition drivers:`)
    
    // Group drivers by collectionSubName to understand the distribution
    const driversBySubName = {}
    seDrivers.forEach(driver => {
      const key = driver.collection_sub_name || 'NO_SUBNAME'
      if (!driversBySubName[key]) {
        driversBySubName[key] = []
      }
      driversBySubName[key].push(driver)
    })

    console.log('\nDrivers grouped by collection_sub_name:')
    Object.entries(driversBySubName).forEach(([subName, drivers]) => {
      console.log(`  ${subName}: ${drivers.length} drivers`)
      drivers.forEach(d => {
        console.log(`    - ${d.name} (current collection: ${d.collection_id})`)
      })
    })

    // 5. Update driver collection assignments based on collection_sub_name
    console.log('\n🔄 Updating driver collection assignments...')
    
    // Get updated collections list
    const { data: updatedCollections } = await supabase
      .from('collections')
      .select('*')
      .order('ordinal', { ascending: true })

    let updatedCount = 0
    let skippedCount = 0

    for (const driver of seDrivers) {
      let targetCollection = null
      
      // Determine target collection based on collection_sub_name
      if (driver.collection_sub_name === 'SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_1') {
        targetCollection = updatedCollections.find(c => c.theme === 'HotProspects')
      } else if (driver.collection_sub_name === 'SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_2') {
        targetCollection = updatedCollections.find(c => c.theme === 'HotProspects')
      } else {
        // For any other sub names, try to find appropriate collection
        // This is a fallback - in a real scenario we'd need to map these properly
        targetCollection = updatedCollections.find(c => c.theme === 'HotProspects')
      }

      if (targetCollection && targetCollection.id !== driver.collection_id) {
        const { error } = await supabase
          .from('drivers')
          .update({ collection_id: targetCollection.id })
          .eq('id', driver.id)

        if (error) {
          console.error(`❌ Failed to update driver ${driver.name}:`, error)
        } else {
          console.log(`✅ Updated ${driver.name} -> ${targetCollection.theme}`)
          updatedCount++
        }
      } else if (targetCollection && targetCollection.id === driver.collection_id) {
        console.log(`⏭️  ${driver.name} already has correct collection (${targetCollection.theme})`)
        skippedCount++
      } else {
        console.log(`⚠️  Could not find target collection for ${driver.name} (${driver.collection_sub_name})`)
        skippedCount++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`  - Collections updated: ${updatedCount}`)
    console.log(`  - Drivers already correct: ${skippedCount}`)
    console.log(`  - Total SE drivers: ${seDrivers.length}`)

    // 6. Verify the fix
    console.log('\n🔍 Verifying the fix...')
    const { data: finalDrivers, error: verifyError } = await supabase
      .from('drivers')
      .select(`
        *,
        collections (
          name,
          theme,
          ordinal
        )
      `)
      .eq('rarity', 5)
      .order('collections.ordinal', { ascending: true })
      .order('name', { ascending: true })

    if (verifyError) {
      console.error('❌ Error verifying fix:', verifyError)
    } else {
      console.log('\nFinal Special Edition drivers with collections:')
      if (finalDrivers && finalDrivers.length > 0) {
        finalDrivers.forEach(driver => {
          console.log(`  ${driver.name}: ${driver.collections?.theme || 'NO_COLLECTION'} (${driver.collections?.name || 'NO_NAME'})`)
        })
      } else {
        console.log('  No Special Edition drivers found for verification')
      }
    }

    console.log('\n✅ Collection fix completed successfully!')

  } catch (error) {
    console.error('❌ Error fixing collections:', error)
    process.exit(1)
  }
}

// Run the script
fixMissingCollections()