/**
 * Update Special Drivers Series Numbers
 *
 * This script transforms drivers with series=0 to have series numbers
 * that correspond to their GP tier eligibility.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

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
 * Map GP tier to series number
 * Based on the game's GP tier system:
 * - Junior: series ≤ 3 OR min_gp_tier ≤ 0
 * - Challenger: series ≤ 6 OR min_gp_tier ≤ 1
 * - Contender: series ≤ 9 OR min_gp_tier ≤ 2
 * - Champion: all drivers
 */
function getSeriesForGPTier(minGpTier: number | null): number {
  if (minGpTier === null || minGpTier === 0) {
    return 1; // Junior tier
  } else if (minGpTier === 1) {
    return 4; // Challenger tier
  } else if (minGpTier === 2) {
    return 7; // Contender tier
  } else if (minGpTier >= 3) {
    return 10; // Champion tier
  }
  return 1; // Default to Junior
}

/**
 * Update drivers with series=0 to appropriate series based on GP tier
 */
async function updateSpecialDrivers() {
  try {
    console.log('🔄 Starting special drivers series update...');

    // 1. Fetch all drivers with series=0
    console.log('📊 Fetching drivers with series=0...');
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('series', 0);

    if (error) {
      console.error('❌ Error fetching drivers:', error);
      return;
    }

    if (!drivers || drivers.length === 0) {
      console.log('ℹ️ No drivers found with series=0');
      return;
    }

    console.log(`📋 Found ${drivers.length} drivers with series=0`);

    // 2. Calculate new series numbers based on GP tier
    const updates = drivers.map(driver => {
      const newSeries = getSeriesForGPTier(driver.min_gp_tier);
      return {
        id: driver.id,
        currentSeries: driver.series,
        newSeries,
        name: driver.name,
        rarity: driver.rarity,
        minGpTier: driver.min_gp_tier
      };
    });

    // 3. Display what will be changed
    console.log('\\n📝 Proposed changes:');
    updates.forEach(update => {
      console.log(`  ${update.name} (Rarity ${update.rarity}, GP Tier ${update.minGpTier}): ${update.currentSeries} → ${update.newSeries}`);
    });

    // 4. Apply the updates
    console.log('\\n🔄 Applying updates...');
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('drivers')
        .update({ series: update.newSeries })
        .eq('id', update.id);

      if (updateError) {
        console.error(`❌ Failed to update ${update.name}:`, updateError);
      } else {
        console.log(`✅ Updated ${update.name}: series ${update.currentSeries} → ${update.newSeries}`);
      }
    }

    // 5. Also update the JSON source file
    console.log('\\n📁 Updating JSON source file...');
    const driversJsonPath = path.join(process.cwd(), 'globalContent/season_6.drivers.json');
    const driversData = JSON.parse(fs.readFileSync(driversJsonPath, 'utf8'));

    const updatedDriversData = driversData.map((driver: any) => {
      const matchingUpdate = updates.find(u => u.name === driver.name);
      if (matchingUpdate && driver.series === 0) {
        return { ...driver, series: matchingUpdate.newSeries };
      }
      return driver;
    });

    fs.writeFileSync(driversJsonPath, JSON.stringify(updatedDriversData, null, 2));
    console.log('✅ JSON source file updated');

    console.log(`\\n🎉 Successfully updated ${updates.length} drivers!`);
    console.log('📊 Summary:');
    console.log(`   - Junior tier (series 1): ${updates.filter(u => u.newSeries === 1).length} drivers`);
    console.log(`   - Challenger tier (series 4): ${updates.filter(u => u.newSeries === 4).length} drivers`);
    console.log(`   - Contender tier (series 7): ${updates.filter(u => u.newSeries === 7).length} drivers`);
    console.log(`   - Champion tier (series 10): ${updates.filter(u => u.newSeries === 10).length} drivers`);

  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  updateSpecialDrivers();
}

export { updateSpecialDrivers, getSeriesForGPTier };