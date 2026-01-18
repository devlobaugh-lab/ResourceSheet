import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { BoostNameEditor } from '@/components/BoostNameEditor'
import { UserAssetView, CatalogItem, Boost, BoostWithCustomName, DriverView, CarPartView } from '@/types/database';

// Extended types for unified filtering
interface BoostItem extends BoostWithCustomName {
  is_boost: true;
  card_count: number;
}
import { cn, formatNumber, calculateHighestLevel } from '@/lib/utils';

// Helper function to get stat background color based on value position in range
const getStatBackgroundColor = (value: number, min: number, max: number, median: number): string => {
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

// localStorage utilities for sort persistence
const SORT_PREFERENCES_KEY = 'f1-sort-preferences';

const getDefaultSortForGridType = (gridType: string) => {
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

const loadSortPreferences = (gridType: string) => {
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

const saveSortPreferences = (gridType: string, sortBy: string, sortOrder: 'asc' | 'desc') => {
  try {
    const stored = localStorage.getItem(SORT_PREFERENCES_KEY);
    const preferences = stored ? JSON.parse(stored) : {};
    preferences[gridType] = { sortBy, sortOrder };
    localStorage.setItem(SORT_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save sort preferences:', error);
  }
};

interface DataGridProps {
  assets?: UserAssetView[];
  items?: CatalogItem[];
  boosts?: Boost[];
  drivers?: DriverView[];
  carParts?: CarPartView[];
  onAddToCollection?: (item: CatalogItem) => void;
  onRemoveFromCollection?: (item: CatalogItem) => void;
  onCompare?: (items: CatalogItem[]) => void;
  onCompareSingle?: (item: CatalogItem) => void;
  compareItems?: CatalogItem[];
  className?: string;
  title?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showCompareButton?: boolean;
  gridType?: 'drivers' | 'parts' | 'boosts' | 'car-parts';
  onBoostNameChange?: () => void;
  bonusPercentage?: number;
  bonusCheckedItems?: Set<string>;
  onBonusToggle?: (itemId: string) => void;
  showHighestLevel?: boolean;
}

interface FilterState {
  search: string;
  maxSeries: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Extended types for unified filtering
interface AssetItem extends UserAssetView {
  is_asset: true;
}

interface CatalogItemItem extends CatalogItem {
  is_asset: false;
}

interface BoostItem extends BoostWithCustomName {
  is_boost: true;
}

type FilterableItem = AssetItem | CatalogItemItem | BoostItem;

export function DataGrid({
  assets = [],
  items = [],
  boosts = [],
  drivers = [],
  carParts = [],
  onAddToCollection,
  onRemoveFromCollection,
  onCompare,
  compareItems = [],
  className,
  title = 'Assets',
  showFilters = true,
  showSearch = true,
  showCompareButton = true,
  gridType = 'drivers',
  onBoostNameChange,
  bonusPercentage = 0,
  bonusCheckedItems = new Set(),
  onBonusToggle,
  showHighestLevel = false,
}: DataGridProps) {
  const [filters, setFilters] = useState<FilterState>(() => {
    // Load saved sort preferences on component initialization
    const savedPrefs = loadSortPreferences(gridType);
    return {
      search: '',
      maxSeries: 12, // Default to show all series
      ...savedPrefs,
    };
  });

  // Save sort preferences whenever they change
  useEffect(() => {
    saveSortPreferences(gridType, filters.sortBy, filters.sortOrder);
  }, [gridType, filters.sortBy, filters.sortOrder]);



  // Extended types for unified filtering
  interface DriverItem extends DriverView {
    is_driver: true;
  }

  interface CarPartItem extends CarPartView {
    is_car_part: true;
  }

  type FilterableItem = AssetItem | CatalogItemItem | BoostItem | DriverItem | CarPartItem;

  // Combine all data sources for unified display
  const allItems: FilterableItem[] = drivers.length > 0
    ? drivers.map(driver => ({ ...driver, is_driver: true } as FilterableItem))
    : carParts.length > 0
      ? carParts.map(carPart => ({ ...carPart, is_car_part: true } as FilterableItem))
      : assets.length > 0
        ? assets.map(asset => ({ ...asset, is_asset: true } as FilterableItem))
        : boosts.length > 0
          ? boosts.map(boost => ({ ...boost, is_boost: true } as FilterableItem))
          : items.map(item => ({ ...item, is_asset: false } as FilterableItem));

  // Filter and search logic
  const filteredItems = allItems.filter((item: FilterableItem) => {
    const matchesSearch = !filters.search ||
      item.name.toLowerCase().includes(filters.search.toLowerCase());

    // Max Series filter (only for drivers and parts)
    const matchesMaxSeries = gridType === 'boosts' ||
      !('is_driver' in item || 'is_car_part' in item) ||
      (item as DriverView | CarPartView).series <= filters.maxSeries;

    return matchesSearch && matchesMaxSeries;
  });

  // Helper function to get stat value for sorting (including bonuses)
  const getStatValueForSort = useCallback((item: FilterableItem, statName: string): number => {
    let userLevel = 0;
    if ('is_driver' in item && item.is_driver) {
      userLevel = (item as DriverView).level;
    } else if ('is_car_part' in item && item.is_car_part) {
      userLevel = (item as CarPartView).level;
    } else if ('is_asset' in item && item.is_asset) {
      userLevel = (item as UserAssetView).level;
    }

    // Level 0 should show all 0 stats
    if (userLevel === 0) {
      return 0;
    }

    let stats: Array<{ [key: string]: number }> | null = null;
    if ('is_driver' in item && item.is_driver && (item as DriverView).stats_per_level) {
      stats = (item as DriverView).stats_per_level;
    } else if ('is_car_part' in item && item.is_car_part && (item as CarPartView).stats_per_level) {
      stats = (item as CarPartView).stats_per_level;
    } else if ('is_asset' in item && item.is_asset && (item as UserAssetView).stats_per_level) {
      stats = (item as UserAssetView).stats_per_level;
    }

    let baseValue = 0;
    if (stats && stats.length > userLevel - 1 && stats[userLevel - 1][statName] !== undefined) {
      baseValue = stats[userLevel - 1][statName];
    }

    // Get the item ID for bonus checking
    let itemId = '';
    if ('is_driver' in item && item.is_driver) {
      itemId = (item as DriverView).id;
    } else if ('is_car_part' in item && item.is_car_part) {
      itemId = (item as CarPartView).id;
    } else if ('is_asset' in item && item.is_asset) {
      itemId = (item as UserAssetView).id;
    }

    // Apply bonus if item has bonus checked and bonus percentage is set
    if (bonusCheckedItems.has(itemId) && bonusPercentage > 0) {
      if (statName === 'pitStopTime') {
        // Pit stop time should decrease (lower is better)
        baseValue = Math.round((baseValue * (1 - bonusPercentage / 100)) * 100) / 100;
      } else {
        // All other stats should increase and round up
        baseValue = Math.ceil(baseValue * (1 + bonusPercentage / 100));
      }
    }

    return baseValue;
  }, [bonusCheckedItems, bonusPercentage]);

  // Helper function to get boost tier value for sorting
  const getBoostTierValueForSort = useCallback((item: FilterableItem, tierName: string): number => {
    if ('is_boost' in item && item.is_boost && (item as BoostItem).boost_stats) {
      const boostStats = (item as BoostItem).boost_stats as { [key: string]: number };
      return boostStats[tierName] || 0;
    }
    return 0;
  }, []);

  // Apply sorting if enabled
  const sortedItems = useMemo(() => {
    if (!filters.sortBy) return [...filteredItems];

    return [...filteredItems].sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rarity':
          comparison = a.rarity - b.rarity;
          break;
        case 'series':
          comparison = (a.series || 0) - (b.series || 0);
          break;
        case 'user_level':
          // For drivers and parts, sort by level
          if ('is_driver' in a && 'is_driver' in b && a.is_driver && b.is_driver) {
            comparison = (a as DriverView).level - (b as DriverView).level;
          } else if ('is_car_part' in a && 'is_car_part' in b && a.is_car_part && b.is_car_part) {
            comparison = (a as CarPartView).level - (b as CarPartView).level;
          }
          break;
        // Driver stat columns
        case 'overtaking':
        case 'blocking':
        case 'qualifying':
        case 'raceStart':
        case 'tyreUse':
          comparison = getStatValueForSort(a, filters.sortBy) - getStatValueForSort(b, filters.sortBy);
          break;
        // Car part stat columns
        case 'speed':
        case 'cornering':
        case 'powerUnit':
        case 'drs':
        case 'pitStopTime':
          comparison = getStatValueForSort(a, filters.sortBy) - getStatValueForSort(b, filters.sortBy);
          break;
        case 'total_value':
          // Calculate total value for drivers and parts
          if ('is_driver' in a && 'is_driver' in b && a.is_driver && b.is_driver) {
            // Driver total
            const aTotal = getStatValueForSort(a, 'overtaking') + getStatValueForSort(a, 'blocking') +
                          getStatValueForSort(a, 'qualifying') + getStatValueForSort(a, 'tyreUse') +
                          getStatValueForSort(a, 'raceStart');
            const bTotal = getStatValueForSort(b, 'overtaking') + getStatValueForSort(b, 'blocking') +
                          getStatValueForSort(b, 'qualifying') + getStatValueForSort(b, 'tyreUse') +
                          getStatValueForSort(b, 'raceStart');
            comparison = aTotal - bTotal;
          } else if ('is_car_part' in a && 'is_car_part' in b && a.is_car_part && b.is_car_part) {
            // Car part total (exclude pitStopTime)
            const aTotal = getStatValueForSort(a, 'speed') + getStatValueForSort(a, 'cornering') +
                          getStatValueForSort(a, 'powerUnit') + getStatValueForSort(a, 'qualifying') +
                          getStatValueForSort(a, 'drs');
            const bTotal = getStatValueForSort(b, 'speed') + getStatValueForSort(b, 'cornering') +
                          getStatValueForSort(b, 'powerUnit') + getStatValueForSort(b, 'qualifying') +
                          getStatValueForSort(b, 'drs');
            comparison = aTotal - bTotal;
          }
          break;
        // Boost tier columns
        case 'overtake_tier':
        case 'block_tier':
        case 'corners_tier':
        case 'tyre_use_tier':
        case 'power_unit_tier':
        case 'speed_tier':
        case 'pit_stop_time_tier':
        case 'race_start_tier':
          comparison = getBoostTierValueForSort(a, filters.sortBy) - getBoostTierValueForSort(b, filters.sortBy);
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredItems, filters.sortBy, filters.sortOrder, getStatValueForSort, getBoostTierValueForSort]);

  // Calculate column statistics for drivers and parts
  const columnStats = useMemo(() => {
    if ((gridType !== 'drivers' && gridType !== 'parts') || sortedItems.length === 0) return {};

    const stats: { [key: string]: { min: number; max: number; median: number } } = {};

    if (gridType === 'drivers') {
      // Drivers: calculate stats across all drivers
      const statColumns = ['overtaking', 'blocking', 'qualifying', 'raceStart', 'tyreUse', 'total_value'];

      statColumns.forEach(statName => {
        const values: number[] = [];

        sortedItems.forEach(item => {
          if ('is_driver' in item && item.is_driver) {
            const driver = item as DriverView;
            let userLevel = driver.level;

            if (userLevel === 0) {
              // Skip level 0 items (they have 0 values and shouldn't affect color coding)
              return;
            }

            let baseValue = 0;
            if (driver.stats_per_level && driver.stats_per_level.length > userLevel - 1) {
              const levelStats = driver.stats_per_level[userLevel - 1];
              if (statName === 'total_value') {
                baseValue = (levelStats.overtaking || 0) + (levelStats.blocking || 0) +
                           (levelStats.qualifying || 0) + (levelStats.tyreUse || 0) +
                           (levelStats.raceStart || 0);
              } else {
                baseValue = levelStats[statName] || 0;
              }
            }

            // Apply bonus if item has bonus checked and bonus percentage is set
            if (bonusCheckedItems.has(driver.id) && bonusPercentage > 0) {
              baseValue = Math.ceil(baseValue * (1 + bonusPercentage / 100));
            }

            values.push(baseValue);
          }
        });

        if (values.length > 0) {
          // Filter out any remaining 0 values before calculating statistics
          const nonZeroValues = values.filter(val => val > 0);

          if (nonZeroValues.length > 0) {
            const sortedValues = [...nonZeroValues].sort((a, b) => a - b);
            const min = sortedValues[0];
            const max = sortedValues[sortedValues.length - 1];
            const mid = Math.floor(sortedValues.length / 2);
            const median = sortedValues.length % 2 === 0
              ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
              : sortedValues[mid];
            stats[statName] = { min, max, median };
          }
        }
      });
    } else if (gridType === 'parts') {
      // Parts: calculate stats separately for each part type
      const partTypes = [0, 1, 2, 3, 4, 5]; // Brakes, Gearbox, Engine, Suspension, Front Wing, Rear Wing
      const statColumns = ['speed', 'cornering', 'powerUnit', 'qualifying', 'drs', 'pitStopTime', 'total_value'];

      partTypes.forEach(partType => {
        statColumns.forEach(statName => {
          const statKey = `${partType}_${statName}`;
          const values: number[] = [];

          sortedItems.forEach(item => {
            if ('is_car_part' in item && item.is_car_part && (item as CarPartView).car_part_type === partType) {
              const carPart = item as CarPartView;
              let userLevel = carPart.level;

              if (userLevel === 0) {
                // Skip level 0 items (they have 0 values and shouldn't affect color coding)
                return;
              }

              let baseValue = 0;
              if (carPart.stats_per_level && carPart.stats_per_level.length > userLevel - 1) {
                const levelStats = carPart.stats_per_level[userLevel - 1];
                if (statName === 'total_value') {
                  // Exclude pitStopTime from total value for parts
                  baseValue = (levelStats.speed || 0) + (levelStats.cornering || 0) +
                             (levelStats.powerUnit || 0) + (levelStats.qualifying || 0) +
                             (levelStats.drs || 0);
                } else {
                  baseValue = levelStats[statName] || 0;
                }
              }

              // Apply bonus if item has bonus checked and bonus percentage is set
              if (bonusCheckedItems.has(carPart.id) && bonusPercentage > 0) {
                if (statName === 'pitStopTime') {
                  // Pit stop time should decrease (lower is better)
                  baseValue = Math.round((baseValue * (1 - bonusPercentage / 100)) * 100) / 100;
                } else {
                  // All other stats should increase and round up
                  baseValue = Math.ceil(baseValue * (1 + bonusPercentage / 100));
                }
              }

              values.push(baseValue);
            }
          });

          if (values.length > 0) {
            // Filter out any remaining 0 values before calculating statistics
            const nonZeroValues = values.filter(val => val > 0);

            if (nonZeroValues.length > 0) {
              const sortedValues = [...nonZeroValues].sort((a, b) => a - b);
              const min = sortedValues[0];
              const max = sortedValues[sortedValues.length - 1];
              const mid = Math.floor(sortedValues.length / 2);
              const median = sortedValues.length % 2 === 0
                ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
                : sortedValues[mid];
              stats[statKey] = { min, max, median };
            }
          }
        });
      });
    }

    return stats;
  }, [sortedItems, gridType, bonusCheckedItems, bonusPercentage]);

  const handleCompare = (item: CatalogItem) => {
    if (onCompare) {
      const isAlreadyCompared = compareItems.some(compared => compared.id === item.id);
      if (isAlreadyCompared) {
        onCompare(compareItems.filter(compared => compared.id !== item.id));
      } else if (compareItems.length < 4) {
        onCompare([...compareItems, item]);
      }
    }
  };

  const isInComparison = (item: CatalogItem) => {
    return compareItems.some(compared => compared.id === item.id);
  };

  // Helper function to get rarity display name
  const getRarityDisplay = (rarity: number): string => {
    const rarityMap: Record<number, string> = {
      0: 'Basic',
      1: 'Common',
      2: 'Rare',
      3: 'Epic',
      4: 'Legendary',
      5: 'Special Edition'
    };
    return rarityMap[rarity] || 'Unknown';
  };

  // Helper function to get card type display name
  const getCardTypeDisplay = (cardType: number): string => {
    const typeMap: Record<number, string> = {
      0: 'Car Part',
      1: 'Driver'
    };
    return typeMap[cardType] || 'Unknown';
  };

  // Helper function to get car part type display name
  const getCarPartTypeDisplay = (carPartType: number | null): string => {
    if (carPartType === null) return 'N/A';
    const typeMap: Record<number, string> = {
      0: 'Gearbox',
      1: 'Brakes',
      2: 'Engine',
      3: 'Suspension',
      4: 'Front Wing',
      5: 'Rear Wing'
    };
    return typeMap[carPartType] || 'Unknown';
  };

  // Get rarity badge variant
  const getRarityBadgeVariant = (rarity: number) => {
    return rarity === 4 ? 'destructive' :
           rarity === 3 ? 'secondary' :
           rarity === 2 ? 'default' : 'outline';
  };

  // Get rarity background color for cells
  const getRarityBackground = (rarity: number): string => {
    return rarity === 0 ? "bg-gray-300" :
           rarity === 1 ? "bg-blue-200" :
           rarity === 2 ? "bg-orange-200" :
           rarity === 3 ? "bg-purple-300" :
           rarity === 4 ? "bg-yellow-300" :
           rarity === 5 ? "bg-red-300" : "bg-gray-300";
  };

  // Get boost value background color based on tier (1=blue, 2=green, 3=yellow, 4=orange, 5=red)
  const getBoostValueColor = (tierValue: number): string => {
    return tierValue === 1 ? "bg-blue-200" :
           tierValue === 2 ? "bg-green-200" :
           tierValue === 3 ? "bg-yellow-200" :
           tierValue === 4 ? "bg-orange-200" :
           tierValue === 5 ? "bg-red-300" : "bg-gray-50";
  };

  // Get columns based on grid type
  const getColumns = () => {
    const baseColumns = [
      { key: 'name', label: 'Name', sortable: true },
      // { key: 'rarity', label: 'Rarity', sortable: true },
      // { key: 'series', label: 'Series', sortable: true },
    ];

    if (gridType === 'drivers') {
      baseColumns.push(
        { key: 'rarity', label: 'Rarity', sortable: true },
        { key: 'user_level', label: 'Level', sortable: true },
        { key: 'bonus', label: 'Bonus', sortable: false }
      );
    } else if (gridType === 'parts') {
      baseColumns.push(
        { key: 'rarity', label: 'Rarity', sortable: true },
        { key: 'user_level', label: 'Level', sortable: true },
        { key: 'bonus', label: 'Bonus', sortable: false },
        { key: 'car_part_type', label: 'Part Type', sortable: false }
      );
    }

    // Removed boost_type column as requested

    // Add cards column for non-drivers if we have asset data
    if (assets.length > 0 && gridType !== 'drivers') {
      baseColumns.push({ key: 'card_count', label: 'Cards', sortable: false });
    }

      // TODO: wrong - stats are different for drivers and parts
      // Add 6 stats columns for drivers and parts
      if (gridType === 'drivers') {
      baseColumns.push(
        { key: 'overtaking', label: 'Overtaking', sortable: true },
        { key: 'blocking', label: 'Defending', sortable: true },
        { key: 'qualifying', label: 'Qualifying', sortable: true },
        { key: 'raceStart', label: 'Race Start', sortable: true },
        { key: 'tyreUse', label: 'Tyre Use', sortable: true },
        { key: 'total_value', label: 'Total Value', sortable: true }
      );
    }

    if (gridType === 'parts') {
      baseColumns.push(
        { key: 'speed', label: 'Speed', sortable: true },
        { key: 'cornering', label: 'Cornering', sortable: true },
        { key: 'powerUnit', label: 'Power Unit', sortable: true },
        { key: 'qualifying', label: 'Qualifying', sortable: true },
        { key: 'drs', label: 'DRS', sortable: true },
        { key: 'pitStopTime', label: 'Pit Stop', sortable: true },
        { key: 'total_value', label: 'Total Value', sortable: true }
      );
    }

    if (gridType === 'boosts') {
      // Add amount column right after name
      baseColumns.push({ key: 'card_count', label: 'Amount', sortable: true });

      // Add boost-specific columns - reordered and DRS removed
      baseColumns.push(
        { key: 'overtake_tier', label: 'Overtake', sortable: true },
        { key: 'block_tier', label: 'Defend', sortable: true },
        { key: 'corners_tier', label: 'Corners', sortable: true },
        { key: 'tyre_use_tier', label: 'Tyre Use', sortable: true },
        { key: 'power_unit_tier', label: 'Power Unit', sortable: true },
        { key: 'speed_tier', label: 'Speed', sortable: true },
        { key: 'pit_stop_time_tier', label: 'Pit Stop', sortable: true },
        { key: 'race_start_tier', label: 'Race Start', sortable: true },
        // Removed DRS tier column as requested
      );
    }

    if (gridType === 'parts' || gridType === 'drivers') {
      baseColumns.push({ key: 'series', label: 'Series', sortable: true });
    }

    // Todo: what is this for?
    // baseColumns.push({ key: 'actions', label: 'Actions', sortable: false });

    return baseColumns;
  };

  const columns = getColumns();

  return (
    <div className={cn('w-full', className)} style={{ marginTop: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>

        {showCompareButton && compareItems.length > 0 && (
          <Button
            variant="primary"
            onClick={() => onCompare?.(compareItems)}
            className="relative"
          >
            Compare ({compareItems.length})
            {compareItems.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare?.([]);
                }}
              >
                ×
              </Button>
            )}
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      {showFilters && (
        <div className="flex items-center space-x-4 mb-6">
          {showSearch && (
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          )}

          {/* Max Series filter - only for drivers and parts */}
          {(gridType === 'drivers' || gridType === 'parts') && (
            <div className="flex items-center space-x-2">
              <label htmlFor="maxSeries" className="text-sm font-medium text-gray-700">
                Max Series:
              </label>
              <select
                id="maxSeries"
                className="rounded-lg border-gray-300 text-sm px-3 py-2"
                value={filters.maxSeries}
                onChange={(e) => setFilters(prev => ({ ...prev, maxSeries: Number(e.target.value) }))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={12 - i} value={12 - i}>
                    {12 - i}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Data Grid Table */}
      <div className="overflow-auto bg-white rounded-lg border border-gray-200 w-fit max-h-[73vh]">
        <table className="table divide-y divide-gray-200">
          <thead className="bg-gray-700 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider',
                    column.sortable ? 'cursor-pointer hover:bg-gray-600' : ''
                  )}
                  onClick={() => {
                    if (column.sortable && column.key !== 'actions') {
                      setFilters(prev => ({
                        ...prev,
                        sortBy: column.key as FilterState['sortBy'],
                        sortOrder: prev.sortBy === column.key
                          ? prev.sortOrder === 'desc' ? 'asc' : 'desc'
                          : 'desc'
                      }));
                    }
                  }}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && filters.sortBy === column.key && (
                      <span className="ml-1">
                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedItems.map((item) => {
              const isAsset = 'is_asset' in item && item.is_asset;
              const isBoost = 'is_boost' in item && item.is_boost;
              const isDriver = 'is_driver' in item && item.is_driver;
              const isCarPart = 'is_car_part' in item && item.is_car_part;

              // Get the base item based on type
              const catalogItem = isAsset ? item as UserAssetView :
                                 isBoost ? item as Boost :
                                 isDriver ? item as DriverView :
                                 isCarPart ? item as CarPartView :
                                 item as CatalogItem;

              const isOwned = isAsset ? (item as UserAssetView).is_owned :
                               isDriver ? (item as DriverView).is_owned :
                               isCarPart ? (item as CarPartView).is_owned : false;

              // Get stats for drivers/parts
              const getStatValue = (statName: string): number => {
                let userLevel = 0;
                if (isAsset) {
                  userLevel = (catalogItem as UserAssetView).level;
                } else if (isDriver) {
                  userLevel = (catalogItem as DriverView).level;
                } else if (isCarPart) {
                  userLevel = (catalogItem as CarPartView).level;
                }

                // Level 0 should show all 0 stats
                if (userLevel === 0) {
                  return 0;
                }

                // If showHighestLevel is enabled, use the highest possible level instead of current level
                if (showHighestLevel && (isDriver || isCarPart)) {
                  const cardCount = isDriver ? (catalogItem as DriverView).card_count : (catalogItem as CarPartView).card_count;
                  const highestLevel = calculateHighestLevel(userLevel, cardCount || 0, catalogItem.rarity);
                  userLevel = highestLevel;
                }

                let stats: Array<{ [key: string]: number }> | null = null;
                if (isAsset && (catalogItem as UserAssetView).stats_per_level && Array.isArray((catalogItem as UserAssetView).stats_per_level)) {
                  stats = (catalogItem as UserAssetView).stats_per_level;
                } else if (isDriver && (catalogItem as DriverView).stats_per_level && Array.isArray((catalogItem as DriverView).stats_per_level)) {
                  stats = (catalogItem as DriverView).stats_per_level;
                } else if (isCarPart && (catalogItem as CarPartView).stats_per_level && Array.isArray((catalogItem as CarPartView).stats_per_level)) {
                  stats = (catalogItem as CarPartView).stats_per_level;
                }

                let baseValue = 0;
                if (stats && stats.length > userLevel - 1 && stats[userLevel - 1][statName] !== undefined) {
                  baseValue = stats[userLevel - 1][statName];
                }

                // Apply bonus if item has bonus checked and bonus percentage is set
                if (bonusCheckedItems.has(catalogItem.id) && bonusPercentage > 0) {
                  if (statName === 'pitStopTime') {
                    // Pit stop time should decrease (lower is better)
                    baseValue = Math.round((baseValue * (1 - bonusPercentage / 100)) * 100) / 100;
                  } else {
                    // All other stats should increase and round up
                    baseValue = Math.ceil(baseValue * (1 + bonusPercentage / 100));
                  }
                }

                return baseValue;
              };

              // Get boost tier values from boost_stats
              const getBoostTierValue = (tierName: string): number => {
                if (isBoost && (catalogItem as BoostItem).boost_stats) {
                  const boostStats = (catalogItem as BoostItem).boost_stats as { [key: string]: number };
                  return boostStats[tierName] || 0;
                }
                return 0;
              };

              return (
                <tr
                  key={catalogItem.id}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    isInComparison(catalogItem as CatalogItem) && 'bg-blue-50'
                  )}
                >
                  {/* Name Column with rarity background (except for boosts) */}
                  <td className={cn("px-3 py-1 whitespace-nowrap", gridType !== 'boosts' && getRarityBackground(catalogItem.rarity))}>
                    {gridType === 'boosts' ? (
                      <BoostNameEditor
                        boostId={catalogItem.id}
                        currentName={catalogItem.name}
                        customName={(catalogItem as BoostItem).custom_name}
                        onNameChange={(newName) => {
                          // Update the boost's custom_name in the local state
                          if (isBoost) {
                            const boostItem = item as BoostItem;
                            boostItem.custom_name = newName;
                            // Trigger refetch to update the UI
                            onBoostNameChange?.();
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {catalogItem.name}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Amount Column for Boosts */}
                  {gridType === 'boosts' && (
                    <td className="px-3 py-1 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {(catalogItem as BoostItem).card_count || 0}
                      </div>
                    </td>
                  )}

                  {/* Rarity Column with background color */}
                  {gridType !== 'boosts' && (
                  <td className={cn("px-3 py-1 whitespace-nowrap", getRarityBackground(catalogItem.rarity))}>
                    <div className="text-sm font-medium text-gray-900">
                      {getRarityDisplay(catalogItem.rarity)}
                    </div>
                  </td>
                  )}

                  {/* User Level Column for Drivers and Parts */}
                  {(gridType === 'drivers' || gridType === 'parts') && (
                    <td className="px-3 py-1 whitespace-nowrap text-center">
                      <div className={`text-sm text-gray-900 ${showHighestLevel && (isDriver || isCarPart) && calculateHighestLevel(isDriver ? (item as DriverView).level : (item as CarPartView).level, isDriver ? (item as DriverView).card_count || 0 : (item as CarPartView).card_count || 0, catalogItem.rarity) > (isDriver ? (item as DriverView).level : (item as CarPartView).level) ? 'text-red-600' : ''}`}>
                        {showHighestLevel && (isDriver || isCarPart) ?
                          calculateHighestLevel(
                            isDriver ? (item as DriverView).level : (item as CarPartView).level,
                            isDriver ? (item as DriverView).card_count || 0 : (item as CarPartView).card_count || 0,
                            catalogItem.rarity
                          ) :
                          (isDriver ? (item as DriverView).level :
                           isCarPart ? (item as CarPartView).level : 0)}
                      </div>
                    </td>
                  )}

                  {/* Bonus Column for Drivers and Parts - always show when we have user data */}
                  {(gridType === 'drivers' || gridType === 'parts') && (
                    <td className="px-3 py-1 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={bonusCheckedItems.has(catalogItem.id)}
                        onChange={() => onBonusToggle?.(catalogItem.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </td>
                  )}

                  {/* Part Type Column for Parts */}
                  {gridType === 'parts' && (
                    <td className="px-3 py-1 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {getCarPartTypeDisplay((catalogItem as CarPartView).car_part_type)}
                      </div>
                    </td>
                  )}

                  {/* Cards Column (for non-drivers if asset data available) */}
                  {assets.length > 0 && gridType !== 'drivers' && (
                    <td className="px-3 py-1 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {isAsset ? (item as UserAssetView).card_count : 'N/A'}
                      </div>
                    </td>
                  )}

                  {/* Stats Columns for Drivers */}
                  {gridType === 'drivers' && (
                    <>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats['overtaking'] && getStatBackgroundColor(getStatValue('overtaking'), columnStats['overtaking'].min, columnStats['overtaking'].max, columnStats['overtaking'].median))}>
                        <div className="text-sm text-gray-900">{getStatValue('overtaking')}</div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats['blocking'] && getStatBackgroundColor(getStatValue('blocking'), columnStats['blocking'].min, columnStats['blocking'].max, columnStats['blocking'].median))}>
                        <div className="text-sm text-gray-900">{getStatValue('blocking')}</div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats['qualifying'] && getStatBackgroundColor(getStatValue('qualifying'), columnStats['qualifying'].min, columnStats['qualifying'].max, columnStats['qualifying'].median))}>
                        <div className="text-sm text-gray-900">{getStatValue('qualifying')}</div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats['raceStart'] && getStatBackgroundColor(getStatValue('raceStart'), columnStats['raceStart'].min, columnStats['raceStart'].max, columnStats['raceStart'].median))}>
                        <div className="text-sm text-gray-900">{getStatValue('raceStart')}</div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats['tyreUse'] && getStatBackgroundColor(getStatValue('tyreUse'), columnStats['tyreUse'].min, columnStats['tyreUse'].max, columnStats['tyreUse'].median))}>
                        <div className="text-sm text-gray-900">{getStatValue('tyreUse')}</div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats['total_value'] && getStatBackgroundColor(getStatValue('overtaking') + getStatValue('blocking') + getStatValue('qualifying') + getStatValue('tyreUse') + getStatValue('raceStart'), columnStats['total_value'].min, columnStats['total_value'].max, columnStats['total_value'].median))}>
                        <div className="text-sm font-medium text-gray-900">
                          {getStatValue('overtaking') + getStatValue('blocking') + getStatValue('qualifying') + getStatValue('tyreUse') + getStatValue('raceStart')}
                        </div>
                      </td>
                      <td className="px-3 py-1 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{catalogItem.series}</div>
                      </td>
                    </>
                  )}

                  {/* Stats Columns for Parts */}
                  {gridType === 'parts' && (
                    <>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${(catalogItem as CarPartView).car_part_type}_speed`] && getStatBackgroundColor(getStatValue('speed'), columnStats[`${(catalogItem as CarPartView).car_part_type}_speed`].min, columnStats[`${(catalogItem as CarPartView).car_part_type}_speed`].max, columnStats[`${(catalogItem as CarPartView).car_part_type}_speed`].median))}>
                        <div className="text-sm text-gray-900">{getStatValue('speed')}</div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${(catalogItem as CarPartView).car_part_type}_cornering`] && getStatBackgroundColor(getStatValue('cornering'), columnStats[`${(catalogItem as CarPartView).car_part_type}_cornering`].min, columnStats[`${(catalogItem as CarPartView).car_part_type}_cornering`].max, columnStats[`${(catalogItem as CarPartView).car_part_type}_cornering`].median))}>
                        <div className="text-sm text-gray-900">{getStatValue('cornering')}</div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${(catalogItem as CarPartView).car_part_type}_powerUnit`] && getStatBackgroundColor(getStatValue('powerUnit'), columnStats[`${(catalogItem as CarPartView).car_part_type}_powerUnit`].min, columnStats[`${(catalogItem as CarPartView).car_part_type}_powerUnit`].max, columnStats[`${(catalogItem as CarPartView).car_part_type}_powerUnit`].median))}>
                        <div className="text-sm text-gray-900">{getStatValue('powerUnit')}</div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${(catalogItem as CarPartView).car_part_type}_qualifying`] && getStatBackgroundColor(getStatValue('qualifying'), columnStats[`${(catalogItem as CarPartView).car_part_type}_qualifying`].min, columnStats[`${(catalogItem as CarPartView).car_part_type}_qualifying`].max, columnStats[`${(catalogItem as CarPartView).car_part_type}_qualifying`].median))}>
                        <div className="text-sm text-gray-900">{getStatValue('qualifying')}</div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${(catalogItem as CarPartView).car_part_type}_drs`] && getStatBackgroundColor(getStatValue('drs'), columnStats[`${(catalogItem as CarPartView).car_part_type}_drs`].min, columnStats[`${(catalogItem as CarPartView).car_part_type}_drs`].max, columnStats[`${(catalogItem as CarPartView).car_part_type}_drs`].median))}>
                        <div className="text-sm text-gray-900">{getStatValue('drs')}</div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${(catalogItem as CarPartView).car_part_type}_pitStopTime`] && getStatBackgroundColor(getStatValue('pitStopTime'), columnStats[`${(catalogItem as CarPartView).car_part_type}_pitStopTime`].min, columnStats[`${(catalogItem as CarPartView).car_part_type}_pitStopTime`].max, columnStats[`${(catalogItem as CarPartView).car_part_type}_pitStopTime`].median))}>
                        <div className="text-sm text-gray-900">{getStatValue('pitStopTime')}</div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${(catalogItem as CarPartView).car_part_type}_total_value`] && getStatBackgroundColor(getStatValue('speed') + getStatValue('cornering') + getStatValue('powerUnit') + getStatValue('qualifying') + getStatValue('drs'), columnStats[`${(catalogItem as CarPartView).car_part_type}_total_value`].min, columnStats[`${(catalogItem as CarPartView).car_part_type}_total_value`].max, columnStats[`${(catalogItem as CarPartView).car_part_type}_total_value`].median))}>
                        <div className="text-sm font-medium text-gray-900">
                          {getStatValue('speed') + getStatValue('cornering') + getStatValue('powerUnit') + getStatValue('qualifying') + getStatValue('drs')}
                        </div>
                      </td>
                      <td className="px-3 py-1 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{catalogItem.series}</div>
                      </td>
                    </>
                  )}

                  {/* Boost Tier Columns */}
                  {gridType === 'boosts' && (
                    <>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", getBoostTierValue('overtake_tier') > 0 && getBoostValueColor(getBoostTierValue('overtake_tier')))}>
                        <div className="text-sm font-medium">
                          {getBoostTierValue('overtake_tier') * 5 || ''}
                        </div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", getBoostTierValue('block_tier') > 0 && getBoostValueColor(getBoostTierValue('block_tier')))}>
                        <div className="text-sm font-medium">
                          {getBoostTierValue('block_tier') * 5 || ''}
                        </div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", getBoostTierValue('corners_tier') > 0 && getBoostValueColor(getBoostTierValue('corners_tier')))}>
                        <div className="text-sm font-medium">
                          {getBoostTierValue('corners_tier') * 5 || ''}
                        </div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", getBoostTierValue('tyre_use_tier') > 0 && getBoostValueColor(getBoostTierValue('tyre_use_tier')))}>
                        <div className="text-sm font-medium">
                          {getBoostTierValue('tyre_use_tier') * 5 || ''}
                        </div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", getBoostTierValue('power_unit_tier') > 0 && getBoostValueColor(getBoostTierValue('power_unit_tier')))}>
                        <div className="text-sm font-medium">
                          {getBoostTierValue('power_unit_tier') * 5 || ''}
                        </div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", getBoostTierValue('speed_tier') > 0 && getBoostValueColor(getBoostTierValue('speed_tier')))}>
                        <div className="text-sm font-medium">
                          {getBoostTierValue('speed_tier') * 5 || ''}
                        </div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", getBoostTierValue('pit_stop_time_tier') > 0 && getBoostValueColor(getBoostTierValue('pit_stop_time_tier')))}>
                        <div className="text-sm font-medium">
                          {getBoostTierValue('pit_stop_time_tier') * 5 || ''}
                        </div>
                      </td>
                      <td className={cn("px-3 py-1 whitespace-nowrap text-center", getBoostTierValue('race_start_tier') > 0 && getBoostValueColor(getBoostTierValue('race_start_tier')))}>
                        <div className="text-sm font-medium">
                          {getBoostTierValue('race_start_tier') * 5 || ''}
                        </div>
                      </td>
                    </>
                  )}

                  {/* Actions Column - only show if there are actions available */}
                  {(onCompare || onAddToCollection || onRemoveFromCollection) && (
                    <td className="px-3 py-1 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {onCompare && (
                          <Button
                            variant={isInComparison(catalogItem as CatalogItem) ? 'primary' : 'outline'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompare(catalogItem as CatalogItem);
                            }}
                          >
                            {isInComparison(catalogItem as CatalogItem) ? 'Remove' : 'Compare'}
                          </Button>
                        )}

                        {isOwned && onRemoveFromCollection ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromCollection(catalogItem as CatalogItem);
                            }}
                          >
                            Remove
                          </Button>
                        ) : !isOwned && onAddToCollection ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCollection(catalogItem as CatalogItem);
                            }}
                          >
                            Add
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {sortedItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No items found</div>
            <div className="text-gray-400 text-sm">
              Try adjusting your search or filter criteria
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
