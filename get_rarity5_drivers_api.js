#!/usr/bin/env node

/**
 * Script to fetch rarity 5 drivers with their collection information
 * using the existing API endpoint
 */

async function getRarity5Drivers() {
  try {
    const response = await fetch('http://localhost:54321/rest/v1/drivers?rarity=eq.5', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const drivers = await response.json();
    
    console.log('Rarity 5 Drivers with Collection Information:');
    console.log('==========================================\n');
    
    if (drivers.length === 0) {
      console.log('No rarity 5 drivers found in the database.');
      return;
    }

    console.log('| Driver Ordinal | Collection ID | Collection Theme | Driver Name |');
    console.log('|---------------|---------------|------------------|-------------|');
    
    drivers.forEach(driver => {
      const ordinal = driver.ordinal || 'N/A';
      const collectionId = driver.collection_id || 'N/A';
      const theme = driver.collection_theme || 'N/A';
      const name = driver.name || 'N/A';
      
      console.log(`| ${ordinal.toString().padEnd(13)} | ${collectionId.toString().padEnd(13)} | ${theme.toString().padEnd(16)} | ${name.toString().padEnd(11)} |`);
    });

    console.log(`\nTotal rarity 5 drivers found: ${drivers.length}`);

  } catch (error) {
    console.error('Error fetching rarity 5 drivers:', error);
  }
}

getRarity5Drivers();