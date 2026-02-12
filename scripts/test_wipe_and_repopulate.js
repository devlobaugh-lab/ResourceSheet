#!/usr/bin/env node

/**
 * Test script for the complete wipe and repopulate process
 * Usage: node scripts/test_wipe_and_repopulate.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function testWipeAndRepopulate() {
  try {
    console.log('🧪 Starting comprehensive wipe and repopulate test...');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
      console.log('Current values:');
      console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'undefined');
      console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '[SET]' : 'undefined');
      process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Step 1: Backup current data
    console.log('💾 Step 1: Creating backup of current data...');
    const backup = await createBackup(supabase);
    console.log('✅ Backup created successfully');
    
    // Step 2: Verify current data exists
    console.log('🔍 Step 2: Verifying current data...');
    const beforeCounts = await getCounts(supabase);
    console.log('📊 Before wipe counts:', beforeCounts);
    
    if (beforeCounts.drivers === 0 && beforeCounts.collections === 0) {
      console.log('⚠️  Warning: No existing data found. This test will still work but won\'t demonstrate the wipe functionality.');
    }
    
    // Step 3: Execute wipe
    console.log('🗑️  Step 3: Executing wipe...');
    await executeWipe(supabase);
    
    // Step 4: Verify wipe was successful
    console.log('✅ Step 4: Verifying wipe...');
    const afterWipeCounts = await getCounts(supabase);
    console.log('📊 After wipe counts:', afterWipeCounts);
    
    if (afterWipeCounts.drivers !== 0 || afterWipeCounts.collections !== 0 || afterWipeCounts.car_parts !== 0) {
      console.error('❌ Wipe failed - data still exists');
      process.exit(1);
    }
    
    console.log('✅ Wipe verified successfully');
    
    // Step 5: Test content cache import (simulate)
    console.log('📥 Step 5: Testing content cache import compatibility...');
    const importTestResult = await testImportCompatibility(supabase);
    console.log('✅ Import compatibility test:', importTestResult);
    
    // Step 6: Restore from backup
    console.log('🔄 Step 6: Restoring from backup...');
    await restoreFromBackup(supabase, backup);
    
    // Step 7: Verify restore
    console.log('✅ Step 7: Verifying restore...');
    const afterRestoreCounts = await getCounts(supabase);
    console.log('📊 After restore counts:', afterRestoreCounts);
    
    // Verify counts match original
    if (JSON.stringify(afterRestoreCounts) !== JSON.stringify(beforeCounts)) {
      console.error('❌ Restore failed - counts don\'t match original');
      console.error('Expected:', beforeCounts);
      console.error('Actual:', afterRestoreCounts);
      process.exit(1);
    }
    
    console.log('✅ Restore verified successfully');
    console.log('🎉 Test completed successfully! The wipe and repopulate process is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function createBackup(supabase) {
  const backup = {
    drivers: [],
    car_parts: [],
    collections: [],
    user_drivers: [],
    user_car_parts: []
  };
  
  // Backup drivers
  const { data: drivers, error: driversError } = await supabase.from('drivers').select('*');
  if (driversError) throw driversError;
  backup.drivers = drivers || [];
  
  // Backup car_parts
  const { data: carParts, error: carPartsError } = await supabase.from('car_parts').select('*');
  if (carPartsError) throw carPartsError;
  backup.car_parts = carParts || [];
  
  // Backup collections
  const { data: collections, error: collectionsError } = await supabase.from('collections').select('*');
  if (collectionsError) throw collectionsError;
  backup.collections = collections || [];
  
  // Backup user_drivers
  const { data: userDrivers, error: userDriversError } = await supabase.from('user_drivers').select('*');
  if (userDriversError) throw userDriversError;
  backup.user_drivers = userDrivers || [];
  
  // Backup user_car_parts
  const { data: userCarParts, error: userCarPartsError } = await supabase.from('user_car_parts').select('*');
  if (userCarPartsError) throw userCarPartsError;
  backup.user_car_parts = userCarParts || [];
  
  return backup;
}

async function getCounts(supabase) {
  const counts = {};
  
  const { count: driversCount } = await supabase.from('drivers').select('*', { count: 'exact', head: true });
  counts.drivers = driversCount || 0;
  
  const { count: carPartsCount } = await supabase.from('car_parts').select('*', { count: 'exact', head: true });
  counts.car_parts = carPartsCount || 0;
  
  const { count: collectionsCount } = await supabase.from('collections').select('*', { count: 'exact', head: true });
  counts.collections = collectionsCount || 0;
  
  const { count: userDriversCount } = await supabase.from('user_drivers').select('*', { count: 'exact', head: true });
  counts.user_drivers = userDriversCount || 0;
  
  const { count: userCarPartsCount } = await supabase.from('user_car_parts').select('*', { count: 'exact', head: true });
  counts.user_car_parts = userCarPartsCount || 0;
  
  return counts;
}

async function executeWipe(supabase) {
  // Disable triggers
  await executeRawSQL(supabase, 'ALTER TABLE drivers DISABLE TRIGGER ALL');
  await executeRawSQL(supabase, 'ALTER TABLE car_parts DISABLE TRIGGER ALL');
  await executeRawSQL(supabase, 'ALTER TABLE collections DISABLE TRIGGER ALL');
  await executeRawSQL(supabase, 'ALTER TABLE user_drivers DISABLE TRIGGER ALL');
  await executeRawSQL(supabase, 'ALTER TABLE user_car_parts DISABLE TRIGGER ALL');
  
  // Clear data
  await executeRawSQL(supabase, 'DELETE FROM user_drivers');
  await executeRawSQL(supabase, 'DELETE FROM user_car_parts');
  await executeRawSQL(supabase, 'DELETE FROM drivers');
  await executeRawSQL(supabase, 'DELETE FROM car_parts');
  await executeRawSQL(supabase, 'DELETE FROM collections');
  
  // Re-enable triggers
  await executeRawSQL(supabase, 'ALTER TABLE drivers ENABLE TRIGGER ALL');
  await executeRawSQL(supabase, 'ALTER TABLE car_parts ENABLE TRIGGER ALL');
  await executeRawSQL(supabase, 'ALTER TABLE collections ENABLE TRIGGER ALL');
  await executeRawSQL(supabase, 'ALTER TABLE user_drivers ENABLE TRIGGER ALL');
  await executeRawSQL(supabase, 'ALTER TABLE user_car_parts ENABLE TRIGGER ALL');
}

async function testImportCompatibility(supabase) {
  // Test that the import system can work with empty tables
  // This simulates what would happen when importing fresh data
  
  // Test inserting a sample driver
  const sampleDriver = {
    id: 'test-driver-id',
    name: 'Test Driver',
    rarity: 1,
    series: 6,
    stats_per_level: [
      { overtaking: 10, blocking: 10, qualifying: 10, tyreUse: 10, raceStart: 10 }
    ]
  };
  
  const { error: driverError } = await supabase.from('drivers').insert([sampleDriver]);
  if (driverError) {
    return `Driver import test failed: ${driverError.message}`;
  }
  
  // Test inserting a sample collection
  const sampleCollection = {
    id: 'test-collection-id',
    name: 'Test Collection',
    theme: 'Test Theme',
    ordinal: 1
  };
  
  const { error: collectionError } = await supabase.from('collections').insert([sampleCollection]);
  if (collectionError) {
    return `Collection import test failed: ${collectionError.message}`;
  }
  
  // Clean up test data
  await executeRawSQL(supabase, "DELETE FROM drivers WHERE id = 'test-driver-id'");
  await executeRawSQL(supabase, "DELETE FROM collections WHERE id = 'test-collection-id'");
  
  return 'Import system is compatible with separate tables';
}

async function restoreFromBackup(supabase, backup) {
  // Restore in order to respect foreign key constraints
  if (backup.collections.length > 0) {
    const { error } = await supabase.from('collections').insert(backup.collections);
    if (error) throw error;
  }
  
  if (backup.drivers.length > 0) {
    const { error } = await supabase.from('drivers').insert(backup.drivers);
    if (error) throw error;
  }
  
  if (backup.car_parts.length > 0) {
    const { error } = await supabase.from('car_parts').insert(backup.car_parts);
    if (error) throw error;
  }
  
  if (backup.user_drivers.length > 0) {
    const { error } = await supabase.from('user_drivers').insert(backup.user_drivers);
    if (error) throw error;
  }
  
  if (backup.user_car_parts.length > 0) {
    const { error } = await supabase.from('user_car_parts').insert(backup.user_car_parts);
    if (error) throw error;
  }
}

async function executeRawSQL(supabase, sql) {
  // Note: This is a placeholder function
  // In practice, you would need to use a different method to execute raw SQL
  // such as using the Supabase CLI or direct database connection
  console.log(`Executing: ${sql}`);
  // For now, we'll simulate success
  return { status: 200 };
}

// Execute the test if this script is run directly
if (require.main === module) {
  testWipeAndRepopulate();
}

module.exports = { testWipeAndRepopulate };