import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution.
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts.
 * 
 * @param {...ClassValue[]} inputs - Variable number of class values to merge
 * @returns {string} Merged class string with conflicts resolved
 * 
 * @example
 * cn('px-4 py-2', 'px-6') // Returns 'py-2 px-6' (px-4 overridden by px-6)
 * cn('text-red-500', isActive && 'text-blue-500') // Conditional classes
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency.
 * 
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "$1,234.56")
 * 
 * @example
 * formatCurrency(1234.56) // Returns "$1,234.56"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format a number with thousands separators.
 * 
 * @param {number} num - The number to format
 * @returns {string} Formatted number string with commas
 * 
 * @example
 * formatNumber(1234567) // Returns "1,234,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format large numbers with abbreviations for display.
 * Converts millions to "M", billions to "B", and thousands to "K".
 * 
 * @param {number} num - The number to format
 * @returns {string} Abbreviated number string
 * 
 * @example
 * formatCompactNumber(1500000) // Returns "1.5M"
 * formatCompactNumber(500) // Returns "500"
 * formatCompactNumber(2500) // Returns "2.5K"
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Format a date as a short human-readable string.
 * 
 * @param {string | Date} date - The date to format (ISO string or Date object)
 * @returns {string} Formatted date string (e.g., "Jan 15, 2024")
 * 
 * @example
 * formatDate('2024-01-15') // Returns "Jan 15, 2024"
 * formatDate(new Date()) // Returns current date formatted
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format a date as relative time from now.
 * Returns human-readable strings like "2 days ago" or "Just now".
 * 
 * @param {string | Date} date - The date to format (ISO string or Date object)
 * @returns {string} Relative time string
 * 
 * @example
 * formatRelativeTime('2024-01-10') // Returns "X days ago" (relative to now)
 * formatRelativeTime(new Date()) // Returns "Just now"
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'Just now';
}

/**
 * Truncate text to a maximum length with ellipsis.
 * 
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum number of characters
 * @returns {string} Truncated text with "..." if longer than maxLength
 * 
 * @example
 * truncateText("Hello World", 5) // Returns "Hello..."
 * truncateText("Hi", 10) // Returns "Hi" (no truncation needed)
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate a random alphanumeric ID.
 * 
 * @returns {string} Random 9-character alphanumeric string
 * 
 * @example
 * generateId() // Returns something like "k7x9m2p4n"
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Create a debounced version of a function.
 * The returned function delays invoking the original function until after
 * the specified wait time has elapsed since the last call.
 * 
 * @template T - The type of the function to debounce
 * @param {T} func - The function to debounce
 * @param {number} wait - Number of milliseconds to delay
 * @returns {(...args: Parameters<T>) => void} Debounced function
 * 
 * @example
 * const debouncedSave = debounce(saveData, 500);
 * // Calling debouncedSave multiple times in quick succession
 * // will only invoke saveData once after 500ms of no calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Level upgrade costs (cumulative costs to reach each level)
const LEVEL_UPGRADE_COSTS = [
  0,    // level 1 (no cost)
  4,    // level 2
  14,   // level 3 (4 + 10)
  34,   // level 4 (14 + 20)
  84,   // level 5 (34 + 50)
  184,  // level 6 (84 + 100)
  384,  // level 7 (184 + 200)
  784,  // level 8 (384 + 400)
  1784, // level 9 (784 + 1000)
  3784, // level 10 (1784 + 2000)
  7784  // level 11 (3784 + 4000)
];

// Max levels by rarity
const MAX_LEVELS_BY_RARITY = {
  0: 11, // Basic
  1: 11, // Common
  2: 9,  // Rare
  3: 8,  // Epic
  4: 7,  // Legendary
  5: 7   // Special Edition
};

/**
 * Calculate the highest level an asset can reach given current level and card count.
 * Determines how far a driver or car part can be upgraded with available cards,
 * respecting rarity-based maximum level caps.
 * 
 * @param {number} currentLevel - Current level of the asset (0-11)
 * @param {number} cardCount - Total cards available for upgrading
 * @param {number} rarity - Rarity tier (0=Basic, 1=Common, 2=Rare, 3=Epic, 4=Legendary, 5=SE)
 * @returns {number} The highest achievable level with given cards
 * 
 * @example
 * calculateHighestLevel(5, 100, 2) // Returns max level reachable for Rare item
 * calculateHighestLevel(0, 10, 1) // Returns level achievable from scratch
 */
