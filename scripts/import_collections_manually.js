const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function importCollectionsManually() {
  try {
    console.log('Importing collections manually...');
    
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
    const { data, error } = await supabase
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
    const { data: verifyData, error: verifyError } = await supabase
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

importCollectionsManually();