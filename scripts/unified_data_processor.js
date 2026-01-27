#!/usr/bin/env node

/**
 * Unified Data Processor
 * Processes external_data/processed/*.json files and imports them into the database
 * Handles drivers, car_parts, and boosts with proper entity type detection
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/resourcesheet',
});

// Import the existing database functions
const { insertDriver, insertCarPart, insertBoost } = require('./direct_seed');

async function processEntityFile(filePath, entityType) {
  console.log(`\n🔄 Processing ${entityType} from: ${filePath}`);
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const entities = data[entityType] || [];
    
    console.log(`📊 Found ${entities.length} ${entityType} entities`);
    
    let processed = 0;
    let skipped = 0;
    
    for (const entity of entities) {
      try {
        let result;
        
        switch (entityType) {
          case 'drivers':
            result = await insertDriver(entity);
            break;
          case 'car_parts':
            result = await insertCarPart(entity);
            break;
          case 'boosts':
            result = await insertBoost(entity);
            break;
          default:
            throw new Error(`Unknown entity type: ${entityType}`);
        }
        
        if (result) {
          processed++;
          console.log(`✅ ${entityType}: ${entity.name || entity.tagName || entity.id} (Series ${entity.series || 'N/A'})`);
        } else {
          skipped++;
          console.log(`⚠️  Skipped ${entityType}: ${entity.name || entity.tagName || entity.id} (already exists)`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${entityType}: ${entity.name || entity.tagName || entity.id}`, error.message);
      }
    }
    
    console.log(`\n📈 ${entityType} Summary:`);
    console.log(`   Processed: ${processed}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${entities.length}`);
    
    return { processed, skipped, total: entities.length };
    
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error.message);
    return { processed: 0, skipped: 0, total: 0 };
  }
}

async function processAllFiles() {
  console.log('🚀 Starting unified data processing...');
  
  const processedDir = path.join(__dirname, '..', 'external_data', 'processed');
  
  if (!fs.existsSync(processedDir)) {
    console.error('❌ Processed directory not found. Run preprocess_external_data.js first.');
    process.exit(1);
  }
  
  const files = fs.readdirSync(processedDir);
  const entityFiles = {
    drivers: files.find(f => f === 'drivers.json'),
    car_parts: files.find(f => f === 'car_parts.json'),
    boosts: files.find(f => f === 'boosts.json')
  };
  
  const results = {};
  
  // Process each entity type
  for (const [entityType, fileName] of Object.entries(entityFiles)) {
    if (fileName) {
      const filePath = path.join(processedDir, fileName);
      results[entityType] = await processEntityFile(filePath, entityType);
    } else {
      console.log(`⚠️  No ${entityType} file found`);
      results[entityType] = { processed: 0, skipped: 0, total: 0 };
    }
  }
  
  // Summary
  console.log('\n🎉 Processing Complete!');
  console.log('\n📊 Final Summary:');
  
  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalEntities = 0;
  
  for (const [entityType, result] of Object.entries(results)) {
    console.log(`\n${entityType.toUpperCase()}:`);
    console.log(`   Processed: ${result.processed}`);
    console.log(`   Skipped: ${result.skipped}`);
    console.log(`   Total: ${result.total}`);
    
    totalProcessed += result.processed;
    totalSkipped += result.skipped;
    totalEntities += result.total;
  }
  
  console.log('\n📈 Overall Summary:');
  console.log(`   Total Processed: ${totalProcessed}`);
  console.log(`   Total Skipped: ${totalSkipped}`);
  console.log(`   Total Entities: ${totalEntities}`);
  
  // Close database connection
  await pool.end();
  
  console.log('\n✅ Unified data processing completed successfully!');
}

// Run the processor
if (require.main === module) {
  processAllFiles().catch(console.error);
}

module.exports = { processAllFiles };