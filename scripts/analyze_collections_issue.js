#!/usr/bin/env node

/**
 * Analysis script to identify the collections import issue
 */

const fs = require('fs');

function analyzeCollectionsIssue() {
  console.log('🔍 Analyzing collections import issue...');
  
  try {
    // Read the original content_cache.json
    const contentCachePath = 'external_data/content_cache.json';
    if (!fs.existsSync(contentCachePath)) {
      console.error('❌ content_cache.json not found');
      return;
    }
    
    const contentCache = JSON.parse(fs.readFileSync(contentCachePath, 'utf8'));
    console.log(`✅ Loaded content_cache.json (${contentCache._contentResponse ? 'has _contentResponse' : 'no _contentResponse'})`);
    
    // Check if collections exist in the original data
    if (contentCache._contentResponse && contentCache._contentResponse.collections) {
      const collections = contentCache._contentResponse.collections;
      console.log(`📊 Found ${collections.length} collections in original data`);
      
      // Analyze collection structure
      const collectionIds = new Set();
      const themes = new Set();
      const names = new Set();
      
      collections.forEach((collection, index) => {
        if (collection.id) collectionIds.add(collection.id);
        if (collection.theme) themes.add(collection.theme);
        if (collection.name) names.add(collection.name);
        
        if (index < 5) { // Show first 5 for analysis
          console.log(`Collection ${index + 1}:`, {
            id: collection.id,
            collectionId: collection.collectionId,
            theme: collection.theme,
            themeName: collection.themeName,
            name: collection.name,
            internalName: collection.internalName,
            season: collection.season,
            ordinal: collection.ordinal
          });
        }
      });
      
      console.log(`\n📈 Collection Analysis:`);
      console.log(`   Unique IDs: ${collectionIds.size}`);
      console.log(`   Unique Themes: ${themes.size}`);
      console.log(`   Unique Names: ${names.size}`);
      console.log(`   Themes found: ${Array.from(themes).join(', ')}`);
      
      // Check for Special Edition collections specifically
      const specialEditionCollections = collections.filter(c => 
        (c.theme && c.theme.toLowerCase().includes('special')) ||
        (c.name && c.name.toLowerCase().includes('special')) ||
        (c.internalName && c.internalName.toLowerCase().includes('special'))
      );
      
      console.log(`\n🎯 Special Edition Collections: ${specialEditionCollections.length}`);
      specialEditionCollections.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.theme || c.name || c.internalName} (ID: ${c.id})`);
      });
      
    } else {
      console.log('❌ No collections found in _contentResponse');
    }
    
    // Check processed collections
    const processedPath = 'external_data/processed/collections.json';
    if (fs.existsSync(processedPath)) {
      const processed = JSON.parse(fs.readFileSync(processedPath, 'utf8'));
      console.log(`\n📁 Processed collections: ${processed.collections.length}`);
      processed.collections.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.theme} (ID: ${c.id})`);
      });
    }
    
    // Check driver collections
    const driversPath = 'external_data/processed/drivers.json';
    if (fs.existsSync(driversPath)) {
      const drivers = JSON.parse(fs.readFileSync(driversPath, 'utf8'));
      const specialDrivers = drivers.drivers.filter(d => d.rarity === 5);
      console.log(`\n🏎️  Special Edition Drivers: ${specialDrivers.length}`);
      
      const driverCollectionIds = new Set();
      specialDrivers.forEach(d => {
        if (d.collectionId) driverCollectionIds.add(d.collectionId);
      });
      
      console.log(`   Unique collection IDs in drivers: ${driverCollectionIds.size}`);
      console.log(`   Collection IDs: ${Array.from(driverCollectionIds).join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error analyzing collections:', error.message);
  }
}

analyzeCollectionsIssue();