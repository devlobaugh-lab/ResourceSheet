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

async function checkIds() {
  try {
    console.log('🔍 Checking if user data IDs exist in database...\n');

    // Check drivers
    if (userData.userDrivers && userData.userDrivers.length > 0) {
      console.log('📋 Checking driver IDs:');
      const driverIds = userData.userDrivers.map(d => d.driver_id);
      const { data: existingDrivers, error: driversError } = await supabase
        .from('drivers')
        .select('id, name')
        .in('id', driverIds);

      if (driversError) {
        console.error('❌ Error checking drivers:', driversError);
        return;
      }

      driverIds.forEach(id => {
        const exists = existingDrivers.find(d => d.id === id);
        console.log(`   ${id}: ${exists ? '✅ ' + exists.name : '❌ NOT FOUND'}`);
      });
    }

    // Check car parts
    if (userData.userCarParts && userData.userCarParts.length > 0) {
      console.log('\n📋 Checking car part IDs:');
      const carPartIds = userData.userCarParts.map(p => p.car_part_id);
      const { data: existingParts, error: partsError } = await supabase
        .from('car_parts')
        .select('id, name')
        .in('id', carPartIds);

      if (partsError) {
        console.error('❌ Error checking car parts:', partsError);
        return;
      }

      carPartIds.forEach(id => {
        const exists = existingParts.find(p => p.id === id);
        console.log(`   ${id}: ${exists ? '✅ ' + exists.name : '❌ NOT FOUND'}`);
      });
    }

    // Check boosts
    if (userData.userBoosts && userData.userBoosts.length > 0) {
      console.log('\n📋 Checking boost IDs:');
      const boostIds = userData.userBoosts.map(b => b.boost_id);
      const { data: existingBoosts, error: boostsError } = await supabase
        .from('boosts')
        .select('id, name')
        .in('id', boostIds);

      if (boostsError) {
        console.error('❌ Error checking boosts:', boostsError);
        return;
      }

      boostIds.forEach(id => {
        const exists = existingBoosts.find(b => b.id === id);
        console.log(`   ${id}: ${exists ? '✅ ' + exists.name : '❌ NOT FOUND'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error during ID check:', error);
  }
}

// Run the check
checkIds();
