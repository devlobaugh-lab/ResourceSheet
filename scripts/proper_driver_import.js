/**
 * Proper Driver Import Script
 *
 * This script imports drivers correctly by:
 * 1. Using the JSON file as the source of truth (read-only)
 * 2. Applying SE Turbo mapping (Rarity 5 → Rarity 6)
 * 3. Applying series mapping for Legendary/SE drivers (rarity >= 4) based on minGpTier
 * 4. Preserving original series numbers for regular drivers (rarity < 4) from JSON
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
 * Load original JSON data (read-only source of truth)
 */
function loadOriginalData() {
  try {
    const jsonPath = path.join(__dirname, '..', 'globalContent', 'season_6.drivers.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Error loading original JSON:', error);
    process.exit(1);
  }
}

/**
 * Apply SE Turbo mapping (Rarity 5 → Rarity 6)
 */
function applySETurboMapping(drivers) {
  return drivers.map(driver => {
    if (driver.rarity === 5 && driver.collectionSubName && driver.collectionSubName.endsWith('SUBTITLE_2')) {
      return { ...driver, rarity: 6 };
    }
    return driver;
  });
}

/**
 * Apply series mapping for Legendary, SE Standard, and SE Turbo drivers
 * Regular drivers (rarity < 4) keep their original series from JSON
 */
function applySeriesMapping(drivers) {
  return drivers.map(driver => {
    // Only apply series mapping to drivers with rarity >= 4
    if (driver.rarity >= 4) {
      let series;
      switch (driver.minGpTier) {
        case 0: series = 3; break;  // Junior → Series 3
        case 1: series = 6; break;  // Challenger → Series 6
        case 2: series = 9; break;  // Contender → Series 9
        case 3: series = 12; break; // Champion → Series 12
        default: series = 3; break; // Default to Junior
      }
      return { ...driver, series };
    }
    // Regular drivers (rarity < 4) keep their original series from JSON
    return driver;
  });
}

/**
 * Import to database
 */
async function importToDatabase(drivers) {
  try {
    console.log('🔧 Starting proper driver import process...');

    // 1. Clear existing drivers
    console.log('🧹 Clearing existing drivers from database...');
    const { error: deleteError } = await supabase
      .from('drivers')
      .delete()
      .gt('id', '00000000-0000-0000-0000-000000000000'); // Proper UUID safety check

    if (deleteError) {
      console.error('❌ Error clearing drivers:', deleteError);
      return;
    }

    // 2. Import new drivers
    console.log('📥 Importing new drivers...');
    let importCount = 0;
    let errorCount = 0;

    for (const driver of drivers) {
      const { error } = await supabase
        .from('drivers')
        .insert({
          id: driver.id,
          name: driver.name,
          rarity: driver.rarity,
          series: driver.series,
          min_gp_tier: driver.minGpTier,
          collection_sub_name: driver.collectionSubName,
          // Include other necessary fields
          icon: driver.icon || '',
          tag_name: driver.tagName || '',
          ordinal: driver.ordinal || 0,
          season_id: driver.seasonId || null,
          stats_per_level: driver.driverStatsPerLevel || [],
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error(`❌ Failed to import ${driver.name}:`, error);
        errorCount++;
      } else {
        importCount++;
      }
    }

    console.log(`\\n🎉 Import complete!`);
    console.log(`   - Successfully imported: ${importCount} drivers`);
    console.log(`   - Failed imports: ${errorCount} drivers`);

    return { importCount, errorCount };

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

/**
 * Verify results
 */
async function verifyResults() {
  try {
    console.log('\\n🔍 Verifying import results...');

    // Check SE Standard drivers (Rarity 5)
    const { data: seStandard } = await supabase
      .from('drivers')
      .select('name, series, min_gp_tier')
      .eq('rarity', 5);

    console.log(`\\n📊 SE Standard Drivers (Rarity 5): ${seStandard.length} drivers`);
    seStandard.forEach(d => console.log(`   ${d.name}: GP Tier ${d.min_gp_tier} → Series ${d.series}`));

    // Check SE Turbo drivers (Rarity 6)
    const { data: seTurbo } = await supabase
      .from('drivers')
      .select('name, series, min_gp_tier')
      .eq('rarity', 6);

    console.log(`\\n📊 SE Turbo Drivers (Rarity 6): ${seTurbo.length} drivers`);
    seTurbo.forEach(d => console.log(`   ${d.name}: GP Tier ${d.min_gp_tier} → Series ${d.series}`));

    // Check Legendary drivers (Rarity 4)
    const { data: legendary } = await supabase
      .from('drivers')
      .select('name, series, min_gp_tier')
      .eq('rarity', 4);

    console.log(`\\n📊 Legendary Drivers (Rarity 4): ${legendary.length} drivers`);
    legendary.forEach(d => console.log(`   ${d.name}: GP Tier ${d.min_gp_tier} → Series ${d.series}`));

    // Check regular drivers (Rarity < 4)
    const { data: regular } = await supabase
      .from('drivers')
      .select('name, series, min_gp_tier')
      .lt('rarity', 4)
      .limit(10);

    console.log(`\\n📊 Regular Drivers (Rarity < 4): Sample of 10 drivers`);
    regular.forEach(d => console.log(`   ${d.name}: Series ${d.series} (preserved from JSON)`));

    // Show series distribution for regular drivers
    const { data: allRegular } = await supabase
      .from('drivers')
      .select('series')
      .lt('rarity', 4);

    const bySeries = {};
    allRegular.forEach(d => {
      bySeries[d.series] = (bySeries[d.series] || 0) + 1;
    });

    console.log(`\\n📊 Regular Drivers Series Distribution (should match JSON):`);
    Object.keys(bySeries).sort((a,b) => a-b).forEach(series => {
      console.log(`   Series ${series}: ${bySeries[series]} drivers`);
    });

    console.log('\\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

/**
 * Main import process
 */
async function main() {
  try {
    // Step 1: Load original data from JSON (source of truth)
    console.log('📖 Loading original JSON data (source of truth)...');
    const originalDrivers = loadOriginalData();
    console.log(`📋 Found ${originalDrivers.length} drivers in original data`);

    // Step 2: Apply SE Turbo mapping
    console.log('\\n🔧 Applying SE Turbo mapping (Rarity 5 → Rarity 6)...');
    const driversWithTurboMapping = applySETurboMapping(originalDrivers);
    const seTurboCount = driversWithTurboMapping.filter(d => d.rarity === 6).length;
    console.log(`   - SE Turbo drivers mapped: ${seTurboCount}`);

    // Step 3: Apply series mapping (preserving original series for regular drivers)
    console.log('\\n🔧 Applying series mapping based on GP tier...');
    console.log('   - Legendary/SE drivers: series mapped based on minGpTier');
    console.log('   - Regular drivers: original series preserved from JSON');
    const driversWithSeriesMapping = applySeriesMapping(driversWithTurboMapping);
    const seriesMappedCount = driversWithSeriesMapping.filter(d => d.rarity >= 4 && d.series !== 0).length;
    console.log(`   - Series mapped drivers: ${seriesMappedCount}`);

    // Step 4: Import to database
    const importResults = await importToDatabase(driversWithSeriesMapping);

    // Step 5: Verify results
    await verifyResults();

    console.log('\\n🎉 Proper driver import process finished!');

  } catch (error) {
    console.error('❌ Import process failed:', error);
    process.exit(1);
  }
}

// Run the main process
main();