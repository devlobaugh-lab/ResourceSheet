#!/usr/bin/env node

/**
 * Pre-processor for external_data/content_cache.json
 * Extracts relevant data for season 6+ and creates filtered JSON files
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '..', 'external_data', 'content_cache.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'external_data', 'processed');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function extractSeason6PlusData() {
  console.log('🔍 Starting pre-processing of external_data/content_cache.json...');
  console.log(`📊 File size: ${(fs.statSync(INPUT_FILE).size / (1024 * 1024)).toFixed(2)} MB`);

  try {
    // Read the large file
    const fileContent = fs.readFileSync(INPUT_FILE, 'utf8');
    console.log('✅ File loaded successfully');

    // Parse JSON
    const data = JSON.parse(fileContent);
    console.log('✅ JSON parsed successfully');

    // Check if _contentResponse exists
    if (!data._contentResponse) {
      throw new Error('_contentResponse not found in data');
    }

    const contentResponse = data._contentResponse;
    console.log('✅ Found _contentResponse structure');

    // Extract data for season 6+
    const extractedData = {
      drivers: [],
      car_parts: [],
      boosts: [],
      metadata: {
        source: 'external_data/content_cache.json',
        extraction_date: new Date().toISOString(),
        season_filter: '6+',
        original_file_size: fs.statSync(INPUT_FILE).size
      }
    };

    // Process drivers
    if (contentResponse.drivers && Array.isArray(contentResponse.drivers)) {
      console.log(`🔄 Processing ${contentResponse.drivers.length} drivers...`);
      extractedData.drivers = contentResponse.drivers.filter(driver => {
        return driver.season && driver.season >= 6;
      });
      console.log(`✅ Filtered ${extractedData.drivers.length} drivers (season 6+)`);
    }

    // Process car parts
    if (contentResponse.carparts && Array.isArray(contentResponse.carparts)) {
      console.log(`🔄 Processing ${contentResponse.carparts.length} car parts...`);
      extractedData.car_parts = contentResponse.carparts.filter(part => {
        return part.season && part.season >= 6;
      });
      console.log(`✅ Filtered ${extractedData.car_parts.length} car parts (season 6+)`);
    }

    // Process boosts
    if (contentResponse.boosts && Array.isArray(contentResponse.boosts)) {
      console.log(`🔄 Processing ${contentResponse.boosts.length} boosts...`);
      // For boosts, we'll include all since they're not season-specific
      extractedData.boosts = contentResponse.boosts;
      console.log(`✅ Included ${extractedData.boosts.length} boosts`);
    }

    // Calculate size reduction
    const filteredDataSize = JSON.stringify(extractedData).length;
    const originalSize = fs.statSync(INPUT_FILE).size;
    const reduction = ((1 - filteredDataSize / originalSize) * 100).toFixed(1);

    console.log(`\n📊 Size Analysis:`);
    console.log(`   Original: ${(originalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Filtered: ${(filteredDataSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Reduction: ${reduction}%`);

    // Write filtered data
    const outputPath = path.join(OUTPUT_DIR, 'filtered_season_6_plus.json');
    fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2));
    console.log(`\n✅ Filtered data saved to: ${outputPath}`);

    // Create individual entity files
    const entities = ['drivers', 'car_parts', 'boosts'];
    entities.forEach(entity => {
      const entityPath = path.join(OUTPUT_DIR, `${entity}.json`);
      fs.writeFileSync(entityPath, JSON.stringify({
        [entity]: extractedData[entity],
        metadata: {
          ...extractedData.metadata,
          entity_type: entity,
          count: extractedData[entity].length
        }
      }, null, 2));
      console.log(`✅ ${entity} saved to: ${entityPath}`);
    });

    console.log('\n🎉 Pre-processing completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Drivers: ${extractedData.drivers.length}`);
    console.log(`   Car Parts: ${extractedData.car_parts.length}`);
    console.log(`   Boosts: ${extractedData.boosts.length}`);
    console.log(`   Total entities: ${extractedData.drivers.length + extractedData.car_parts.length + extractedData.boosts.length}`);

    return extractedData;

  } catch (error) {
    console.error('❌ Error during pre-processing:', error.message);
    process.exit(1);
  }
}

// Run the pre-processor
if (require.main === module) {
  extractSeason6PlusData();
}

module.exports = { extractSeason6PlusData };