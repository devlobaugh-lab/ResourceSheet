const fetch = require('node-fetch');

// Test the new API endpoints
async function testAPIEndpoints() {
  console.log('🧪 Testing new API endpoints...');

  try {
    // Test drivers endpoint
    console.log('\\n🚗 Testing /api/drivers endpoint...');
    const driversResponse = await fetch('http://localhost:3000/api/drivers');
    console.log(`Status: ${driversResponse.status}`);

    if (driversResponse.ok) {
      const driversData = await driversResponse.json();
      console.log(`✅ Drivers endpoint working! Found ${driversData.data?.length || 0} drivers`);
    } else {
      console.log('❌ Drivers endpoint failed:', await driversResponse.text());
    }

    // Test car parts endpoint
    console.log('\\n🚘 Testing /api/car-parts endpoint...');
    const carPartsResponse = await fetch('http://localhost:3000/api/car-parts');
    console.log(`Status: ${carPartsResponse.status}`);

    if (carPartsResponse.ok) {
      const carPartsData = await carPartsResponse.json();
      console.log(`✅ Car parts endpoint working! Found ${carPartsData.data?.length || 0} car parts`);
    } else {
      console.log('❌ Car parts endpoint failed:', await carPartsResponse.text());
    }

    // Test boosts endpoint (should still work)
    console.log('\\n🔥 Testing /api/boosts endpoint...');
    const boostsResponse = await fetch('http://localhost:3000/api/boosts');
    console.log(`Status: ${boostsResponse.status}`);

    if (boostsResponse.ok) {
      const boostsData = await boostsResponse.json();
      console.log(`✅ Boosts endpoint working! Found ${boostsData.data?.length || 0} boosts`);
    } else {
      console.log('❌ Boosts endpoint failed:', await boostsResponse.text());
    }

    console.log('\\n🎉 API endpoint testing completed!');

  } catch (error) {
    console.error('❌ Error testing API endpoints:', error.message);
  }
}

// Run the tests
testAPIEndpoints();