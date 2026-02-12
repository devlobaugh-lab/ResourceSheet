#!/usr/bin/env node

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTablesCleared() {
  try {
    console.log('🔍 Verifying tables are cleared...');
    
    const tables = [
      'collections',
      'drivers', 
      'car_parts',
      'boosts',
      'catalog_items',
      'user_drivers',
      'user_car_parts',
      'user_boosts',
      'user_car_setups',
      'user_track_guides'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count(*)', { count: 'exact' })
          .limit(1);

        if (error) {
          console.log(`❌ ${table}: Error - ${error.message}`);
        } else {
          const count = data && data[0] && data[0].count ? parseInt(data[0].count) : 0;
          console.log(`📊 ${table}: ${count} records`);
        }
      } catch (err) {
        console.log(`⚠️  ${table}: Table not found or error - ${err.message}`);
      }
    }

    console.log('\n✅ Verification complete!');
    console.log('You can now re-import the content_cache data using the app.');
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

verifyTablesCleared();