const fs = require('fs');
const { createClient: createAdminClient } = require('@supabase/supabase-js');

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function cleanupDatabaseForSeason6() {
  try {
    console.log('=== CLEANUP DATABASE FOR SEASON 6 ===\n');
    
    // 1. Get current source data
    const data = JSON.parse(fs.readFileSync('globalContent/season_6.drivers.json', 'utf8'));
    const sourceDrivers = data.map(d => ({
      id: d.id,
      name: d.name,
      rarity: d.rarity,
      series: d.series
    }));
    
    console.log(`Source data contains ${sourceDrivers.length} drivers`);
    console.log(`Source data contains ${sourceDrivers.filter(d => d.rarity === 5).length} rarity 5 drivers\n`);
    
    // 2. Get current database state
    const { data: dbDrivers, error: dbError } = await supabaseAdmin.from('drivers').select('id, name, rarity, series');
    if (dbError) {
      console.error('Error fetching drivers from DB:', dbError);
      return;
    }
    
    console.log(`Database currently has ${dbDrivers.length} drivers`);
    console.log(`Database currently has ${dbDrivers.filter(d => d.rarity === 5).length} rarity 5 drivers\n`);
    
    // 3. Identify drivers to remove (not in source data)
    const dbDriverKeys = dbDrivers.map(d => `${d.name}_${d.rarity}_${d.series}`);
    const sourceDriverKeys = sourceDrivers.map(d => `${d.name}_${d.rarity}_${d.series}`);
    
    const driversToRemove = dbDrivers.filter(dbDriver => {
      const key = `${dbDriver.name}_${dbDriver.rarity}_${dbDriver.series}`;
      return !sourceDriverKeys.includes(key);
    });
    
    console.log(`Found ${driversToRemove.length} drivers to remove:`);
    driversToRemove.forEach(driver => {
      console.log(`- ${driver.name} (Rarity: ${driver.rarity}, Series: ${driver.series}, ID: ${driver.id})`);
    });
    
    // 4. Identify drivers to add (missing from database)
    const missingDrivers = sourceDrivers.filter(sourceDriver => {
      const key = `${sourceDriver.name}_${sourceDriver.rarity}_${sourceDriver.series}`;
      return !dbDriverKeys.includes(key);
    });
    
    console.log(`\nFound ${missingDrivers.length} drivers to add:`);
    missingDrivers.forEach(driver => {
      console.log(`- ${driver.name} (Rarity: ${driver.rarity}, Series: ${driver.series}, ID: ${driver.id})`);
    });
    
    // 5. Remove extra drivers
    if (driversToRemove.length > 0) {
      console.log(`\n=== REMOVING ${driversToRemove.length} EXTRA DRIVERS ===`);
      for (const driver of driversToRemove) {
        const { error } = await supabaseAdmin.from('drivers').delete().eq('id', driver.id);
        if (error) {
          console.error(`Error removing driver ${driver.name}:`, error);
        } else {
          console.log(`✓ Removed ${driver.name}`);
        }
      }
    }
    
    // 6. Add missing drivers
    if (missingDrivers.length > 0) {
      console.log(`\n=== ADDING ${missingDrivers.length} MISSING DRIVERS ===`);
      for (const driver of missingDrivers) {
        // Get full driver data from source
        const fullDriverData = data.find(d => d.id === driver.id);
        if (fullDriverData) {
          const { error } = await supabaseAdmin.from('drivers').insert([{
            id: fullDriverData.id,
            name: fullDriverData.name,
            rarity: fullDriverData.rarity,
            series: fullDriverData.series,
            collection_id: fullDriverData.collection_id,
            ordinal: fullDriverData.ordinal,
            season_id: fullDriverData.season_id,
            icon: fullDriverData.icon,
            cc_price: fullDriverData.cc_price,
            num_duplicates_after_unlock: fullDriverData.num_duplicates_after_unlock,
            visual_override: fullDriverData.visual_override,
            collection_sub_name: fullDriverData.collection_sub_name,
            min_gp_tier: fullDriverData.min_gp_tier,
            tag_name: fullDriverData.tag_name,
            stats_per_level: fullDriverData.stats_per_level
          }]);
          
          if (error) {
            console.error(`Error adding driver ${driver.name}:`, error);
          } else {
            console.log(`✓ Added ${driver.name}`);
          }
        }
      }
    }
    
    // 7. Verify final state
    const { data: finalDrivers } = await supabaseAdmin.from('drivers').select('id, name, rarity, series');
    console.log(`\n=== FINAL VERIFICATION ===`);
    console.log(`Final database has ${finalDrivers.length} drivers`);
    console.log(`Final database has ${finalDrivers.filter(d => d.rarity === 5).length} rarity 5 drivers`);
    
    const finalDriverKeys = finalDrivers.map(d => `${d.name}_${d.rarity}_${d.series}`);
    const allMatch = sourceDrivers.every(sourceDriver => {
      const key = `${sourceDriver.name}_${sourceDriver.rarity}_${sourceDriver.series}`;
      return finalDriverKeys.includes(key);
    });
    
    if (allMatch && finalDrivers.length === sourceDrivers.length) {
      console.log('✓ Database cleanup successful! All drivers now match source data.');
    } else {
      console.log('✗ Database cleanup incomplete. Some drivers still don\'t match source data.');
    }
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

cleanupDatabaseForSeason6();