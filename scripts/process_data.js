/**
 * Data Processing Script for F1 Resource Manager
 * Processes JSON data files and generates SQL seed files
 */

const fs = require('fs');
const path = require('path');

// File paths
const DATA_DIR = path.join(__dirname, '../globalContent');
const OUTPUT_DIR = path.join(__dirname, '../../db/seeds');

const SEASONS_FILE = 'season_6.drivers.json';
const CAR_PARTS_FILE = 'season_6.carparts.json';
const BOOSTS_FILE = 'boosts.json';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Process seasons data
 */
function processSeasons() {
  console.log('Processing seasons...');

  const sql = `-- Season 6 Data
INSERT INTO seasons (id, name, is_active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Season 6', true);`;

  return sql;
}

/**
 * Process car parts data
 */
function processCarParts() {
  console.log('Processing car parts...');

  const carPartsPath = path.join(DATA_DIR, CAR_PARTS_FILE);
  const carPartsData = JSON.parse(fs.readFileSync(carPartsPath, 'utf8'));

  // Get season 6 ID - we'll use a placeholder for now
  const season6Id = "'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'";

  const values = carPartsData.map(part => {
    const stats = JSON.stringify(part.carPartStatsPerLevel).replace(/'/g, "''");

    return `('${part.id}', '${part.name.replace(/'/g, "''")}', ${part.rarity}, ${part.series}, ${season6Id}, '${part.icon}', ${part.ccPrice}, ${part.numDuplicatesAfterUnlock}, ${part.collectionId ? `'${part.collectionId}'` : 'NULL'}, ${part.visualOverride ? `'${part.visualOverride.replace(/'/g, "''")}'` : 'NULL'}, ${part.collectionSubName ? `'${part.collectionSubName.replace(/'/g, "''")}'` : 'NULL'}, ${part.carPartType}, '${stats}')`;
  }).join(',\n    ');

  const sql = `-- Car Parts Data for Season 6
INSERT INTO car_parts (id, name, rarity, series, season_id, icon, cc_price, num_duplicates_after_unlock, collection_id, visual_override, collection_sub_name, car_part_type, stats_per_level) VALUES
    ${values};`;

  return sql;
}

/**
 * Process drivers data
 */
function processDrivers() {
  console.log('Processing drivers...');

  const driversPath = path.join(DATA_DIR, SEASONS_FILE);
  const driversData = JSON.parse(fs.readFileSync(driversPath, 'utf8'));

  // Get season 6 ID - we'll use a placeholder for now
  const season6Id = "'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'";

  const values = driversData.map(driver => {
    const stats = JSON.stringify(driver.driverStatsPerLevel).replace(/'/g, "''");

    return `('${driver.id}', '${driver.name.replace(/'/g, "''")}', ${driver.rarity}, ${driver.series}, ${season6Id}, '${driver.icon}', ${driver.ccPrice}, ${driver.numDuplicatesAfterUnlock}, ${driver.collectionId ? `'${driver.collectionId}'` : 'NULL'}, ${driver.visualOverride ? `'${driver.visualOverride.replace(/'/g, "''")}'` : 'NULL'}, ${driver.collectionSubName ? `'${driver.collectionSubName.replace(/'/g, "''")}'` : 'NULL'}, ${driver.minGpTier || 'NULL'}, '${driver.tagName}', ${driver.ordinal}, '${stats}')`;
  }).join(',\n    ');

  const sql = `-- Drivers Data for Season 6
INSERT INTO drivers (id, name, rarity, series, season_id, icon, cc_price, num_duplicates_after_unlock, collection_id, visual_override, collection_sub_name, min_gp_tier, tag_name, ordinal, stats_per_level) VALUES
    ${values};`;

  return sql;
}

/**
 * Process boosts data
 */
function processBoosts() {
  console.log('Processing boosts...');

  const boostsPath = path.join(DATA_DIR, BOOSTS_FILE);
  const boostsData = JSON.parse(fs.readFileSync(boostsPath, 'utf8'));

  const values = boostsData.map(boost => {
    const displayName = boost.name.startsWith('BOOST_NAME_') ? `Boost ${boost.name.split('_')[2]}` : boost.name;
    const boostStats = JSON.stringify({
      speed: boost.speedTier || 0,
      block: boost.blockTier || 0,
      overtake: boost.overtakeTier || 0,
      corners: boost.cornersTier || 0,
      tyre_use: boost.tyreUseTier || 0,
      pit_stop: boost.pitStopTimeTier || 0,
      power_unit: boost.powerUnitTier || 0,
      race_start: boost.raceStartTier || 0,
      duration: 30 // Default duration
    });

    return `('${boost.id}', '${displayName.replace(/'/g, "''")}', '${boost.icon}', '${boostStats.replace(/'/g, "''")}')`;
  }).join(',\n    ');

  const sql = `-- Boosts Data
INSERT INTO boosts (id, name, icon, boost_stats) VALUES
    ${values};`;

  return sql;
}

/**
 * Generate all seed files
 */
function generateSeedFiles() {
  console.log('Generating seed files...\n');
  
  try {
    // Generate seasons seed
    const seasonsSQL = processSeasons();
    fs.writeFileSync(path.join(OUTPUT_DIR, '01_seasons.sql'), seasonsSQL);
    console.log('✓ Generated 01_seasons.sql');
    
    // Generate car parts seed
    const carPartsSQL = processCarParts();
    fs.writeFileSync(path.join(OUTPUT_DIR, '02_car_parts.sql'), carPartsSQL);
    console.log('✓ Generated 02_car_parts.sql');
    
    // Generate drivers seed
    const driversSQL = processDrivers();
    fs.writeFileSync(path.join(OUTPUT_DIR, '03_drivers.sql'), driversSQL);
    console.log('✓ Generated 03_drivers.sql');
    
    // Generate boosts seed
    const boostsSQL = processBoosts();
    fs.writeFileSync(path.join(OUTPUT_DIR, '04_boosts.sql'), boostsSQL);
    console.log('✓ Generated 04_boosts.sql');
    
    // Generate master seed file
    const masterSeed = `-- Master Seed File for F1 Resource Manager
-- Run these files in order to populate the database

\\i 01_seasons.sql
\\i 02_car_parts.sql
\\i 03_drivers.sql
\\i 04_boosts.sql

-- Verify data
SELECT 'Seasons' as table_name, COUNT(*) as count FROM seasons
UNION ALL
SELECT 'Car Parts', COUNT(*) FROM car_parts
UNION ALL
SELECT 'Drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'Boosts', COUNT(*) FROM boosts;`;

    fs.writeFileSync(path.join(OUTPUT_DIR, '00_master_seed.sql'), masterSeed);
    console.log('✓ Generated 00_master_seed.sql');
    
    console.log('\n✅ All seed files generated successfully!');
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log('\nTo populate the database, run:');
    console.log('  psql -d your_database -f 00_master_seed.sql');
    
  } catch (error) {
    console.error('❌ Error generating seed files:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateSeedFiles();
}

module.exports = {
  processSeasons,
  processCarParts,
  processDrivers,
  processBoosts,
  generateSeedFiles
};
