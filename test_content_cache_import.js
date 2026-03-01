#!/usr/bin/env node

/**
 * Test script to import content cache data
 * This will test the series data import functionality
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/resourcesheet',
});

async function testContentCacheImport() {
  console.log('🚀 Testing content cache import...');
  
  try {
    // Read the content cache file
    const contentCachePath = path.join(__dirname, 'external_data', 'content_cache-2-9.json');
    console.log(`📄 Reading content cache from: ${contentCachePath}`);
    
    if (!fs.existsSync(contentCachePath)) {
      console.error('❌ Content cache file not found');
      return;
    }
    
    const contentCacheData = JSON.parse(fs.readFileSync(contentCachePath, 'utf8'));
    console.log(`✅ Content cache loaded: ${Object.keys(contentCacheData).length} top-level keys`);
    
    // Check if series data exists
    const seriesData = contentCacheData._contentResponse?.series || contentCacheData.series;
    if (!seriesData || seriesData.length === 0) {
      console.error('❌ No series data found in content cache');
      return;
    }
    
    console.log(`✅ Found ${seriesData.length} series entries`);
    
    // Check if track data exists
    const trackData = contentCacheData._contentResponse?.trackData || contentCacheData.trackData || [];
    console.log(`✅ Found ${trackData.length} track entries`);
    
    // Build a map of trackId -> track info for looking up track details
    const trackIdToInfo = new Map();
    
    // Helper function to convert stat names to lowercase
    const convertStatName = (stat) => {
      const statMap = {
        'TyreUse': 'tyreUse',
        'Overtaking': 'overtaking',
        'Blocking': 'defending',
        'RaceStart': 'raceStart',
        'Cornering': 'cornering',
        'PowerUnit': 'powerUnit',
        'Speed': 'speed',
        'None': 'none'
      };
      return statMap[stat] || stat.toLowerCase();
    };
    
    for (const track of trackData) {
      trackIdToInfo.set(track.id, {
        name: track.name,
        laps: track.lapcount,
        driverStat: convertStatName(track.strongStatA),
        carStat: convertStatName(track.strongStatB)
      });
    }
    
    console.log(`📊 Built track info map with ${trackIdToInfo.size} entries`);
    
    // Build series rows for database
    const seriesRows = seriesData.map((s, index) => {
      // Get track names and full track info from track_ids
      const trackNames = [];
      const trackInfo = [];
      
      for (const trackId of (s.trackIds || [])) {
        const info = trackIdToInfo.get(trackId);
        if (info) {
          trackNames.push(info.name);
          trackInfo.push({
            name: info.name,
            laps: info.laps,
            driverStat: info.driverStat,
            carStat: info.carStat
          });
        } else {
          trackNames.push(trackId);
        }
      }
      
      return {
        index: s.index,
        entry_fee: s.entryFee || 0,
        win_flags: s.winFlags || 0,
        loss_flags: s.lossFlags || 0,
        win_rep: s.winRep || 0,
        flags_to_unlock: s.flagsToUnlock || 0,
        max_flags: s.maxFlags || 0,
        track_ids: s.trackIds || [],
        track_names: trackNames,
        track_info: trackInfo,
        bot_loadout: s.botLoadout || null,
        ai_car_loadouts: s.aiCarLoadouts || null
      };
    });
    
    console.log(`📊 Prepared ${seriesRows.length} series rows for import`);
    
    // Show sample series data
    console.log('\n📋 Sample series data:');
    seriesRows.slice(0, 3).forEach((series, i) => {
      console.log(`  Series ${i + 1}: Index=${series.index}, Entry Fee=${series.entry_fee}, Tracks=${series.track_names.length}`);
      console.log(`    Track names: ${series.track_names.join(', ')}`);
      console.log(`    Track info: ${series.track_info.map(t => `${t.name} (${t.laps} laps, ${t.driverStat}/${t.carStat})`).join(', ')}`);
    });
    
    // Test database connection and import
    console.log('\n🗄️  Testing database import...');
    
    // Count existing rows for reporting
    const { rows: [existingCount] } = await pool.query('SELECT COUNT(*) FROM series_data');
    console.log(`📊 Existing series data count: ${existingCount.count}`);
    
    // Delete all existing series data
    await pool.query('DELETE FROM series_data');
    console.log('✅ Cleared existing series data');
    
    // Insert new rows
    if (seriesRows.length > 0) {
      const values = seriesRows.map((series, i) => {
        return `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, $${i * 10 + 9}, $${i * 10 + 10})`;
      }).join(', ');
      
      const query = `
        INSERT INTO series_data (index, entry_fee, win_flags, loss_flags, win_rep, flags_to_unlock, max_flags, track_ids, track_names, track_info)
        VALUES ${values}
      `;
      
      const params = [];
      for (const series of seriesRows) {
        params.push(
          series.index,
          series.entry_fee,
          series.win_flags,
          series.loss_flags,
          series.win_rep,
          series.flags_to_unlock,
          series.max_flags,
          `{${series.track_ids.join(',')}}`, // PostgreSQL array format
          `{${series.track_names.map(name => `"${name}"`).join(',')}}`, // PostgreSQL array format with quotes
          JSON.stringify(series.track_info) // JSON is fine for this field
        );
      }
      
      await pool.query(query, params);
      console.log(`✅ Inserted ${seriesRows.length} series rows`);
    }
    
    // Verify the insert worked
    const { rows: [verifyCount] } = await pool.query('SELECT COUNT(*) FROM series_data');
    console.log(`📊 Series data count after import: ${verifyCount.count}`);
    
    // Show imported series
    const { rows: importedSeries } = await pool.query('SELECT index, entry_fee, win_flags, loss_flags, track_names FROM series_data ORDER BY index');
    console.log('\n📋 Imported series:');
    importedSeries.forEach((series, i) => {
      console.log(`  Series ${i + 1}: Index=${series.index}, Entry Fee=${series.entry_fee}, Win Flags=${series.win_flags}, Loss Flags=${series.loss_flags}`);
      console.log(`    Tracks: ${series.track_names.join(', ')}`);
    });
    
    console.log('\n✅ Content cache import test completed successfully!');
    
  } catch (error) {
    console.error('❌ Content cache import test failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
if (require.main === module) {
  testContentCacheImport();
}

module.exports = { testContentCacheImport };