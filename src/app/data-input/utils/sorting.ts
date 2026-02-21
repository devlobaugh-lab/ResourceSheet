import { DriverView } from '@/types/database';
import { CarPartView } from '@/types/database';
import { BoostWithCustomName } from '@/types/database';
import { PART_TYPE_ORDER } from './constants';

/** Local interface for boost with card count */
interface BoostItem extends BoostWithCustomName {
  card_count: number;
}

/**
 * Helper function to get rarity group for sorting.
 * Groups: 0 (rarities 0-3), 1 (rarity 4), 2 (rarity 5)
 */
const getRarityGroup = (rarity: number): number => {
  if (rarity < 4) return 0; // Group 0: rarities 0, 1, 2, 3
  if (rarity === 4) return 1; // Group 1: rarity 4
  if (rarity === 5) return 2; // Group 2: rarity 5
  return 99; // Unknown/invalid rarity
};

/**
 * Sort drivers for data input display.
 * Order: rarity groups first, then series ascending, within series by rarity then ordinal, series 0 at end.
 * 
 * @param drivers - Array of driver views to sort
 * @returns Sorted array of drivers
 */
export const sortDrivers = (drivers: DriverView[]): DriverView[] => {
  return [...drivers].sort((a, b) => {
    const aRarityGroup = getRarityGroup(a.rarity);
    const bRarityGroup = getRarityGroup(b.rarity);

    // First: sort by rarity group
    if (aRarityGroup !== bRarityGroup) return aRarityGroup - bRarityGroup;

    // Within same rarity group, put series 0 at the end
    if (a.series === 0 && b.series !== 0) return 1;
    if (b.series === 0 && a.series !== 0) return -1;

    // For rarity 5 (Special Edition with collections), sort by collection ordinal then driver ordinal
    if (a.rarity === 5 && b.rarity === 5) {
      const aCollOrd = a.collection_ordinal || 999;
      const bCollOrd = b.collection_ordinal || 999;
      if (aCollOrd !== bCollOrd) return aCollOrd - bCollOrd;
      return (a.ordinal || 0) - (b.ordinal || 0);
    }

    // Then: sort by series ascending
    if (a.series !== b.series) return a.series - b.series;

    // Finally: within same series, sort by rarity ascending then ordinal ascending
    if (a.rarity !== b.rarity) return a.rarity - b.rarity;
    return (a.ordinal || 0) - (b.ordinal || 0);
  });
};

/**
 * Get part type order for sorting.
 * Custom order: brakes(1), gearbox(0), rear wing(5), front wing(4), suspension(3), engine(2)
 * 
 * @param type - Car part type number
 * @returns Order position for sorting
 */
export const getPartTypeOrder = (type: number | null): number => {
  return type !== null ? (PART_TYPE_ORDER[type] ?? 99) : 99;
};

/**
 * Sort car parts for data input display.
 * Order: custom part type order, series ascending, rarity ascending, then by ID for consistent tiebreaking.
 * Excludes starter components (series 0).
 * 
 * @param parts - Array of car part views to sort
 * @returns Sorted array of car parts (with series 0 filtered out)
 */
export const sortCarParts = (parts: CarPartView[]): CarPartView[] => {
  // Filter out starter components (they don't have levels/amounts to track)
  const filteredParts = parts.filter(part => {
    // Exclude series 0 (unknown series) and very basic components
    return part.series > 0;
  });

  return [...filteredParts].sort((a, b) => {
    const aOrder = getPartTypeOrder(a.car_part_type);
    const bOrder = getPartTypeOrder(b.car_part_type);
    if (aOrder !== bOrder) return aOrder - bOrder;
    if (a.series !== b.series) return a.series - b.series;
    if (a.rarity !== b.rarity) return a.rarity - b.rarity;
    // Final tiebreaker: sort alphabetically by ID to ensure consistent ordering
    return a.id.localeCompare(b.id);
  });
};

/**
 * Sort boosts for data input display.
 * Order: BoostIcon_1 through BoostIcon_6 first (alphabetically), then rest by ID.
 * 
 * @param boosts - Array of boost items to sort
 * @returns Sorted array of boosts
 */
export const sortBoosts = (boosts: BoostItem[]): BoostItem[] => {
  return [...boosts].sort((a, b) => {
    const aIsSpecial = a.icon && a.icon.startsWith('BoostIcon_') && ['1','2','3','4','5','6'].includes(a.icon.replace('BoostIcon_', ''));
    const bIsSpecial = b.icon && b.icon.startsWith('BoostIcon_') && ['1','2','3','4','5','6'].includes(b.icon.replace('BoostIcon_', ''));
    
    // If one is special and the other isn't, special comes first
    if (aIsSpecial && !bIsSpecial) return -1;
    if (!aIsSpecial && bIsSpecial) return 1;
    
    // If both are special, sort by icon name (BoostIcon_1, BoostIcon_2, etc.)
    if (aIsSpecial && bIsSpecial && a.icon && b.icon) {
      return a.icon.localeCompare(b.icon);
    }
    
    // If neither is special, sort by ID
    return a.id.localeCompare(b.id);
  });
};