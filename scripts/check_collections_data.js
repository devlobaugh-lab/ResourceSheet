#!/usr/bin/env node

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCollections() {
  try {
    console.log('📊 Checking collections in database...');
    
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('ordinal', { ascending: true });
    
    if (error) {
      console.log('❌ Database error:', error.message);
      return;
    }
    
    console.log(`Found ${data.length} collections:`);
    data.forEach((c, i) => {
      console.log(`  ${i + 1}. ID=${c.id}, Theme="${c.theme}", Name="${c.name}", Ordinal=${c.ordinal}`);
    });
    
    // Check for Special Edition collections
    const specialCollections = data.filter(c => c.theme && c.theme.toLowerCase().includes('special'));
    console.log(`\n🎯 Special Edition Collections: ${specialCollections.length}`);
    specialCollections.forEach((c, i) => {
      console.log(`   ${i + 1}. "${c.theme}" (ID: ${c.id})`);
    });
    
    // Check for the correct collections from content_cache
    const correctCollections = ['PodiumStars', 'PodiumStarsLegends', 'HotProspects'];
    const foundCollections = data.map(c => c.theme);
    const missingCollections = correctCollections.filter(theme => !foundCollections.includes(theme));
    
    console.log(`\n📋 Expected collections: ${correctCollections.join(', ')}`);
    console.log(`📋 Found collections: ${foundCollections.join(', ')}`);
    console.log(`📋 Missing collections: ${missingCollections.join(', ') || 'None'}`);
    
    if (missingCollections.length > 0) {
      console.log('\n❌ Database has incorrect collections data!');
      console.log('The database should only contain:');
      correctCollections.forEach(theme => console.log(`  - ${theme}`));
    } else {
      console.log('\n✅ Database collections are correct!');
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkCollections();