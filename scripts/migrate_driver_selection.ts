import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateDriverSelection() {
  console.log('Starting driver selection migration...')
  
  try {
    // Get all track guides that have suggested_drivers data
    const { data: trackGuides, error } = await supabase
      .from('user_track_guides')
      .select('*')
      .not('suggested_drivers', 'is', null)
      .gt('array_length(suggested_drivers, 1)', 0)

    if (error) {
      throw error
    }

    console.log(`Found ${trackGuides?.length || 0} track guides with driver data to migrate`)

    if (!trackGuides || trackGuides.length === 0) {
      console.log('No track guides found to migrate')
      return
    }

    let migratedCount = 0
    let errorCount = 0

    for (const guide of trackGuides) {
      try {
        const suggestedDrivers = guide.suggested_drivers || []
        
        // Extract main drivers (first 2) and alternate drivers (remaining)
        const driver_1_id = suggestedDrivers[0] || null
        const driver_2_id = suggestedDrivers[1] || null
        const alternate_driver_ids = suggestedDrivers.slice(2)

        // Update the track guide with the new structure
        const { error: updateError } = await supabase
          .from('user_track_guides')
          .update({
            driver_1_id,
            driver_2_id,
            alt_driver_ids: alternate_driver_ids.length > 0 ? alternate_driver_ids : null
          })
          .eq('id', guide.id)

        if (updateError) {
          throw updateError
        }

        migratedCount++
        
        if (migratedCount % 10 === 0) {
          console.log(`Migrated ${migratedCount} track guides...`)
        }

      } catch (error) {
        console.error(`Error migrating track guide ${guide.id}:`, error)
        errorCount++
      }
    }

    console.log(`Migration completed: ${migratedCount} migrated, ${errorCount} errors`)
    
    // Verify migration
    const { data: verificationData } = await supabase
      .from('user_track_guides')
      .select('id, driver_1_id, driver_2_id, alt_driver_ids')
      .not('driver_1_id', 'is', null)
      .limit(5)

    console.log('Sample of migrated data:', verificationData)

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// Run the migration
if (require.main === module) {
  migrateDriverSelection()
    .then(() => {
      console.log('Migration script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration script failed:', error)
      process.exit(1)
    })
}

export { migrateDriverSelection }