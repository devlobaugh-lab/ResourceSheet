/**
 * Level range validation by rarity
 * Defines the minimum and maximum achievable levels for each rarity tier
 */
export const LEVEL_RANGES = {
  0: { min: 1, max: 11 }, // Basic
  1: { min: 1, max: 11 }, // Common
  2: { min: 1, max: 9 },  // Rare
  3: { min: 1, max: 8 },  // Epic
  4: { min: 1, max: 7 },  // Legendary
  5: { min: 1, max: 7 },  // Special Edition
} as const;

/**
 * Part type ordering for car parts sorting
 * Custom order: brakes(1), gearbox(0), rear wing(5), front wing(4), suspension(3), engine(2)
 */
export const PART_TYPE_ORDER: Record<number, number> = {
  1: 0, // Brakes - first
  0: 1, // Gearbox - second
  5: 2, // Rear Wing - third
  4: 3, // Front Wing - fourth
  3: 4, // Suspension - fifth
  2: 5  // Engine - sixth
};

/**
 * Part type display names
 */
export const PART_TYPE_NAMES: Record<number, string> = {
  0: 'Gearbox',
  1: 'Brakes',
  2: 'Engine',
  3: 'Suspension',
  4: 'Front Wing',
  5: 'Rear Wing'
};