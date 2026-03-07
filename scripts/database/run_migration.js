const { createServerSupabaseClient } = require('../../src/lib/supabase')

async function runMigration() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Run the migration SQL directly
    const { data, error } = await supabase.from('user_gp_guide_tracks').select('id').limit(1)
    
    if (error) {
      console.error('Database connection failed:', error)
      process.exit(1)
    }
    
    // Try to add the column
    const { error: alterError } = await supabase.rpc('run_sql', {
      sql: 'ALTER TABLE user_gp_guide_tracks ADD COLUMN is_ready BOOLEAN NOT NULL DEFAULT false;'
    })
    
    if (alterError) {
      console.error('Migration failed:', alterError)
      process.exit(1)
    }
    
    console.log('Migration successful!')
  } catch (error) {
    console.error('Error running migration:', error)
    process.exit(1)
  }
}

runMigration()
