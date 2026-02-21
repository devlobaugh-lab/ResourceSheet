/**
 * Color utility functions for DataGrid component
 */

/**
 * Get stat background color based on value position in range.
 * Uses a gradient from red (min) through white (median) to green (max).
 * 
 * @param value - The value to color
 * @param min - Minimum value in range
 * @param max - Maximum value in range
 * @param median - Median value in range
 * @returns Tailwind CSS background color class
 */
export const getStatBackgroundColor = (value: number, min: number, max: number, median: number): string => {
  if (value === max) return 'bg-green-400';
  if (value === median) return 'bg-white';
  if (value === min) return 'bg-red-400';

  if (value < median) {
    // Gradient from red-400 to white for values below median
    const ratio = (value - min) / (median - min);
    if (ratio < 0.25) return 'bg-red-400';
    if (ratio < 0.5) return 'bg-red-300';
    if (ratio < 0.75) return 'bg-red-200';
    return 'bg-red-100';
  } else {
    // Gradient from white to green-400 for values above median
    const ratio = (value - median) / (max - median);
    if (ratio < 0.25) return 'bg-green-100';
    if (ratio < 0.5) return 'bg-green-200';
    if (ratio < 0.75) return 'bg-green-300';
    return 'bg-green-400';
  }
};

/**
 * Get boost value background color based on tier.
 * Tier 1=blue, 2=green, 3=yellow, 4=orange, 5=red
 * 
 * @param tierValue - The tier value (1-5)
 * @returns Tailwind CSS background color class
 */
export const getBoostValueColor = (tierValue: number): string => {
  return tierValue === 1 ? "bg-blue-200" :
         tierValue === 2 ? "bg-green-200" :
         tierValue === 3 ? "bg-yellow-200" :
         tierValue === 4 ? "bg-orange-200" :
         tierValue === 5 ? "bg-red-300" : "bg-gray-50";
};

/**
 * Get rarity background color for cells.
 * 
 * @param rarity - The rarity value (0-6)
 * @returns Tailwind CSS background color class
 */
export const getRarityBackground = (rarity: number): string => {
  return rarity === 0 ? "bg-gray-300" :
         rarity === 1 ? "bg-blue-200" :
         rarity === 2 ? "bg-orange-300" :
         rarity === 3 ? "bg-purple-300" :
         rarity === 4 ? "bg-yellow-300" :
         rarity === 5 ? "bg-red-300" :
         rarity === 6 ? "bg-rose-400" : "bg-gray-300";
};