export function calculateHighestLevel(currentLevel: number, cardCount: number, rarity: number): number {
  // If already at max level for rarity, return current level
  const maxLevel = MAX_LEVELS_BY_RARITY[rarity as keyof typeof MAX_LEVELS_BY_RARITY] || 11;
  if (currentLevel >= maxLevel) {
    return currentLevel;
  }

  // Special case: level 0 items need at least 1 card to reach level 1
  if (currentLevel === 0) {
    if (cardCount < 1) {
      return 0; // Can't even reach level 1
    }
    // For level 0, we have the full card count available
    let availableCards = cardCount;
    let highestLevel = 0;

    // First, check if we can reach level 1 (costs 1 card from level 0)
    if (availableCards >= 1) {
      availableCards -= 1;
      highestLevel = 1;

      // Now check further upgrades from level 1 onward
      for (let level = 2; level <= maxLevel; level++) {
        // Cost to go from level (level-1) to level
        const costToNextLevel = LEVEL_UPGRADE_COSTS[level - 1] - (level > 1 ? LEVEL_UPGRADE_COSTS[level - 2] : 0);

        if (costToNextLevel <= availableCards) {
          availableCards -= costToNextLevel;
          highestLevel = level;
        } else {
          break;
        }
      }
    }

    return highestLevel;
  }

  // For levels > 0, the card count represents additional cards beyond what's needed for current level
  // So we start with the current available cards and see how far we can go
  let availableCards = cardCount;
  let highestLevel = currentLevel;

  for (let level = currentLevel + 1; level <= maxLevel; level++) {
    // Cost to go from level (level-1) to level
    const costToNextLevel = LEVEL_UPGRADE_COSTS[level - 1] - (level > 1 ? LEVEL_UPGRADE_COSTS[level - 2] : 0);

    if (costToNextLevel <= availableCards) {
      availableCards -= costToNextLevel;
      highestLevel = level;
    } else {
      break;
    }
  }

  return highestLevel;
}

/**
 * Get the maximum achievable level for a given rarity tier.
 * Each rarity has a different maximum level cap.
 * 
 * @param {number} rarity - Rarity tier (0=Basic, 1=Common, 2=Rare, 3=Epic, 4=Legendary, 5=SE)
 * @returns {number} Maximum level for the given rarity (7-11)
 * 
 * @example
 * getMaxLevelForRarity(2) // Returns 9 (Rare max level)
 * getMaxLevelForRarity(4) // Returns 7 (Legendary max level)
 */
export function getMaxLevelForRarity(rarity: number): number {
  return MAX_LEVELS_BY_RARITY[rarity as keyof typeof MAX_LEVELS_BY_RARITY] || 11;
}

/**
 * Stats per level interface for drivers
 */
export interface DriverStatsPerLevel {
  overtaking?: number;
  blocking?: number;
  qualifying?: number;
  tyreUse?: number;
  raceStart?: number;
  cardsToUpgrade: number;
  softCurrencyToUpgrade: number;
  legacyPointsToUpgrade: number;
}

/**
 * Stats per level interface for car parts
 */
export interface CarPartStatsPerLevel {
  speed?: number;
  cornering?: number;
  powerUnit?: number;
  qualifying?: number;
  drs?: number;
  pitStopTime?: number;
  cardsToUpgrade: number;
  softCurrencyToUpgrade: number;
}

