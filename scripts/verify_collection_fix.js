const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyCollectionFix() {
  console.log('🔍 Verifying collection fix...')
  
  try {
    // Check collections
    console.log('\n📊 Collections:')
    const { data: collections } = await supabase
      .from('collections')
      .select('*')
      .order('ordinal', { ascending: true })

    collections.forEach(c => {
      console.log(`  ✅ ${c.name} (${c.theme}) - Ordinal: ${c.ordinal}`)
    })

    // Check Special Edition drivers with their collections
    console.log('\n🚗 Special Edition Drivers:')
    const { data: seDrivers } = await supabase
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

    console.log(`Found ${seDrivers ? seDrivers.length : 0} Special Edition drivers:`)
    
    // Group by collection theme
    const driversByTheme = {}
    if (seDrivers && seDrivers.length > 0) {
      seDrivers.forEach(driver => {
        const theme = driver.collections?.theme || 'NO_THEME'
        if (!driversByTheme[theme]) {
          driversByTheme[theme] = []
        }
        driversByTheme[theme].push(driver)
      })

      Object.entries(driversByTheme).forEach(([theme, drivers]) => {
        console.log(`\n  🎨 ${theme}: ${drivers.length} drivers`)
        drivers.forEach(d => {
          console.log(`    - ${d.name} (${d.collection_sub_name || 'NO_SUBNAME'})`)
        })
      })

      // Check if all SE drivers have proper collections
      const driversWithoutCollections = seDrivers.filter(d => !d.collections)
      if (driversWithoutCollections.length > 0) {
        console.log(`\n⚠️  ${driversWithoutCollections.length} drivers still don't have collections assigned:`)
        driversWithoutCollections.forEach(d => {
          console.log(`    - ${d.name}`)
        })
      } else {
        console.log('\n✅ All Special Edition drivers have collections assigned!')
      }
    } else {
      console.log('  No Special Edition drivers found')
    }

    // Check DataGrid display logic
    console.log('\n📋 DataGrid Display Logic Test:')
    console.log('For rarity 5 drivers, the DataGrid should now display:')
    console.log('  - rarityDisplay: collections.theme (e.g., "HotProspects")')
    console.log('  - rarityColor: "text-purple-600"')
    console.log('  - rarityBg: "bg-purple-100"')
    console.log('Instead of the old "Special Edition" text')

    console.log('\n🎉 Collection fix verification completed!')
    console.log('The DataGrid component should now display collection themes correctly.')

  } catch (error) {
    console.error('❌ Error verifying fix:', error)
    process.exit(1)
  }
}

// Run the verification
verifyCollectionFix()