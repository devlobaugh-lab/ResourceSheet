const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Use direct PostgreSQL connection for local development
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 54322,
});

async function seedDrivers() {
  console.log('Seeding drivers table...');

  try {
    // Read drivers JSON file
    const driversData = JSON.parse(fs.readFileSync(path.join(__dirname, '../globalContent/season_6.drivers.json'), 'utf8'));

    // Transform data for database
    const driversToInsert = driversData.map(driver => ({
      id: driver.id,
      name: driver.name,
      rarity: driver.rarity,
      series: driver.series,
      season_id: '00000000-0000-0000-0000-000000000001', // Default season, update as needed
      icon: driver.icon,
      cc_price: driver.ccPrice,
      num_duplicates_after_unlock: driver.numDuplicatesAfterUnlock,
      collection_id: driver.collectionId,
      visual_override: driver.visualOverride,
      collection_sub_name: driver.collectionSubName,
      min_gp_tier: driver.minGpTier,
      tag_name: driver.tagName,
      ordinal: driver.ordinal,
      stats_per_level: driver.driverStatsPerLevel,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert drivers in batches
    const batchSize = 50;
    for (let i = 0; i < driversToInsert.length; i += batchSize) {
      const batch = driversToInsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from('drivers')
        .insert(batch);

      if (error) {
        console.error('Error inserting drivers batch:', error);
        throw error;
      }

      console.log(`Inserted drivers batch ${i/batchSize + 1}: ${batch.length} records`);
    }

    console.log(`Successfully seeded ${driversToInsert.length} drivers`);
  } catch (error) {
    console.error('Error seeding drivers:', error);
    throw error;
  }
}

async function seedCarParts() {
  console.log('Seeding car_parts table...');

  try {
    // Read car parts JSON file
    const carPartsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../globalContent/season_6.carparts.json'), 'utf8'));

    // Transform data for database
    const carPartsToInsert = carPartsData.map(carPart => ({
      id: carPart.id,
      name: carPart.name,
      rarity: carPart.rarity,
      series: carPart.series,
      season_id: '00000000-0000-0000-0000-000000000001', // Default season, update as needed
      icon: carPart.icon,
      cc_price: carPart.ccPrice,
      num_duplicates_after_unlock: carPart.numDuplicatesAfterUnlock,
      collection_id: carPart.collectionId,
      visual_override: carPart.visualOverride,
      collection_sub_name: carPart.collectionSubName,
      car_part_type: carPart.carPartType,
      stats_per_level: carPart.carPartStatsPerLevel,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert car parts in batches
    const batchSize = 50;
    for (let i = 0; i < carPartsToInsert.length; i += batchSize) {
      const batch = carPartsToInsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from('car_parts')
        .insert(batch);

      if (error) {
        console.error('Error inserting car parts batch:', error);
        throw error;
      }

      console.log(`Inserted car parts batch ${i/batchSize + 1}: ${batch.length} records`);
    }

    console.log(`Successfully seeded ${carPartsToInsert.length} car parts`);
  } catch (error) {
    console.error('Error seeding car parts:', error);
    throw error;
  }
}

async function seedBoosts() {
  console.log('Seeding boosts table...');

  try {
    // Read boosts JSON file
    const boostsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../globalContent/boosts.json'), 'utf8'));

    // Transform data for database
    const boostsToInsert = boostsData.map(boost => ({
      id: boost.id,
      name: boost.name,
      icon: boost.icon,
      boost_type: 'standard', // Default type, update as needed
      rarity: 3, // Default rarity, update as needed
      boost_stats: {
        overtake_tier: boost.overtakeTier,
        block_tier: boost.blockTier,
        speed_tier: boost.speedTier,
        corners_tier: boost.cornersTier,
        tyre_use_tier: boost.tyreUseTier,
        reliability_tier: boost.reliabilityTier,
        pit_stop_time_tier: boost.pitStopTimeTier,
        power_unit_tier: boost.powerUnitTier,
        race_start_tier: boost.raceStartTier,
        drs_tier: boost.DrsTier
      },
      series: null,
      season_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert boosts in batches
    const batchSize = 50;
    for (let i = 0; i < boostsToInsert.length; i += batchSize) {
      const batch = boostsToInsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from('boosts')
        .insert(batch);

      if (error) {
        console.error('Error inserting boosts batch:', error);
        throw error;
      }

      console.log(`Inserted boosts batch ${i/batchSize + 1}: ${batch.length} records`);
    }

    console.log(`Successfully seeded ${boostsToInsert.length} boosts`);
  } catch (error) {
    console.error('Error seeding boosts:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting database seeding process...');

    // Check if tables exist first
    const { data: driversTable, error: driversError } = await supabase
      .from('drivers')
      .select('*')
      .limit(1);

    const { data: carPartsTable, error: carPartsError } = await supabase
      .from('car_parts')
      .select('*')
      .limit(1);

    const { data: boostsTable, error: boostsError } = await supabase
      .from('boosts')
      .select('*')
      .limit(1);

    if (driversError && driversError.message.includes('relation "drivers" does not exist')) {
      console.log('Drivers table does not exist. Please run the database migration first.');
      return;
    }

    if (carPartsError && carPartsError.message.includes('relation "car_parts" does not exist')) {
      console.log('Car parts table does not exist. Please run the database migration first.');
      return;
    }

    if (boostsError && boostsError.message.includes('relation "boosts" does not exist')) {
      console.log('Boosts table does not exist. Please run the database migration first.');
      return;
    }

    // Clear existing data if tables are not empty
    if (driversTable && driversTable.length > 0) {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) console.error('Error clearing drivers:', error);
    }

    if (carPartsTable && carPartsTable.length > 0) {
      const { error } = await supabase
        .from('car_parts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) console.error('Error clearing car parts:', error);
    }

    if (boostsTable && boostsTable.length > 0) {
      const { error } = await supabase
        .from('boosts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) console.error('Error clearing boosts:', error);
    }

    // Seed the tables
    await seedDrivers();
    await seedCarParts();
    await seedBoosts();

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error in main seeding process:', error);
    process.exit(1);
  }
}

// Run the seeding process
main();