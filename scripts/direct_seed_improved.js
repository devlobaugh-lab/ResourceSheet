const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Create Supabase client with service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to determine mapped rarity for drivers
function getMappedDriverRarity(originalRarity, collectionSubName) {
  // Special Edition Turbo drivers (SUBTITLE_2) get mapped to rarity 6
  if (originalRarity === 5 && collectionSubName && collectionSubName.endsWith('SUBTITLE_2')) {
    return 6;
  }
  return originalRarity;
}

// Helper function to process data in chunks
async function processInChunks(data, chunkSize, processFunction) {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await processFunction(chunk, i, chunkSize);
  }
}

async function seedData() {
  try {
    console.log('🌱 Starting improved database seeding...');

    // 1. Seed seasons first
    console.log('🌱 Seeding seasons...');
    const seasonsData = [
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Season 6',
        is_active: true
      }
    ];

    const { error: seasonsError } = await supabase
      .from('seasons')
      .upsert(seasonsData);

    if (seasonsError) {
      console.error('❌ Seasons seeding failed:', seasonsError);
      return;
    }
    console.log('✅ Seasons seeded');

    // 2. Seed car parts using chunked processing
    console.log('🔧 Seeding car parts...');
    console.log('Reading car parts JSON file...');
    const carPartsJson = fs.readFileSync('globalContent/season_6.carparts.json', 'utf8');
    const carPartsData = JSON.parse(carPartsJson);
    console.log(`Found ${carPartsData.length} car parts to process`);

    // Transform the data to match the database schema
    const transformedCarParts = carPartsData.map(carPart => ({
      id: carPart.id,
      name: carPart.name,
      rarity: carPart.rarity || 0,
      series: carPart.series,
      season_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      icon: carPart.icon,
      cc_price: carPart.ccPrice || 0,
      num_duplicates_after_unlock: carPart.numDuplicatesAfterUnlock || 0,
      collection_id: carPart.collectionId || null,
      visual_override: carPart.visualOverride || null,
      collection_sub_name: carPart.collectionSubName || null,
      car_part_type: carPart.carPartType || 0,
      stats_per_level: carPart.carPartStatsPerLevel || []
    }));

    // Insert in chunks to avoid timeout
    const batchSize = 50;
    await processInChunks(transformedCarParts, batchSize, async (chunk, startIndex) => {
      const { error: batchError } = await supabase
        .from('car_parts')
        .upsert(chunk);

      if (batchError) {
        console.error(`❌ Car parts batch ${startIndex}-${startIndex + chunk.length} failed:`, batchError);
        throw batchError;
      }
      console.log(`✅ Car parts batch ${startIndex}-${startIndex + chunk.length} completed`);
    });
    console.log('✅ All car parts seeded');

    // 3. Seed drivers using chunked processing with rarity mapping
    console.log('🏎️ Seeding drivers...');
    console.log('Reading drivers JSON file...');
    const driversJson = fs.readFileSync('globalContent/season_6.drivers.json', 'utf8');
    const driversData = JSON.parse(driversJson);
    console.log(`Found ${driversData.length} drivers to process`);

    // Count Special Edition drivers for logging
    const seDrivers = driversData.filter(d => d.rarity === 5);
    const turboSeDrivers = seDrivers.filter(d => d.collectionSubName && d.collectionSubName.endsWith('SUBTITLE_2'));
    const standardSeDrivers = seDrivers.filter(d => d.collectionSubName && d.collectionSubName.endsWith('SUBTITLE_1'));

    console.log(`📊 Special Edition breakdown:`);
    console.log(`   - Standard SE (rarity 5): ${standardSeDrivers.length} drivers`);
    console.log(`   - Turbo SE (rarity 6): ${turboSeDrivers.length} drivers`);

    // Transform the data to match the database schema with rarity mapping
    const transformedDrivers = driversData.map(driver => ({
      id: driver.id,
      name: driver.name,
      series: driver.series,
      ordinal: driver.ordinal || 0,
      rarity: getMappedDriverRarity(driver.rarity || 0, driver.collectionSubName),
      season_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      icon: driver.icon,
      cc_price: driver.ccPrice || 0,
      num_duplicates_after_unlock: driver.numDuplicatesAfterUnlock || 0,
      collection_id: driver.collectionId || null,
      visual_override: driver.visualOverride || null,
      collection_sub_name: driver.collectionSubName || null,
      stats_per_level: driver.driverStatsPerLevel || []
    }));

    // Insert in chunks to avoid timeout
    await processInChunks(transformedDrivers, batchSize, async (chunk, startIndex) => {
      const { error: batchError } = await supabase
        .from('drivers')
        .upsert(chunk);

      if (batchError) {
        console.error(`❌ Drivers batch ${startIndex}-${startIndex + chunk.length} failed:`, batchError);
        throw batchError;
      }
      console.log(`✅ Drivers batch ${startIndex}-${startIndex + chunk.length} completed`);
    });
    console.log('✅ All drivers seeded');

    // 4. Seed boosts
    console.log('🚀 Seeding boosts...');
    const boostsJson = fs.readFileSync('globalContent/boosts.json', 'utf8');
    const boostsData = JSON.parse(boostsJson);

    const transformedBoosts = boostsData.map(boost => ({
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
    }));

    const { error: boostsError } = await supabase
      .from('boosts')
      .upsert(transformedBoosts);

    if (boostsError) {
      console.error('❌ Boosts seeding failed:', boostsError);
      return;
    }
    console.log('✅ Boosts seeded');

    console.log('🎉 Improved seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${transformedCarParts.length} car parts processed`);
    console.log(`   - ${transformedDrivers.length} drivers processed (${turboSeDrivers.length} Turbo SE mapped to rarity 6)`);
    console.log(`   - ${transformedBoosts.length} boosts processed`);

  } catch (error) {
    console.error('❌ Improved seeding failed:', error);
    process.exit(1);
  }
}

seedData();
