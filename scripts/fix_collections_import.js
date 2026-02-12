#!/usr/bin/env node

/**
 * Fix script to create missing collections based on driver data
 * This addresses the issue where content_cache.json is missing Special Edition collections
 */

const fs = require('fs');

function fixCollectionsImport() {
  console.log('🔧 Fixing collections import issue...');
  
  try {
    // Read the processed drivers data
    const driversPath = 'external_data/processed/drivers.json';
    if (!fs.existsSync(driversPath)) {
      console.error('❌ Processed drivers.json not found');
      return;
    }
    
    const driversData = JSON.parse(fs.readFileSync(driversPath, 'utf8'));
    const specialDrivers = driversData.drivers.filter(d => d.rarity === 5);
    
    console.log(`📊 Found ${specialDrivers.length} Special Edition drivers`);
    
    // Extract unique collection sub names and IDs
    const collectionInfo = new Map();
    
    specialDrivers.forEach(driver => {
      if (driver.collectionId && driver.collectionSubName) {
        if (!collectionInfo.has(driver.collectionId)) {
          collectionInfo.set(driver.collectionId, {
            id: driver.collectionId,
            subNames: new Set(),
            count: 0
          });
        }
        const info = collectionInfo.get(driver.collectionId);
        info.subNames.add(driver.collectionSubName);
        info.count++;
      }
    });
    
    console.log(`\n🎯 Found ${collectionInfo.size} unique collection IDs:`);
    collectionInfo.forEach((info, id) => {
      console.log(`   Collection ${id}:`);
      console.log(`     Sub-names: ${Array.from(info.subNames).join(', ')}`);
      console.log(`     Driver count: ${info.count}`);
    });
    
    // Create enhanced collections data
    const existingCollectionsPath = 'external_data/processed/collections.json';
    let existingCollections = [];
    
    if (fs.existsSync(existingCollectionsPath)) {
      const existing = JSON.parse(fs.readFileSync(existingCollectionsPath, 'utf8'));
      existingCollections = existing.collections || [];
      console.log(`\n📁 Existing collections: ${existingCollections.length}`);
    }
    
    // Create missing collections based on driver data
    const missingCollections = [];
    
    collectionInfo.forEach((info, collectionId) => {
      // Check if this collection already exists
      const exists = existingCollections.some(c => c.id === collectionId);
      
      if (!exists) {
        // Create a new collection entry
        const subNames = Array.from(info.subNames);
        const isHotProspects = subNames.some(name => name.includes('HOT_PROSPECT'));
        
        let collectionName = 'Special Edition';
        let theme = 'SpecialEdition';
        
        if (isHotProspects) {
          collectionName = 'Hot Prospects';
          theme = 'HotProspects';
        } else if (subNames.length > 0) {
          // Try to derive name from sub-name
          const firstSubName = subNames[0];
          if (firstSubName.includes('HOT_PROSPECT')) {
            collectionName = 'Hot Prospects';
            theme = 'HotProspects';
          }
        }
        
        missingCollections.push({
          id: collectionId,
          internalName: `${collectionName} S2025`,
          season: 6,
          ordinal: existingCollections.length + missingCollections.length + 1,
          name: `SERVLOC_TXT_${collectionName.toUpperCase().replace(/\s+/g, '_')}_COLLECTION_TITLE`,
          theme: theme,
          description: collectionName,
          source: 'derived_from_driver_data',
          subNames: subNames
        });
      }
    });
    
    // Combine existing and new collections
    const allCollections = [...existingCollections, ...missingCollections];
    
    // Create enhanced collections.json
    const enhancedCollections = {
      collections: allCollections,
      metadata: {
        source: 'enhanced_from_driver_data',
        original_collections: existingCollections.length,
        added_collections: missingCollections.length,
        total_collections: allCollections.length,
        extraction_date: new Date().toISOString(),
        note: 'Enhanced with missing collections derived from Special Edition driver data'
      }
    };
    
    // Write the enhanced collections
    const outputPath = 'external_data/processed/collections_enhanced.json';
    fs.writeFileSync(outputPath, JSON.stringify(enhancedCollections, null, 2));
    console.log(`\n✅ Created enhanced collections file: ${outputPath}`);
    console.log(`   Total collections: ${allCollections.length}`);
    console.log(`   Added collections: ${missingCollections.length}`);
    
    // Display the collections
    console.log('\n📋 Enhanced Collections:');
    allCollections.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.theme} (${c.name}) - ID: ${c.id}`);
      if (c.subNames) {
        console.log(`      Sub-names: ${c.subNames.join(', ')}`);
      }
    });
    
    // Create a summary report
    const report = {
      issue: 'Missing Special Edition collections in content_cache.json',
      analysis: {
        specialEditionDrivers: specialDrivers.length,
        uniqueCollectionIds: collectionInfo.size,
        existingCollections: existingCollections.length,
        missingCollections: missingCollections.length
      },
      solution: 'Created enhanced collections.json with missing collections derived from driver data',
      collections: allCollections.map(c => ({
        id: c.id,
        theme: c.theme,
        name: c.name,
        ordinal: c.ordinal,
        source: c.source || 'original'
      }))
    };
    
    const reportPath = 'external_data/processed/collections_fix_report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Fix report saved to: ${reportPath}`);
    
    console.log('\n🎉 Collections import issue analysis complete!');
    console.log('\n📝 Summary:');
    console.log(`   - Found ${specialDrivers.length} Special Edition drivers`);
    console.log(`   - Identified ${missingCollections.length} missing collections`);
    console.log(`   - Created enhanced collections file with all required data`);
    console.log(`   - Next step: Import the enhanced collections into the database`);
    
  } catch (error) {
    console.error('❌ Error fixing collections import:', error.message);
    console.error(error.stack);
  }
}

fixCollectionsImport();