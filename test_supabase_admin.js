#!/usr/bin/env node

/**
 * Test script to test the Supabase admin client
 */

const { createClient } = require('@supabase/supabase-js');

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'REDACTED_SECRET_KEY';

console.log('🚀 Testing Supabase admin client...');
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Service Role Key: ${serviceRoleKey ? '[SET]' : 'undefined'}`);

async function testSupabaseAdmin() {
  try {
    // Create admin client
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('✅ Supabase admin client created successfully');

    // Test database connection by querying series_data
    console.log('📊 Testing series_data query...');
    const { data: seriesData, error: seriesError } = await supabaseAdmin
      .from('series_data')
      .select('*')
      .order('index', { ascending: true });

    if (seriesError) {
      console.error('❌ Error querying series_data:', seriesError);
      return;
    }

    console.log(`✅ Found ${seriesData.length} series in database`);

    // Show sample data
    console.log('\n📋 Sample series data:');
    seriesData.slice(0, 3).forEach((series, i) => {
      console.log(`  Series ${i + 1}: Index=${series.index}, Entry Fee=${series.entry_fee}, Tracks=${series.track_names.length}`);
      console.log(`    Track names: ${series.track_names.join(', ')}`);
    });

    // Test track aliases query
    console.log('\n📊 Testing track_name_aliases query...');
    const { data: aliasesData, error: aliasesError } = await supabaseAdmin
      .from('track_name_aliases')
      .select('system_name, display_name');

    if (aliasesError) {
      console.error('❌ Error querying track_name_aliases:', aliasesError);
    } else {
      console.log(`✅ Found ${aliasesData.length} track aliases`);
    }

    // Test tracks query
    console.log('\n📊 Testing tracks query...');
    const { data: tracksData, error: tracksError } = await supabaseAdmin
      .from('tracks')
      .select('id, name, laps, driver_track_stat, car_track_stat');

    if (tracksError) {
      console.error('❌ Error querying tracks:', tracksError);
    } else {
      console.log(`✅ Found ${tracksData.length} tracks`);
    }

    console.log('\n✅ Supabase admin client test completed successfully!');
    
  } catch (error) {
    console.error('❌ Supabase admin client test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testSupabaseAdmin();
}

module.exports = { testSupabaseAdmin };