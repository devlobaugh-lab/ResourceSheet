/**
 * Utility functions for handling rarity display logic
 */

export interface RarityDisplayConfig {
  rarity: number
  collectionTheme?: string
  collectionSubName?: string
}

/**
 * Get the display name for a rarity level
 * @param rarity - The numeric rarity (1-5)
 * @param collectionTheme - The collection theme for rarity 5 drivers
 * @returns The display name for the rarity
 */
export function getRarityDisplay(rarity: number, collectionTheme?: string): string {
  if (rarity === 5) {
    // For rarity 5, use collection theme if available, otherwise fallback to "Special Edition"
    return collectionTheme || "Special Edition"
  }
  
  // Map numeric rarity to display names
  const rarityNames: Record<number, string> = {
    1: "Common",
    2: "Uncommon", 
    3: "Rare",
    4: "Epic"
  }
  
  return rarityNames[rarity] || "Unknown"
}

/**
 * Get the CSS classes for rarity styling
 * @param rarity - The numeric rarity (1-5)
 * @returns Object containing color and background classes
 */
export function getRarityStyles(rarity: number) {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
  
  if (rarity === 5) {
    return {
      color: "text-purple-600",
      bg: "bg-purple-100",
      all: `${baseClasses} text-purple-600 bg-purple-100`
    }
  }
  
  const rarityStyles: Record<number, { color: string; bg: string }> = {
    1: { color: "text-gray-600", bg: "bg-gray-100" },
    2: { color: "text-green-600", bg: "bg-green-100" },
    3: { color: "text-blue-600", bg: "bg-blue-100" },
    4: { color: "text-orange-600", bg: "bg-orange-100" }
  }
  
  const styles = rarityStyles[rarity] || { color: "text-gray-600", bg: "bg-gray-100" }
  
  return {
    color: styles.color,
    bg: styles.bg,
    all: `${baseClasses} ${styles.color} ${styles.bg}`
  }
}

/**
 * Get rarity display configuration object
 * @param config - Rarity configuration
 * @returns Complete rarity display configuration
 */
export function getRarityConfig(config: RarityDisplayConfig) {
  return {
    display: getRarityDisplay(config.rarity, config.collectionTheme),
    ...getRarityStyles(config.rarity)
  }
}