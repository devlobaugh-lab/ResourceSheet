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

async function seedData() {
  try {
    console.log('🌱 Starting direct database seeding...');

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

    // 2. Seed car parts
    console.log('🔧 Seeding car parts...');
    const carPartsJson = fs.readFileSync('globalContent/season_6.carparts.json', 'utf8');
    const carPartsData = JSON.parse(carPartsJson);

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

    // Insert in batches to avoid timeout
    const batchSize = 50;
    for (let i = 0; i < transformedCarParts.length; i += batchSize) {
      const batch = transformedCarParts.slice(i, i + batchSize);
      const { error: batchError } = await supabase
        .from('car_parts')
        .upsert(batch);

      if (batchError) {
        console.error(`❌ Car parts batch ${i}-${i+batchSize} failed:`, batchError);
        return;
      }
      console.log(`✅ Car parts batch ${i}-${i+batchSize} completed`);
    }
    console.log('✅ All car parts seeded');

    // 3. Seed drivers
    console.log('🏎️ Seeding drivers...');
    const driversJson = fs.readFileSync('globalContent/season_6.drivers.json', 'utf8');
    const driversData = JSON.parse(driversJson);

    // Transform the data to match the database schema
    const transformedDrivers = driversData.map(driver => ({
      id: driver.id,
      name: driver.name,
      series: driver.series,
      ordinal: driver.ordinal || 0,
      rarity: driver.rarity || 0,
      season_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      icon: driver.icon,
      cc_price: driver.ccPrice || 0,
      num_duplicates_after_unlock: driver.numDuplicatesAfterUnlock || 0,
      collection_id: driver.collectionId || null,
      visual_override: driver.visualOverride || null,
      collection_sub_name: driver.collectionSubName || null,
      stats_per_level: driver.driverStatsPerLevel || []
    }));

    // Insert in batches to avoid timeout
    for (let i = 0; i < transformedDrivers.length; i += batchSize) {
      const batch = transformedDrivers.slice(i, i + batchSize);
      const { error: batchError } = await supabase
        .from('drivers')
        .upsert(batch);

      if (batchError) {
        console.error(`❌ Drivers batch ${i}-${i+batchSize} failed:`, batchError);
        return;
      }
      console.log(`✅ Drivers batch ${i}-${i+batchSize} completed`);
    }
    console.log('✅ All drivers seeded');

    // 3. Seed boosts
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

    console.log('🎉 Direct seeding completed successfully!');

  } catch (error) {
    console.error('❌ Direct seeding failed:', error);
  }
}

seedData();
