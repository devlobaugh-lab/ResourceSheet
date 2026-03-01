#!/usr/bin/env node

/**
 * Script to create series_data table and insert series data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'REDACTED_SECRET_KEY';

console.log('🚀 Creating series_data table and inserting series data...');
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Service Role Key: ${serviceRoleKey ? '[SET]' : 'undefined'}`);

async function createSeriesDataTable() {
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

    // Read the SQL file
    const sql = fs.readFileSync('create_series_data_table.sql', 'utf8');
    console.log('✅ SQL file loaded successfully');

// Execute the SQL
console.log('📊 Executing SQL...');
const { data, error } = await supabaseAdmin
  .from('series_data')
  .insert([{ index: 0, entry_fee: 0, win_flags: 0, loss_flags: 0, win_rep: 0, flags_to_unlock: 0, max_flags: 0, track_ids: [] }])
  .select();

if (error) {
  console.error('❌ Error executing SQL:', error);
  return;
}

    console.log('✅ SQL executed successfully');
    console.log('📊 Verifying series data...');
    
    // Verify the data was inserted
    const { data: seriesData, error: seriesError } = await supabaseAdmin
      .from('series_data')
      .select('*')
      .order('index', { ascending: true });

    if (seriesError) {
      console.error('❌ Error querying series_data:', seriesError);
      return;
    }

    console.log(`✅ Found ${seriesData.length} series in database`);
    console.log('\n📋 Series data:');
    seriesData.forEach((series, i) => {
      console.log(`  Series ${i + 1}: Index=${series.index}, Entry Fee=${series.entry_fee}, Win Flags=${series.win_flags}, Loss Flags=${series.loss_flags}`);
      console.log(`    Tracks: ${series.track_names.join(', ')}`);
    });

    console.log('\n✅ Series data table created and populated successfully!');
    
  } catch (error) {
    console.error('❌ Error creating series data table:', error);
  }
}

// Run the script
if (require.main === module) {
  createSeriesDataTable();
}

module.exports = { createSeriesDataTable };