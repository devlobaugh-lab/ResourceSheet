/**
 * Sorting utilities for DataGrid component
 */

/** Local storage key for sort preferences */
export const SORT_PREFERENCES_KEY = 'f1-sort-preferences';

/**
 * Get default sort configuration for a grid type.
 * 
 * @param gridType - The type of grid ('drivers', 'parts', 'boosts', etc.)
 * @returns Default sort configuration with sortBy and sortOrder
 */
export const getDefaultSortForGridType = (gridType: string) => {
  switch (gridType) {
    case 'drivers':
      return { sortBy: 'series', sortOrder: 'asc' as const };
    case 'parts':
      return { sortBy: 'car_part_type', sortOrder: 'asc' as const };
    case 'boosts':
      return { sortBy: 'name', sortOrder: 'asc' as const };
    default:
      return { sortBy: 'name', sortOrder: 'desc' as const };
  }
};

/**
 * Load sort preferences from localStorage.
 * 
 * @param gridType - The type of grid
 * @returns Saved sort preferences or default values
 */
export const loadSortPreferences = (gridType: string) => {
  try {
    const stored = localStorage.getItem(SORT_PREFERENCES_KEY);
    if (stored) {
      const preferences = JSON.parse(stored);
      return preferences[gridType] || getDefaultSortForGridType(gridType);
    }
  } catch (error) {
    console.warn('Failed to load sort preferences:', error);
  }
  return getDefaultSortForGridType(gridType);
};

/**
 * Save sort preferences to localStorage.
 * 
 * @param gridType - The type of grid
 * @param sortBy - The column to sort by
 * @param sortOrder - The sort order ('asc' or 'desc')
 */
export const saveSortPreferences = (gridType: string, sortBy: string, sortOrder: 'asc' | 'desc') => {
  try {
    const stored = localStorage.getItem(SORT_PREFERENCES_KEY);
    const preferences = stored ? JSON.parse(stored) : {};
    preferences[gridType] = { sortBy, sortOrder };
    localStorage.setItem(SORT_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save sort preferences:', error);
  }
};