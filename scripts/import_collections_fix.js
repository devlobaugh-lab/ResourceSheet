const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use the same Supabase client as the API
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function importCollectionsFix() {
  try {
    console.log('Fixing collections import...');
    
    // First, check if collections table exists and is empty
    const { data: collectionsCheck, error: checkError } = await supabaseAdmin
      .from('collections')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking collections table:', checkError);
      return;
    }

    console.log('Collections check result:', collectionsCheck);

    if (collectionsCheck && collectionsCheck.length > 0) {
      console.log('Collections already exist, skipping import');
      return;
    }

    // Collections data from content cache
    const collections = [
      {
        id: '1a4d9853-13e3-40ea-82d6-4891601e41b8',
        name: 'SERVLOC_TXT_PODIUM_STARS_COLLECTION_TITLE',
        theme: 'PodiumStars',
        description: null,
        ordinal: 1
      },
      {
        id: 'f187e5a1-bcaf-4aa4-af07-70d220cd0cb2',
        name: 'SERVLOC_TXT_PODIUM_STARS_LEGENDS_COLLECTION_TITLE',
        theme: 'PodiumStarsLegends',
        description: null,
        ordinal: 2
      },
      {
        id: 'fa44edf3-f712-4e32-a94b-46f0187757c2',
        name: 'SERVLOC_TXT_HOT_PROSPECT_COLLECTION_TITLE',
        theme: 'HotProspects',
        description: null,
        ordinal: 3
      }
    ];

    console.log('Inserting collections...');
    const { data, error } = await supabaseAdmin
      .from('collections')
      .insert(collections)
      .select();

    if (error) {
      console.error('Error inserting collections:', error);
      return;
    }

    console.log('✅ Collections imported successfully!');
    console.log('Collections inserted:', data.length);
    
    // Verify the import
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('collections')
      .select('*')
      .order('ordinal', { ascending: true });

    if (verifyError) {
      console.error('Error verifying collections:', verifyError);
      return;
    }

    console.log('\nCollections in database:');
    verifyData.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name} (ID: ${collection.id})`);
      console.log(`   Theme: ${collection.theme}`);
      console.log(`   Ordinal: ${collection.ordinal}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

importCollectionsFix();