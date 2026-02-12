const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with local database
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissingCollections() {
  console.log('Adding missing collections for Special Edition drivers...');

  try {
    // Check if collections already exist, if not insert them
    const collections = [
      {
        id: 'fa44edf3-f712-4e32-a94b-46f0187757c2',
        theme: 'Hot Prospects',
        description: 'Hot Prospects Collection',
        name: 'Hot Prospects',
        ordinal: 1
      },
      {
        id: '1a4d9853-13e3-40ea-82d6-4891601e41b8',
        theme: 'PS25',
        description: 'PS25 Collection',
        name: 'PS25',
        ordinal: 2
      },
      {
        id: 'f187e5a1-bcaf-4aa4-af07-70d220cd0cb2',
        theme: 'F1 Legends',
        description: 'F1 Legends Collection',
        name: 'F1 Legends',
        ordinal: 3
      }
    ];

    for (const collection of collections) {
      const { data, error } = await supabase
        .from('collections')
        .select('id')
        .eq('id', collection.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw error;
      }

      if (!data) {
        console.log(`Adding collection: ${collection.theme}`);
        const { error: insertError } = await supabase
          .from('collections')
          .insert(collection);

        if (insertError) {
          throw insertError;
        }
      } else {
        console.log(`Collection ${collection.theme} already exists`);
      }
    }

    // Update drivers to ensure they have the correct collection_sub_name values
    console.log('Updating driver collection_sub_name values...');
    
    const { error: updateError1 } = await supabase
      .from('drivers')
      .update({ collection_sub_name: 'SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_1' })
      .eq('collection_id', 'fa44edf3-f712-4e32-a94b-46f0187757c2')
      .is('collection_sub_name', null);

    if (updateError1) {
      throw updateError1;
    }

    const { error: updateError2 } = await supabase
      .from('drivers')
      .update({ collection_sub_name: 'SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_2' })
      .eq('collection_id', 'fa44edf3-f712-4e32-a94b-46f0187757c2')
      .is('collection_sub_name', null);

    if (updateError2) {
      throw updateError2;
    }

    // Verify the collections were added
    const { data: collectionsData, error: verifyError } = await supabase
      .from('collections')
      .select('*')
      .in('id', [
        'fa44edf3-f712-4e32-a94b-46f0187757c2',
        '1a4d9853-13e3-40ea-82d6-4891601e41b8',
        'f187e5a1-bcaf-4aa4-af07-70d220cd0cb2'
      ]);

    if (verifyError) {
      throw verifyError;
    }

    console.log('Successfully added missing collections!');
    console.log('Collections added:', collectionsData.map(c => c.theme));

  } catch (error) {
    console.error('Error adding collections:', error);
    process.exit(1);
  }
}

addMissingCollections();