/**
 * Calculate cards spent to reach highest level from current level
 */
function calculateCardsSpent(currentLevel: number, highestLevel: number): number {
  if (highestLevel <= currentLevel) return 0;
  
  let cardsSpent = 0;
  // For level 0 items, first upgrade costs 1 card
  if (currentLevel === 0) {
    cardsSpent += 1; // Cost to go from level 0 to 1
    currentLevel = 1;
  }
  
  for (let level = currentLevel + 1; level <= highestLevel; level++) {
    const costToNextLevel = LEVEL_UPGRADE_COSTS[level - 1] - (level > 1 ? LEVEL_UPGRADE_COSTS[level - 2] : 0);
    cardsSpent += costToNextLevel;
  }
  
  return cardsSpent;
}

/**
 * Calculate cards needed for next level upgrade from highest level
 * Returns the cards needed to upgrade from highestLevel to highestLevel + 1, 
 * minus any remaining cards after upgrading to highestLevel
 */
export function calculateCardsToNextLevel(
  currentLevel: number,
  cardCount: number,
  highestLevel: number,
  rarity: number,
  statsPerLevel?: DriverStatsPerLevel[] | CarPartStatsPerLevel[] | null
): number {
  const maxLevel = getMaxLevelForRarity(rarity);
  if (highestLevel >= maxLevel) return 0;

  // Get the base cost to upgrade from highestLevel to highestLevel + 1
  let baseCost = 0;
  
  // If we have stats_per_level data, use it
  if (statsPerLevel && statsPerLevel.length > 0) {
    const nextLevelIndex = highestLevel - 1;
    if (nextLevelIndex >= 0 && nextLevelIndex < statsPerLevel.length) {
      baseCost = statsPerLevel[nextLevelIndex].cardsToUpgrade;
    }
  } else {
    // Fallback to hardcoded costs
    baseCost = LEVEL_UPGRADE_COSTS[highestLevel] - (highestLevel > 0 ? LEVEL_UPGRADE_COSTS[highestLevel - 1] : 0);
  }

  // Calculate remaining cards after upgrading to highestLevel
  const cardsSpent = calculateCardsSpent(currentLevel, highestLevel);
  const remainingCards = cardCount - cardsSpent;

  // Cards needed = base cost - remaining cards
  return Math.max(0, baseCost - remainingCards);
}

/**
 * Calculate additional cards needed to reach max level
 * Returns: cards needed (positive) beyond what user currently has
 */
export function calculateCardsToMaxLevel(
  currentLevel: number,
  cardCount: number,
  highestLevel: number,
  rarity: number,
  statsPerLevel?: DriverStatsPerLevel[] | CarPartStatsPerLevel[] | null
): number {
  const maxLevel = getMaxLevelForRarity(rarity);
  if (highestLevel >= maxLevel) return 0;

  // Calculate total cards needed from highest level to max
  let totalCardsNeeded = 0;

  if (statsPerLevel && statsPerLevel.length > 0) {
    // Use stats_per_level data
    for (let level = highestLevel; level < maxLevel; level++) {
      const levelIndex = level - 1;
      if (levelIndex >= 0 && levelIndex < statsPerLevel.length) {
        totalCardsNeeded += statsPerLevel[levelIndex].cardsToUpgrade;
      }
    }
  } else {
    // Use hardcoded costs
    for (let level = highestLevel + 1; level <= maxLevel; level++) {
      totalCardsNeeded += LEVEL_UPGRADE_COSTS[level - 1] - (level > 1 ? LEVEL_UPGRADE_COSTS[level - 2] : 0);
    }
  }

  // Calculate remaining cards after upgrading to highest level
  const cardsSpent = calculateCardsSpent(currentLevel, highestLevel);
  const remainingCards = cardCount - cardsSpent;

  // Additional cards needed = total needed - remaining
  return Math.max(0, totalCardsNeeded - remainingCards);
}

