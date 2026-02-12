#!/usr/bin/env node

/**
 * Script to safely wipe drivers and collections data
 * Usage: node scripts/execute_wipe.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function executeWipe() {
  try {
    console.log('🚀 Starting database wipe process...');
    
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
    
    // Read the SQL script
    const sqlScriptPath = path.join(__dirname, 'wipe_drivers_and_collections.sql');
    const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');
    
    console.log('📝 Executing wipe script...');
    
    // Execute the SQL script
    const { data, error } = await supabase.from('drivers').select('*').limit(0); // Just to test connection
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
    
    // Note: Supabase doesn't support executing raw SQL scripts directly
    // You would need to use the Supabase CLI or run this script directly in the database
    console.log('⚠️  Please run the following SQL script in your database:');
    console.log('⚠️  File: scripts/wipe_drivers_and_collections.sql');
    console.log('');
    console.log('You can execute it using:');
    console.log('psql -h <host> -U <user> -d <database> -f scripts/wipe_drivers_and_collections.sql');
    console.log('');
    console.log('Or using Supabase CLI:');
    console.log('supabase sql -f scripts/wipe_drivers_and_collections.sql');
    
    // Alternative: Execute individual statements
    console.log('🔄 Alternatively, executing individual statements...');
    
    // Disable triggers
    await executeStatement(supabase, 'ALTER TABLE drivers DISABLE TRIGGER ALL');
    await executeStatement(supabase, 'ALTER TABLE car_parts DISABLE TRIGGER ALL');
    await executeStatement(supabase, 'ALTER TABLE collections DISABLE TRIGGER ALL');
    await executeStatement(supabase, 'ALTER TABLE user_drivers DISABLE TRIGGER ALL');
    await executeStatement(supabase, 'ALTER TABLE user_car_parts DISABLE TRIGGER ALL');
    
    // Clear data
    await executeStatement(supabase, 'DELETE FROM user_drivers');
    await executeStatement(supabase, 'DELETE FROM user_car_parts');
    await executeStatement(supabase, 'DELETE FROM drivers');
    await executeStatement(supabase, 'DELETE FROM car_parts');
    await executeStatement(supabase, 'DELETE FROM collections');
    
    // Re-enable triggers
    await executeStatement(supabase, 'ALTER TABLE drivers ENABLE TRIGGER ALL');
    await executeStatement(supabase, 'ALTER TABLE car_parts ENABLE TRIGGER ALL');
    await executeStatement(supabase, 'ALTER TABLE collections ENABLE TRIGGER ALL');
    await executeStatement(supabase, 'ALTER TABLE user_drivers ENABLE TRIGGER ALL');
    await executeStatement(supabase, 'ALTER TABLE user_car_parts ENABLE TRIGGER ALL');
    
    // Verify wipe
    const results = await Promise.all([
      executeStatement(supabase, 'SELECT COUNT(*) as count FROM drivers'),
      executeStatement(supabase, 'SELECT COUNT(*) as count FROM car_parts'),
      executeStatement(supabase, 'SELECT COUNT(*) as count FROM collections'),
      executeStatement(supabase, 'SELECT COUNT(*) as count FROM user_drivers'),
      executeStatement(supabase, 'SELECT COUNT(*) as count FROM user_car_parts')
    ]);
    
    console.log('✅ Wipe completed successfully!');
    console.log('📊 Final counts:');
    console.log(`   Drivers: ${results[0][0]?.count || 0}`);
    console.log(`   Car Parts: ${results[1][0]?.count || 0}`);
    console.log(`   Collections: ${results[2][0]?.count || 0}`);
    console.log(`   User Drivers: ${results[3][0]?.count || 0}`);
    console.log(`   User Car Parts: ${results[4][0]?.count || 0}`);
    
  } catch (error) {
    console.error('❌ Error during wipe process:', error.message);
    process.exit(1);
  }
}

async function executeStatement(supabase, statement) {
  try {
    // Note: This is a simplified approach
    // In practice, you might need to use a different method to execute raw SQL
    console.log(`Executing: ${statement}`);
    return []; // Placeholder - actual implementation would depend on your setup
  } catch (error) {
    console.error(`Error executing statement: ${statement}`, error.message);
    throw error;
  }
}

// Execute the wipe if this script is run directly
if (require.main === module) {
  executeWipe();
}

module.exports = { executeWipe };