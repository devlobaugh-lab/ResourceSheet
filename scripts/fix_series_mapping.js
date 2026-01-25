/**
 * Fix Series Mapping for Special Drivers
 *
 * This script corrects the series numbers for drivers that should have
 * series numbers based on their GP tier eligibility.
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

/**
 * Get expected series based on GP tier
 */
function getExpectedSeries(minGpTier) {
  if (minGpTier === 0) return 1;    // Junior tier
  if (minGpTier === 1) return 4;    // Challenger tier
  if (minGpTier === 2) return 7;    // Contender tier
  if (minGpTier >= 3) return 10;   // Champion tier
  return 1; // Default
}

async function fixSeriesMapping() {
  try {
    console.log('🔧 Starting series mapping fix...');

    // 1. Read JSON source data to identify which drivers should have been updated
    console.log('📖 Reading JSON source data...');
    const driversJsonPath = path.join(__dirname, '../globalContent/season_6.drivers.json');
    const driversData = JSON.parse(fs.readFileSync(driversJsonPath, 'utf8'));

    // 2. Get current database data
    console.log('📊 Fetching current database data...');
    const { data: dbDrivers, error } = await supabase
      .from('drivers')
      .select('id, name, series, min_gp_tier, rarity');

    if (error) {
      console.error('❌ Error fetching drivers:', error);
      return;
    }

    // 3. Identify drivers that should have series based on GP tier (originally series=0)
    const driversToFix = driversData.filter(jsonDriver => jsonDriver.series === 0)
      .map(jsonDriver => {
        const dbDriver = dbDrivers.find(d => d.name === jsonDriver.name);
        const expectedSeries = getExpectedSeries(jsonDriver.minGpTier);
        return {
          id: dbDriver.id,
          name: jsonDriver.name,
          currentSeries: dbDriver.series,
          expectedSeries,
          minGpTier: jsonDriver.minGpTier,
          rarity: dbDriver.rarity
        };
      })
      .filter(driver => driver.currentSeries !== driver.expectedSeries);

    if (driversToFix.length === 0) {
      console.log('ℹ️ No drivers need series fixes');
      return;
    }

    console.log(`📋 Found ${driversToFix.length} drivers to fix:`);
    driversToFix.forEach(driver => {
      console.log(`  ${driver.name} (Rarity ${driver.rarity}, GP Tier ${driver.minGpTier}): ${driver.currentSeries} → ${driver.expectedSeries}`);
    });

    // 4. Apply fixes
    console.log('\\n🔧 Applying fixes...');
    for (const driver of driversToFix) {
      const { error: updateError } = await supabase
        .from('drivers')
        .update({ series: driver.expectedSeries })
        .eq('id', driver.id);

      if (updateError) {
        console.error(`❌ Failed to fix ${driver.name}:`, updateError);
      } else {
        console.log(`✅ Fixed ${driver.name}: series ${driver.currentSeries} → ${driver.expectedSeries}`);
      }
    }

    // 5. Also update the JSON source file
    console.log('\\n📁 Updating JSON source file...');
    const updatedDriversData = driversData.map(driver => {
      if (driver.series === 0) {
        return { ...driver, series: getExpectedSeries(driver.minGpTier) };
      }
      return driver;
    });

    fs.writeFileSync(driversJsonPath, JSON.stringify(updatedDriversData, null, 2));
    console.log('✅ JSON source file updated');

    console.log(`\\n🎉 Successfully fixed ${driversToFix.length} drivers!`);

    // 6. Show summary
    console.log('\\n📊 Summary by GP Tier:');
    const byTier = driversToFix.reduce((acc, driver) => {
      const key = `GP Tier ${driver.minGpTier} → Series ${driver.expectedSeries}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    Object.entries(byTier).forEach(([key, count]) => {
      console.log(`   ${key}: ${count} drivers`);
    });

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

// Run the script
fixSeriesMapping();