/**
 * Calculate legacy points for a single level upgrade (from currentLevel to currentLevel + 1)
 */
export function calculateLegacyToNextLevel(
  currentLevel: number,
  rarity: number,
  statsPerLevel?: DriverStatsPerLevel[] | CarPartStatsPerLevel[] | null
): number {
  if (!statsPerLevel || currentLevel >= getMaxLevelForRarity(rarity)) return 0;
  
  const levelIndex = currentLevel - 1;
  if (levelIndex >= 0 && levelIndex < statsPerLevel.length) {
    return (statsPerLevel[levelIndex] as DriverStatsPerLevel).legacyPointsToUpgrade || 0;
  }
  return 0;
}

/**
 * Calculate legacy points cost to upgrade from current level to highest level
 */
export function calculateLegacyCostToHighestLevel(
  currentLevel: number,
  highestLevel: number,
  statsPerLevel?: DriverStatsPerLevel[] | CarPartStatsPerLevel[] | null
): number {
  if (highestLevel <= currentLevel) return 0;
  if (!statsPerLevel || statsPerLevel.length === 0) return 0;

  let totalCost = 0;
  for (let level = currentLevel; level < highestLevel; level++) {
    const levelIndex = level - 1;
    if (levelIndex >= 0 && levelIndex < statsPerLevel.length) {
      totalCost += (statsPerLevel[levelIndex] as DriverStatsPerLevel).legacyPointsToUpgrade || 0;
    }
  }

  return totalCost;
}

/**
 * Calculate gold cost to upgrade from current level to highest level
 */
export function calculateGoldCostToHighestLevel(
  currentLevel: number,
  highestLevel: number,
  statsPerLevel?: DriverStatsPerLevel[] | CarPartStatsPerLevel[] | null
): number {
  if (highestLevel <= currentLevel) return 0;
  if (!statsPerLevel || statsPerLevel.length === 0) return 0;

  let totalCost = 0;
  for (let level = currentLevel; level < highestLevel; level++) {
    const levelIndex = level - 1;
    if (levelIndex >= 0 && levelIndex < statsPerLevel.length) {
      totalCost += statsPerLevel[levelIndex].softCurrencyToUpgrade;
    }
  }

  return totalCost;
}

/**
 * Calculate gold cost to upgrade from highest level to next level
 * Returns the gold needed for the next upgrade (highestLevel to highestLevel + 1)
 */
export function calculateGoldToNextLevel(
  highestLevel: number,
  rarity: number,
  statsPerLevel?: DriverStatsPerLevel[] | CarPartStatsPerLevel[] | null
): number {
  const maxLevel = getMaxLevelForRarity(rarity);
  if (highestLevel >= maxLevel) return 0;
  if (!statsPerLevel || statsPerLevel.length === 0) return 0;

  const nextLevelIndex = highestLevel - 1;
  if (nextLevelIndex >= 0 && nextLevelIndex < statsPerLevel.length) {
    return statsPerLevel[nextLevelIndex].softCurrencyToUpgrade;
  }

  return 0;
}

/**
 * Calculate gold cost to reach max level from highest level
 * Returns the total gold needed from highestLevel to maxLevel
 */
export function calculateGoldToMaxLevel(
  currentLevel: number,
  cardCount: number,
  highestLevel: number,
  rarity: number,
  statsPerLevel?: DriverStatsPerLevel[] | CarPartStatsPerLevel[] | null
): number {
  const maxLevel = getMaxLevelForRarity(rarity);
  if (highestLevel >= maxLevel) return 0;
  if (!statsPerLevel || statsPerLevel.length === 0) return 0;

  // Calculate total gold needed from highestLevel to maxLevel
  let totalGoldNeeded = 0;
  for (let level = highestLevel; level < maxLevel; level++) {
    const levelIndex = level - 1;
    if (levelIndex >= 0 && levelIndex < statsPerLevel.length) {
      totalGoldNeeded += statsPerLevel[levelIndex].softCurrencyToUpgrade;
    }
  }

  return totalGoldNeeded;
}

