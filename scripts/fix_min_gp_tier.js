/**
 * Fix min_gp_tier values in database
 *
 * This script updates the database with correct min_gp_tier values from the JSON source
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixMinGpTier() {
  try {
    console.log('🔧 Starting min_gp_tier fix...');

    // 1. Read JSON source data
    console.log('📖 Reading JSON source data...');
    const driversJsonPath = path.join(__dirname, '../globalContent/season_6.drivers.json');
    const driversData = JSON.parse(fs.readFileSync(driversJsonPath, 'utf8'));

    // 2. Get current database data
    console.log('📊 Fetching current database data...');
    const { data: dbDrivers, error } = await supabase
      .from('drivers')
      .select('id, name, min_gp_tier');

    if (error) {
      console.error('❌ Error fetching drivers:', error);
      return;
    }

    // 3. Find drivers with null min_gp_tier that need fixing
    const driversToFix = dbDrivers.filter(dbDriver => {
      const jsonDriver = driversData.find(d => d.name === dbDriver.name);
      return jsonDriver && dbDriver.min_gp_tier === null && jsonDriver.minGpTier !== null;
    });

    if (driversToFix.length === 0) {
      console.log('ℹ️ No drivers need min_gp_tier fixes');
      return;
    }

    console.log(`📋 Found ${driversToFix.length} drivers to fix:`);
    driversToFix.forEach(driver => {
      const jsonDriver = driversData.find(d => d.name === driver.name);
      console.log(`  ${driver.name}: null → ${jsonDriver.minGpTier}`);
    });

    // 4. Apply fixes
    console.log('\\n🔧 Applying fixes...');
    for (const driver of driversToFix) {
      const jsonDriver = driversData.find(d => d.name === driver.name);
      const { error: updateError } = await supabase
        .from('drivers')
        .update({ min_gp_tier: jsonDriver.minGpTier })
        .eq('id', driver.id);

      if (updateError) {
        console.error(`❌ Failed to fix ${driver.name}:`, updateError);
      } else {
        console.log(`✅ Fixed ${driver.name}: min_gp_tier null → ${jsonDriver.minGpTier}`);
      }
    }

    console.log(`\\n🎉 Successfully fixed ${driversToFix.length} drivers!`);

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

// Run the script
fixMinGpTier();