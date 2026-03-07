#!/usr/bin/env node

/**
 * Test script to test the series API directly
 */

const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/resourcesheet',
});

async function testAPIDirect() {
  console.log('🚀 Testing series API directly...');
  
  try {
    // Test the exact query that the API uses
    const { rows: seriesData } = await pool.query(`
      SELECT * FROM series_data ORDER BY index ASC
    `);
    
    console.log(`📊 Found ${seriesData.length} series in database`);
    
    // Test the track lookup query
    const allTrackNames = new Set();
    for (const series of seriesData) {
      const trackNames = series.track_names || [];
      for (const trackName of trackNames) {
        allTrackNames.add(trackName);
      }
    }
    
    console.log(`📊 Found ${allTrackNames.size} unique track names`);
    
    // Test track aliases lookup
    const { rows: aliasesData } = await pool.query(`
      SELECT system_name, display_name FROM track_name_aliases WHERE system_name = ANY($1)
    `, [Array.from(allTrackNames)]);
    
    console.log(`📊 Found ${aliasesData.length} track aliases`);
    
    // Test tracks lookup
    const { rows: tracksData } = await pool.query(`
      SELECT id, name, laps, driver_track_stat, car_track_stat FROM tracks WHERE name = ANY($1)
    `, [Array.from(allTrackNames)]);
    
    console.log(`📊 Found ${tracksData.length} tracks`);
    
    // Build track map by name for fallback lookup
    const trackMap = {};
    for (const track of tracksData) {
      trackMap[track.name] = {
        id: track.id,
        laps: track.laps,
        driver_track_stat: track.driver_track_stat,
        car_track_stat: track.car_track_stat
      };
    }
    
    // Build alias map
    const aliasMap = {};
    for (const alias of aliasesData) {
      aliasMap[alias.system_name] = alias.display_name;
    }
    
    // Build series with tracks - use track_info if available (has correct lap counts)
    const seriesWithTracks = seriesData.map((series) => {
      let seriesTracks = [];
      
      // Use track_info if available (has series-specific lap counts)
      const trackInfo = series.track_info;
      if (trackInfo && trackInfo.length > 0) {
        seriesTracks = trackInfo.map((info, idx) => ({
          id: series.track_ids[idx] || `unknown-${idx}`,
          name: info.name,
          display_name: aliasMap[info.name] || null,
          laps: info.laps,
          driver_track_stat: info.driverStat,
          car_track_stat: info.carStat
        }))
      } else {
        // Fallback: lookup from tracks table using track_names
        seriesTracks = (series.track_names || []).map((trackName, idx) => {
          const trackData = trackMap[trackName];
          return {
            id: trackData?.id || series.track_ids[idx] || `unknown-${idx}`,
            name: trackName,
            display_name: aliasMap[trackName] || null,
            laps: trackData?.laps || 0,
            driver_track_stat: trackData?.driver_track_stat || 'none',
            car_track_stat: trackData?.car_track_stat || 'none'
          }
        })
      }

      // Find common track stat
      const commonStat = findCommonTrackStat(seriesTracks);

      return {
        index: series.index,
        entry_fee: series.entry_fee,
        win_flags: series.win_flags,
        loss_flags: series.loss_flags,
        win_rep: series.win_rep,
        flags_to_unlock: series.flags_to_unlock,
        max_flags: series.max_flags,
        bot_loadout: series.bot_loadout,
        ai_car_loadouts: series.ai_car_loadouts,
        created_at: series.created_at,
        updated_at: series.updated_at,
        track_names: series.track_names,
        track_info: trackInfo || undefined,
        tracks: seriesTracks,
        common_track_stat: commonStat
      }
    })

    console.log(`📊 Built ${seriesWithTracks.length} series with tracks`);
    
    // Show sample data
    console.log('\n📋 Sample series with tracks:');
    seriesWithTracks.slice(0, 3).forEach((series, i) => {
      console.log(`  Series ${i + 1}: Index=${series.index}, Entry Fee=${series.entry_fee}, Tracks=${series.tracks.length}`);
      console.log(`    Common stat: ${series.common_track_stat}`);
      series.tracks.forEach((track, j) => {
        console.log(`      Track ${j + 1}: ${track.name} (${track.laps} laps, ${track.driver_track_stat}/${track.car_track_stat})`);
      });
    });
    
    console.log('\n✅ API direct test completed successfully!');
    
  } catch (error) {
    console.error('❌ API direct test failed:', error);
  } finally {
    await pool.end();
  }
}

// Helper function to find common track stat
function findCommonTrackStat(tracks) {
  if (tracks.length === 0) return null

  // Collect all stats from both driver and car stats
  const allStats = []
  for (const track of tracks) {
    if (track.driver_track_stat && track.driver_track_stat !== 'none') {
      allStats.push(track.driver_track_stat)
    }
    if (track.car_track_stat && track.car_track_stat !== 'none') {
      allStats.push(track.car_track_stat)
    }
  }

  if (allStats.length === 0) return null

  // Count occurrences of each stat
  const statCounts = {}
  for (const stat of allStats) {
    statCounts[stat] = (statCounts[stat] || 0) + 1
  }

  // Check if all tracks share a common stat (all 4 tracks have the same stat)
  const totalTracks = tracks.length
  for (const [stat, count] of Object.entries(statCounts)) {
    // If stat appears in all tracks (count >= totalTracks means all tracks have this stat)
    if (count >= totalTracks) {
      return stat
    }
  }

  // Check if 3 out of 4 tracks share a common stat
  const threshold = Math.ceil(totalTracks * 0.75) // 3 out of 4
  for (const [stat, count] of Object.entries(statCounts)) {
    if (count >= threshold) {
      return stat
    }
  }

  // No commonality found
  return 'Mixed'
}

// Run the test
if (require.main === module) {
  testAPIDirect();
}

module.exports = { testAPIDirect };