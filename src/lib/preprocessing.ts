/**
 * Preprocessing Logic for Content Cache Data
 * 
 * This module contains the preprocessing logic that should be applied to
 * content cache data before comparison with existing database records.
 * 
 * The preprocessing ensures that:
 * 1. SE Turbo drivers have Rarity 5 → Rarity 6 mapping applied
 * 2. Legendary/SE drivers (rarity >= 4) have series mapped based on min_gp_tier
 * 3. Regular drivers (rarity < 4) keep their original series from JSON
 */

/**
 * Apply SE Turbo mapping (Rarity 5 → Rarity 6)
 * SE Turbo drivers are identified by collectionSubName ending with 'SUBTITLE_2'
 * Also generate unique IDs for SE Turbo drivers to avoid conflicts with SE Standard
 */
export function applySETurboMapping(drivers: any[]): any[] {
  console.log('applySETurboMapping called with', drivers.length, 'drivers')
  
  return drivers.map(driver => {
    console.log('Checking driver:', driver.name, 'Rarity:', driver.rarity, 'Collection:', driver.collectionSubName || driver.collection_sub_name)
    
    // Check for both camelCase and snake_case properties
    const collectionName = driver.collectionSubName || driver.collection_sub_name
    
    if (driver.rarity === 5 && collectionName && collectionName.endsWith('SUBTITLE_2')) {
      console.log('Found SE Turbo driver:', driver.name, 'Converting Rarity 5 → 6')
      return { 
        ...driver, 
        rarity: 6
        // Don't modify the ID - let the database handle uniqueness
      };
    }
    return driver;
  });
}

/**
 * Apply series mapping for Legendary, SE Standard, and SE Turbo drivers
 * Regular drivers (rarity < 4) keep their original series from JSON
 */
export function applySeriesMapping(drivers: any[]): any[] {
  return drivers.map(driver => {
    // Apply series mapping to drivers with rarity >= 4 OR SE Turbo drivers (rarity 6)
    if (driver.rarity >= 4) {
      let series;
      // Use minGpTier from content cache or min_gp_tier from database
      const minGpTier = driver.minGpTier || driver.min_gp_tier;
      
      switch (minGpTier) {
        case 0: series = 3; break;  // Junior → Series 3
        case 1: series = 6; break;  // Challenger → Series 6
        case 2: series = 9; break;  // Contender → Series 9
        case 3: series = 12; break; // Champion → Series 12
        default: series = 3; break; // Default to Junior
      }
      return { ...driver, series };
    }
    // Regular drivers (rarity < 4) keep their original series from JSON
    return driver;
  });
}

/**
 * Apply full preprocessing to drivers data
 * This combines both SE Turbo mapping and series mapping
 */
export function preprocessDrivers(drivers: any[]): any[] {
  console.log('preprocessDrivers called with', drivers.length, 'drivers')
  
  // Apply SE Turbo mapping first (Rarity 5 → Rarity 6)
  const driversWithTurboMapping = applySETurboMapping(drivers);
  
  // Then apply series mapping for Legendary/SE drivers
  const processedDrivers = applySeriesMapping(driversWithTurboMapping);
  
  console.log('preprocessDrivers completed, returning', processedDrivers.length, 'drivers')
  return processedDrivers;
}

/**
 * Check if a driver requires preprocessing
 * Returns true for Legendary/SE drivers (rarity >= 4) or SE Turbo drivers
 */
export function requiresPreprocessing(driver: any): boolean {
  return driver.rarity >= 4 || 
         (driver.rarity === 5 && driver.collection_sub_name && driver.collection_sub_name.endsWith('SUBTITLE_2'));
}

/**
 * Get the expected series for a driver based on its rarity and min_gp_tier
 * This is used for comparison logic
 */
export function getExpectedSeries(rarity: number, minGpTier: number | null): number {
  // Only apply series mapping to drivers with rarity >= 4
  if (rarity >= 4) {
    switch (minGpTier) {
      case 0: return 3;   // Junior → Series 3
      case 1: return 6;   // Challenger → Series 6
      case 2: return 9;   // Contender → Series 9
      case 3: return 12;  // Champion → Series 12
      default: return 3;  // Default to Junior
    }
  }
  // Regular drivers (rarity < 4) should keep their original series
  return 0; // This indicates no series mapping should be applied
}