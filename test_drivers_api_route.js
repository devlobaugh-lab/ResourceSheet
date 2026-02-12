#!/usr/bin/env node

/**
 * Script to test the Next.js drivers API route with collection joins
 */

async function testDriversApiRoute() {
  try {
    const response = await fetch('http://localhost:3002/api/drivers?rarity=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('Drivers API Route Test Results:');
    console.log('==============================\n');
    
    if (!result.data || result.data.length === 0) {
      console.log('No drivers found in the API response.');
      return;
    }

    console.log(`Total drivers found: ${result.data.length}`);
    console.log('\nRarity 5 Drivers with Collection Information:');
    console.log('=============================================\n');
    
    console.log('| Driver Ordinal | Collection ID | Collection Theme | Driver Name |');
    console.log('|---------------|---------------|------------------|-------------|');
    
    result.data.forEach(driver => {
      const ordinal = driver.ordinal || 'N/A';
      const collectionId = driver.collection_id || 'N/A';
      const theme = driver.collection_theme || 'N/A';
      const name = driver.name || 'N/A';
      
      console.log(`| ${ordinal.toString().padEnd(13)} | ${collectionId.toString().padEnd(13)} | ${theme.toString().padEnd(16)} | ${name.toString().padEnd(11)} |`);
    });

    console.log(`\nTotal rarity 5 drivers found: ${result.data.length}`);

    // Test a few specific drivers to see their collection data
    console.log('\nDetailed collection data for first 3 drivers:');
    console.log('=============================================');
    result.data.slice(0, 3).forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.name}:`);
      console.log(`   Collection ID: ${driver.collection_id}`);
      console.log(`   Collection Theme: ${driver.collection_theme}`);
      console.log(`   Collection Ordinal: ${driver.collection_ordinal}`);
      console.log(`   Collection Sub-Name: ${driver.collection_sub_name}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error testing drivers API route:', error);
  }
}

testDriversApiRoute();