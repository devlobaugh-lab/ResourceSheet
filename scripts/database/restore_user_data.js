const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Your user data export
const userData = {
  "exportedAt": "2026-01-19T05:29:04.840Z",
  "userDrivers": [
    {
      "driver_id": "569534f6-4378-473a-aede-2626c11e5316",
      "level": 0,
      "card_count": 0
    },
    {
      "driver_id": "d63aca7f-0fd1-4315-be5e-9ef314e413bf",
      "level": 11,
      "card_count": 0
    }
  ],
  "userCarParts": [
    {
      "car_part_id": "47cf77e9-29c7-4243-bb1b-809ea47c2e34",
      "level": 8,
      "card_count": 138
    },
    {
      "car_part_id": "e6eff945-f1d0-45da-b5c2-233e91bc94e4",
      "level": 11,
      "card_count": 0
    }
  ],
  "userBoosts": [
    {
      "boost_id": "599fd54b-4438-4928-9d4c-51eb3c0c5a24",
      "level": 0,
      "card_count": 1
    }
  ]
};

async function restoreUserData() {
  try {
    console.log('🔄 Starting user data restoration...');

    // Admin user ID from the recreated account
    const userId = '75b54de8-7be9-4809-9195-61352d18decf'; // thomas.lobaugh@gmail.com

    console.log('👤 Using user ID:', userId);

    // Validate that the user exists
    const { data: userCheck, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !userCheck) {
      console.error('❌ User not found. Please check your user ID.');
      console.log('💡 You can find your user ID in the Supabase dashboard under Authentication > Users');
      return;
    }

    console.log('✅ Found user:', userCheck.email);

    // Validate driver IDs exist
    if (userData.userDrivers && userData.userDrivers.length > 0) {
      console.log('🔍 Validating driver IDs...');
      const driverIds = userData.userDrivers.map(d => d.driver_id);
      const { data: existingDrivers, error: driversError } = await supabase
        .from('drivers')
        .select('id, name')
        .in('id', driverIds);

      if (driversError) {
        console.error('❌ Error validating drivers:', driversError);
        return;
      }

      const existingIds = new Set(existingDrivers.map(d => d.id));
      const invalidIds = driverIds.filter(id => !existingIds.has(id));

      if (invalidIds.length > 0) {
        console.error('❌ Invalid driver IDs:', invalidIds);
        return;
      }

      console.log('✅ All driver IDs are valid');
    }

    // Validate car part IDs exist
    if (userData.userCarParts && userData.userCarParts.length > 0) {
      console.log('🔍 Validating car part IDs...');
      const carPartIds = userData.userCarParts.map(p => p.car_part_id);
      const { data: existingParts, error: partsError } = await supabase
        .from('car_parts')
        .select('id, name')
        .in('id', carPartIds);

      if (partsError) {
        console.error('❌ Error validating car parts:', partsError);
        return;
      }

      const existingIds = new Set(existingParts.map(p => p.id));
      const invalidIds = carPartIds.filter(id => !existingIds.has(id));

      if (invalidIds.length > 0) {
        console.error('❌ Invalid car part IDs:', invalidIds);
        return;
      }

      console.log('✅ All car part IDs are valid');
    }

    // Validate boost IDs exist
    if (userData.userBoosts && userData.userBoosts.length > 0) {
      console.log('🔍 Validating boost IDs...');
      const boostIds = userData.userBoosts.map(b => b.boost_id);
      const { data: existingBoosts, error: boostsError } = await supabase
        .from('boosts')
        .select('id, name')
        .in('id', boostIds);

      if (boostsError) {
        console.error('❌ Error validating boosts:', boostsError);
        return;
      }

      const existingIds = new Set(existingBoosts.map(b => b.id));
      const invalidIds = boostIds.filter(id => !existingIds.has(id));

      if (invalidIds.length > 0) {
        console.error('❌ Invalid boost IDs:', invalidIds);
        return;
      }

      console.log('✅ All boost IDs are valid');
    }

    // Insert drivers
    if (userData.userDrivers && userData.userDrivers.length > 0) {
      console.log('📝 Inserting user drivers...');
      const driversToInsert = userData.userDrivers.map(driver => ({
        user_id: userId,
        driver_id: driver.driver_id,
        level: driver.level,
        card_count: driver.card_count
      }));

      const { error: insertError } = await supabase
        .from('user_drivers')
        .insert(driversToInsert);

      if (insertError) {
        console.error('❌ Error inserting drivers:', insertError);
        return;
      }

      console.log(`✅ Inserted ${driversToInsert.length} drivers`);
    }

    // Insert car parts
    if (userData.userCarParts && userData.userCarParts.length > 0) {
      console.log('📝 Inserting user car parts...');
      const partsToInsert = userData.userCarParts.map(part => ({
        user_id: userId,
        car_part_id: part.car_part_id,
        level: part.level,
        card_count: part.card_count
      }));

      const { error: insertError } = await supabase
        .from('user_car_parts')
        .insert(partsToInsert);

      if (insertError) {
        console.error('❌ Error inserting car parts:', insertError);
        return;
      }

      console.log(`✅ Inserted ${partsToInsert.length} car parts`);
    }

    // Insert boosts
    if (userData.userBoosts && userData.userBoosts.length > 0) {
      console.log('📝 Inserting user boosts...');
      const boostsToInsert = userData.userBoosts.map(boost => ({
        user_id: userId,
        boost_id: boost.boost_id,
        level: boost.level,
        card_count: boost.card_count
      }));

      const { error: insertError } = await supabase
        .from('user_boosts')
        .insert(boostsToInsert);

      if (insertError) {
        console.error('❌ Error inserting boosts:', insertError);
        return;
      }

      console.log(`✅ Inserted ${boostsToInsert.length} boosts`);
    }

    console.log('🎉 User data restoration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Drivers: ${userData.userDrivers?.length || 0}`);
    console.log(`   - Car Parts: ${userData.userCarParts?.length || 0}`);
    console.log(`   - Boosts: ${userData.userBoosts?.length || 0}`);

  } catch (error) {
    console.error('❌ Error during restoration:', error);
  }
}

// Run the restoration
restoreUserData();