/**
 * Calculate legacy points cost to reach max level from highest level
 * Returns the total legacy points needed from highestLevel to maxLevel
 */
export function calculateLegacyToMaxLevel(
  currentLevel: number,
  cardCount: number,
  highestLevel: number,
  rarity: number,
  statsPerLevel?: DriverStatsPerLevel[] | CarPartStatsPerLevel[] | null
): number {
  const maxLevel = getMaxLevelForRarity(rarity);
  if (highestLevel >= maxLevel) return 0;
  if (!statsPerLevel || statsPerLevel.length === 0) return 0;

  // Calculate total legacy points needed from highestLevel to maxLevel
  let totalLegacyNeeded = 0;
  for (let level = highestLevel; level < maxLevel; level++) {
    const levelIndex = level - 1;
    if (levelIndex >= 0 && levelIndex < statsPerLevel.length) {
      totalLegacyNeeded += (statsPerLevel[levelIndex] as DriverStatsPerLevel).legacyPointsToUpgrade || 0;
    }
  }

  return totalLegacyNeeded;
}

/**
 * Get the Tailwind CSS background color class for a rarity tier.
 * Used for visual styling of cells based on item rarity.
 * 
 * @param {number} rarity - Rarity tier (0-5)
 * @returns {string} Tailwind CSS background color class
 * 
 * @example
 * getRarityBackground(4) // Returns "bg-yellow-300" (Legendary)
 * getRarityBackground(2) // Returns "bg-orange-300" (Rare)
 */
export function getRarityBackground(rarity: number): string {
  return rarity === 0 ? "bg-gray-200" :
         rarity === 1 ? "bg-blue-200" :
         rarity === 2 ? "bg-orange-300" :
         rarity === 3 ? "bg-purple-300" :
         rarity === 4 ? "bg-yellow-300" :
         rarity === 5 ? "bg-red-300" : "bg-gray-200";
}

/**
 * Get the human-readable display name for a rarity tier.
 * 
 * @param {number} rarity - Rarity tier (0-5)
 * @returns {string} Display name (Basic, Common, Rare, Epic, Legendary, or Special Edition)
 * 
 * @example
 * getRarityDisplay(3) // Returns "Epic"
 * getRarityDisplay(5) // Returns "Special Edition"
 */
export function getRarityDisplay(rarity: number): string {
  const rarityMap: Record<number, string> = {
    0: 'Basic',
    1: 'Common',
    2: 'Rare',
    3: 'Epic',
    4: 'Legendary',
    // Rarity 5 is a Special Edition type; display value is collection-driven when available.
    5: 'Special Edition'
  }
  return rarityMap[rarity] || 'Unknown';
}

/**
 * Get collection-based display name for Special Edition (rarity 5) drivers.
 * For SE drivers, the display name is derived from the collection theme
 * rather than just "Special Edition".
 * 
 * @param {string | null} [collectionTheme] - Theme from the collections table
 * @param {string | null} [collectionSubName] - Sub-name with variant number
 * @returns {string} Collection-based display name (e.g., "HotProspects-2") or "Special Edition"
 * 
 * @example
 * getCollectionRarityDisplay("HotProspects", "SUBTITLE_2") // Returns "HotProspects-2"
 * getCollectionRarityDisplay(null, null) // Returns "Special Edition"
 */
export function getCollectionRarityDisplay(collectionTheme?: string | null, collectionSubName?: string | null): string {
  if (!collectionTheme) return 'Special Edition';

  let base = collectionTheme;
  if (collectionSubName && collectionSubName.length > 0) {
    const lastChar = collectionSubName.slice(-1);
    base = `${base}-${lastChar}`;
  }

  return base;
}
