#!/usr/bin/env node

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Correct collections data from content_cache-2-9.json
const correctCollections = [
  {
    id: 'fa44edf3-f712-4e32-a94b-46f0187757c2',
    theme: 'HotProspects',
    name: 'SERVLOC_TXT_HOT_PROSPECT_COLLECTION_TITLE',
    ordinal: 1
  },
  {
    id: '1a4d9853-13e3-40ea-82d6-4891601e41b8',
    theme: 'PodiumStars',
    name: 'SERVLOC_TXT_PODIUM_STARS_COLLECTION_TITLE',
    ordinal: 2
  },
  {
    id: 'f187e5a1-bcaf-4aa4-af07-70d220cd0cb2',
    theme: 'PodiumStarsLegends',
    name: 'SERVLOC_TXT_PODIUM_STARS_LEGENDS_COLLECTION_TITLE',
    ordinal: 3
  }
];

async function fixCollections() {
  try {
    console.log('🔧 Fixing collections data...');
    
    // Delete all existing collections
    console.log('🗑️  Deleting existing collections...');
    const { error: deleteError } = await supabase
      .from('collections')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.log('❌ Delete error:', deleteError.message);
      return;
    }
    
    console.log('✅ Deleted existing collections');
    
    // Insert correct collections
    console.log('➕ Inserting correct collections...');
    const { data, error: insertError } = await supabase
      .from('collections')
      .insert(correctCollections);
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      return;
    }
    
    console.log('✅ Successfully updated collections!');
    console.log('New collections:');
    correctCollections.forEach((c, i) => {
      console.log(`  ${i + 1}. ID=${c.id}, Theme="${c.theme}", Name="${c.name}", Ordinal=${c.ordinal}`);
    });
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

fixCollections();