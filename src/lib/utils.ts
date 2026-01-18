import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format numbers with thousands separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format dates
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
 * Format relative time (e.g., "2 days ago")
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
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function
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
 * Calculate the highest level an asset can reach given current level and card count
 * Note: cardCount represents total cards available for this item
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
