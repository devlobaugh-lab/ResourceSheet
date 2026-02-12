#!/usr/bin/env node

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearCollectionsAndDrivers() {
  try {
    console.log('🧹 Clearing collections and drivers tables...');
    
    // Clear user data first (foreign key constraints)
    console.log('🗑️  Clearing user data...');
    const { error: userDriversError } = await supabase
      .from('user_drivers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (userDriversError) {
      console.log('❌ User drivers delete error:', userDriversError.message);
    } else {
      console.log('✅ Cleared user_drivers table');
    }

    const { error: userCarPartsError } = await supabase
      .from('user_car_parts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (userCarPartsError) {
      console.log('❌ User car parts delete error:', userCarPartsError.message);
    } else {
      console.log('✅ Cleared user_car_parts table');
    }

    const { error: userBoostsError } = await supabase
      .from('user_boosts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (userBoostsError) {
      console.log('❌ User boosts delete error:', userBoostsError.message);
    } else {
      console.log('✅ Cleared user_boosts table');
    }

    // Clear user assets
    const { error: userAssetsError } = await supabase
      .from('user_assets')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (userAssetsError) {
      console.log('❌ User assets delete error:', userAssetsError.message);
    } else {
      console.log('✅ Cleared user_assets table');
    }

    // Clear user setups
    const { error: userSetupsError } = await supabase
      .from('user_car_setups')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (userSetupsError) {
      console.log('❌ User setups delete error:', userSetupsError.message);
    } else {
      console.log('✅ Cleared user_car_setups table');
    }

    // Clear track guides
    const { error: trackGuidesError } = await supabase
      .from('track_guides')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (trackGuidesError) {
      console.log('❌ Track guides delete error:', trackGuidesError.message);
    } else {
      console.log('✅ Cleared track_guides table');
    }

    // Clear drivers table
    console.log('🗑️  Clearing drivers table...');
    const { error: driversError } = await supabase
      .from('drivers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (driversError) {
      console.log('❌ Drivers delete error:', driversError.message);
    } else {
      console.log('✅ Cleared drivers table');
    }

    // Clear car_parts table
    console.log('🗑️  Clearing car_parts table...');
    const { error: carPartsError } = await supabase
      .from('car_parts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (carPartsError) {
      console.log('❌ Car parts delete error:', carPartsError.message);
    } else {
      console.log('✅ Cleared car_parts table');
    }

    // Clear boosts table
    console.log('🗑️  Clearing boosts table...');
    const { error: boostsError } = await supabase
      .from('boosts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (boostsError) {
      console.log('❌ Boosts delete error:', boostsError.message);
    } else {
      console.log('✅ Cleared boosts table');
    }

    // Clear collections table
    console.log('🗑️  Clearing collections table...');
    const { error: collectionsError } = await supabase
      .from('collections')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (collectionsError) {
      console.log('❌ Collections delete error:', collectionsError.message);
    } else {
      console.log('✅ Cleared collections table');
    }

    // Clear catalog_items table
    console.log('🗑️  Clearing catalog_items table...');
    const { error: catalogItemsError } = await supabase
      .from('catalog_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (catalogItemsError) {
      console.log('❌ Catalog items delete error:', catalogItemsError.message);
    } else {
      console.log('✅ Cleared catalog_items table');
    }

    console.log('\n🎉 Tables cleared successfully!');
    console.log('\n📋 Summary:');
    console.log('   - collections: ✅ Cleared');
    console.log('   - drivers: ✅ Cleared');
    console.log('   - car_parts: ✅ Cleared');
    console.log('   - boosts: ✅ Cleared');
    console.log('   - catalog_items: ✅ Cleared');
    console.log('   - user_drivers: ✅ Cleared');
    console.log('   - user_car_parts: ✅ Cleared');
    console.log('   - user_boosts: ✅ Cleared');
    console.log('   - user_assets: ✅ Cleared');
    console.log('   - user_car_setups: ✅ Cleared');
    console.log('   - track_guides: ✅ Cleared');
    
    console.log('\n✅ You can now re-import the content_cache data using the app!');
    console.log('   The import process will now correctly map collection fields.');
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

clearCollectionsAndDrivers();