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
 * @param collectionSubName - The collection sub-name for rarity 5 drivers (e.g., "1", "2")
 * @returns The display name for the rarity
 */
export function getRarityDisplay(rarity: number, collectionTheme?: string, collectionSubName?: string): string {
  if (rarity === 5) {
    // For rarity 5, use collection theme if available, otherwise fallback to "Special Edition"
    if (collectionTheme) {
      // If there's a sub-name, append it to the theme
      return collectionSubName ? `${collectionTheme}-${collectionSubName}` : collectionTheme
    }
    return "Special Edition"
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
 * Get all available rarity options from the API
 * @returns Promise<Array<{ rarity: number; display: string; collectionId?: string }>>
 */
export async function getRarityOptions(): Promise<Array<{ rarity: number; display: string; collectionId?: string }>> {
  try {
    // Try to get session token from Supabase localStorage
    const supabaseKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') && key.includes('auth') && key.includes('access-token')
    )
    
    let token = null
    if (supabaseKeys.length > 0) {
      const tokenData = localStorage.getItem(supabaseKeys[0])
      if (tokenData) {
        try {
          const parsed = JSON.parse(tokenData)
          token = parsed.access_token
        } catch (e) {
          console.warn('Failed to parse Supabase token:', e)
        }
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch('/api/rarity-options', {
      headers,
      credentials: 'include' // Include cookies for session-based auth
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch rarity options')
    }
    
    const data = await response.json()
    return data.rarities || []
  } catch (error) {
    console.error('Error fetching rarity options:', error)
    // Fallback to basic rarities if API fails
    return [
      { rarity: 1, display: 'Common' },
      { rarity: 2, display: 'Rare' },
      { rarity: 3, display: 'Epic' },
      { rarity: 4, display: 'Legendary' },
      { rarity: 5, display: 'Special Edition' }
    ]
  }
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