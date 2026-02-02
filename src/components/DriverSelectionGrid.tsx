import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DriverView } from '@/types/database';
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

// Helper function to capitalize stat names
const capitalizeStat = (stat: string): string => {
  // Handle camelCase stats (overtaking -> Overtaking, raceStart -> Race Start)
  return stat
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim() // Remove leading/trailing whitespace
};

// Helper function to format driver name for display (Last, First)
const formatDriverNameForDisplay = (name: string): string => {
  const nameParts = name.split(' ')
  if (nameParts.length >= 2) {
    const lastName = nameParts[nameParts.length - 1]
    const firstName = nameParts.slice(0, -1).join(' ')
    return `${lastName}, ${firstName}`
  }
  return name
};

// Helper function to get rarity display name
const getRarityDisplay = (rarity: number): string => {
  const rarityMap: Record<number, string> = {
    0: 'Basic',
    1: 'Common',
    2: 'Rare',
    3: 'Epic',
    4: 'Legendary',
    5: 'SE Standard',
    6: 'SE Turbo'
  }
  return rarityMap[rarity] || 'Unknown'
};

// Get rarity background color for cells
const getRarityBackground = (rarity: number): string => {
  return rarity === 0 ? "bg-gray-300" :
         rarity === 1 ? "bg-blue-200" :
         rarity === 2 ? "bg-orange-300" :
         rarity === 3 ? "bg-purple-300" :
         rarity === 4 ? "bg-yellow-300" :
         rarity === 5 ? "bg-red-300" :
         rarity === 6 ? "bg-rose-400" : "bg-gray-300";
};

interface DriverSelectionGridProps {
  drivers: DriverView[];
  selectedDriverIds: string[];
  onDriverSelectionChange: (selectedDriverIds: string[]) => void;
  trackStat?: string;
  maxSeries?: number;
  initialShowHighestLevel?: boolean;
  maxSelectable?: number;
  singleSelect?: boolean; // New prop for single select mode
  driver1Id?: string; // ID of driver selected in driver 1 slot
  driver2Id?: string; // ID of driver selected in driver 2 slot
}

export function DriverSelectionGrid({
  drivers = [],
  selectedDriverIds = [],
  onDriverSelectionChange,
  trackStat = 'overtaking',
  maxSeries = 12,
  initialShowHighestLevel = false,
  maxSelectable = 4,
  singleSelect = false,
  driver1Id,
  driver2Id,
}: DriverSelectionGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>(trackStat);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showHighestLevel, setShowHighestLevel] = useState(initialShowHighestLevel);
  const [localMaxSeries, setLocalMaxSeries] = useState(maxSeries);

  // Map track stat names to internal stat names
  const getInternalStatName = (statName: string): string => {
    // Handle different naming conventions
    const statMap: Record<string, string> = {
      'defending': 'blocking',
      'defend': 'blocking',
      'defense': 'blocking',
      'race start': 'raceStart',
      'racestart': 'raceStart',
      'tyre use': 'tyreUse',
      'tyreuse': 'tyreUse',
      'pit stop': 'pitStopTime'
    };
    return statMap[statName.toLowerCase()] || statName;
  };

  // Use the mapped stat name for sorting
  const effectiveSortBy = getInternalStatName(sortBy);

  // Debug: Log the initial sort settings
  useEffect(() => {
    console.log('DriverSelectionGrid: trackStat=', trackStat, 'sortBy=', sortBy, 'effectiveSortBy=', effectiveSortBy, 'sortOrder=', sortOrder);
  }, [trackStat, sortBy, effectiveSortBy, sortOrder]);

  // Filter and search logic
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      const matchesSearch = !searchTerm ||
        driver.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMaxSeries = driver.series <= localMaxSeries;

      return matchesSearch && matchesMaxSeries;
    });
  }, [drivers, searchTerm, localMaxSeries]);

  // Calculate column statistics for drivers
  const columnStats = useMemo(() => {
    if (filteredDrivers.length === 0) return {};

    const stats: { [key: string]: { min: number; max: number; median: number } } = {};

    // Drivers: calculate stats across all drivers
    const statColumns = ['overtaking', 'blocking', 'qualifying', 'raceStart', 'tyreUse', 'total_value'];

    statColumns.forEach(statName => {
      const values: number[] = [];

      filteredDrivers.forEach(driver => {
        let userLevel = driver.level;

        if (userLevel === 0) {
          // Skip level 0 items (they have 0 values and shouldn't affect color coding)
          return;
        }

        // If showHighestLevel is enabled, use the highest possible level instead of current level
        if (showHighestLevel) {
          const highestLevel = calculateHighestLevel(userLevel, driver.card_count || 0, driver.rarity);
          userLevel = highestLevel;
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

        values.push(baseValue);
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

    return stats;
  }, [filteredDrivers, showHighestLevel]);

  // Apply sorting
  const sortedDrivers = useMemo(() => {
    if (!effectiveSortBy) return [...filteredDrivers];

    return [...filteredDrivers].sort((a, b) => {
      let comparison = 0;

      switch (effectiveSortBy) {
        case 'name':
          comparison = formatDriverNameForDisplay(a.name).localeCompare(formatDriverNameForDisplay(b.name));
          break;
        case 'rarity':
          comparison = a.rarity - b.rarity;
          break;
        case 'series':
          comparison = a.series - b.series;
          break;
        case 'level':
          comparison = a.level - b.level;
          break;
        case 'overtaking':
        case 'blocking':
        case 'qualifying':
        case 'raceStart':
        case 'tyreUse':
          // Get stat value for sorting
          const getStatValue = (driver: DriverView, statName: string): number => {
            let userLevel = driver.level;

            if (userLevel === 0) {
              return 0;
            }

            // If showHighestLevel is enabled, use the highest possible level instead of current level
            if (showHighestLevel) {
              const highestLevel = calculateHighestLevel(userLevel, driver.card_count || 0, driver.rarity);
              userLevel = highestLevel;
            }

            let baseValue = 0;
            if (driver.stats_per_level && driver.stats_per_level.length > userLevel - 1) {
              baseValue = driver.stats_per_level[userLevel - 1][statName] || 0;
            }

            return baseValue;
          };

          comparison = getStatValue(a, effectiveSortBy) - getStatValue(b, effectiveSortBy);
          break;
        case 'total_value':
          // Calculate total value for drivers
          const getTotalValue = (driver: DriverView): number => {
            let userLevel = driver.level;

            if (userLevel === 0) {
              return 0;
            }

            // If showHighestLevel is enabled, use the highest possible level instead of current level
            if (showHighestLevel) {
              const highestLevel = calculateHighestLevel(userLevel, driver.card_count || 0, driver.rarity);
              userLevel = highestLevel;
            }

            let total = 0;
            if (driver.stats_per_level && driver.stats_per_level.length > userLevel - 1) {
              const levelStats = driver.stats_per_level[userLevel - 1];
              total = (levelStats.overtaking || 0) + (levelStats.blocking || 0) +
                     (levelStats.qualifying || 0) + (levelStats.tyreUse || 0) +
                     (levelStats.raceStart || 0);
            }

            return total;
          };

          comparison = getTotalValue(a) - getTotalValue(b);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredDrivers, sortBy, sortOrder, showHighestLevel]);

  // Handle driver selection toggle
  const handleDriverToggle = (driverId: string) => {
    if (singleSelect) {
      // Single select mode: if clicking the same driver, toggle it off
      // If clicking a different driver, select it and clear other selections
      if (selectedDriverIds.includes(driverId)) {
        // Remove from selection (toggle off)
        onDriverSelectionChange([]);
      } else {
        // Select this driver and clear others
        onDriverSelectionChange([driverId]);
      }
    } else {
      // Multi-select mode: existing logic
      const newSelected = [...selectedDriverIds];

      if (newSelected.includes(driverId)) {
        // Remove from selection
        const index = newSelected.indexOf(driverId);
        newSelected.splice(index, 1);
      } else if (newSelected.length < maxSelectable) {
        // Add to selection
        newSelected.push(driverId);
      } else {
        // Max selection reached
        return;
      }

      onDriverSelectionChange(newSelected);
    }
  };

  // Get columns for the grid
  const columns = useMemo(() => {
    return [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'rarity', label: 'Rarity', sortable: true },
      { key: 'level', label: 'Level', sortable: true },
      { key: 'series', label: 'Series', sortable: true },
      { key: 'overtaking', label: 'Overtaking', sortable: true },
      { key: 'blocking', label: 'Defending', sortable: true },
      { key: 'qualifying', label: 'Qualifying', sortable: true },
      { key: 'raceStart', label: 'Race Start', sortable: true },
      { key: 'tyreUse', label: 'Tyre Use', sortable: true },
      { key: 'total_value', label: 'Total Value', sortable: true },
    ];
  }, []);

  // Get stat value for display
  const getStatValue = useCallback((driver: DriverView, statName: string): number => {
    let userLevel = driver.level;

    if (userLevel === 0) {
      return 0;
    }

    // If showHighestLevel is enabled, use the highest possible level instead of current level
    if (showHighestLevel) {
      const highestLevel = calculateHighestLevel(userLevel, driver.card_count || 0, driver.rarity);
      userLevel = highestLevel;
    }

    let baseValue = 0;
    if (driver.stats_per_level && driver.stats_per_level.length > userLevel - 1) {
      baseValue = driver.stats_per_level[userLevel - 1][statName] || 0;
    }

    return baseValue;
  }, [showHighestLevel]);

  // Get driver name with prefix if selected in other slot
  const getDriverNameWithPrefix = (driver: DriverView): string => {
    let name = formatDriverNameForDisplay(driver.name);
    
    // Add prefix if driver is selected in other slot (only in single select mode)
    if (singleSelect) {
      if (driver.id === driver1Id) {
        name = `(1) ${name}`;
      } else if (driver.id === driver2Id) {
        name = `(2) ${name}`;
      }
    }
    
    return name;
  };

  return (
    <div className="w-full">
      {/* Filters and Search */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="maxSeries" className="text-sm font-medium text-gray-700">
            Max Series:
          </label>
          <select
            id="maxSeries"
            className="rounded-lg border-gray-300 text-sm px-3 py-2"
            value={localMaxSeries}
            onChange={(e) => setLocalMaxSeries(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={12 - i} value={12 - i}>
                {12 - i}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="highestLevelToggle" className="text-sm font-medium text-gray-700">
            Highest Level:
          </label>
          <input
            id="highestLevelToggle"
            type="checkbox"
            checked={showHighestLevel}
            onChange={(e) => setShowHighestLevel(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>
      </div>

      {/* Data Grid Table */}
      <div className="overflow-auto bg-white rounded-lg border border-gray-200 w-fit max-h-[50vh]">
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
                    if (column.sortable) {
                      setSortBy(column.key);
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    }
                  }}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && sortBy === column.key && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedDrivers.map((driver) => {
              const isSelected = selectedDriverIds.includes(driver.id);

              return (
                <tr
                  key={driver.id}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    isSelected && 'bg-blue-50'
                  )}
                  onClick={() => handleDriverToggle(driver.id)}
                >
                  {/* Name Column with rarity background */}
                  <td className={cn("px-3 py-1 whitespace-nowrap", getRarityBackground(driver.rarity))}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleDriverToggle(driver.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-2"
                      />
                      <div className="text-sm font-medium text-gray-900">
                        {getDriverNameWithPrefix(driver)}
                      </div>
                    </div>
                  </td>

                  {/* Rarity Column with background color */}
                  <td className={cn("px-3 py-1 whitespace-nowrap", getRarityBackground(driver.rarity))}>
                    <div className="text-sm font-medium text-gray-900">
                      {getRarityDisplay(driver.rarity)}
                    </div>
                  </td>

                  {/* Level Column */}
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <div className={`text-sm text-gray-900 ${showHighestLevel && calculateHighestLevel(driver.level, driver.card_count || 0, driver.rarity) > driver.level ? 'text-red-600' : ''}`}>
                      {showHighestLevel ?
                        calculateHighestLevel(driver.level, driver.card_count || 0, driver.rarity) :
                        driver.level}
                    </div>
                  </td>

                  {/* Series Column */}
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">{driver.series}</div>
                  </td>

                  {/* Stats Columns */}
                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats['overtaking'] && getStatBackgroundColor(getStatValue(driver, 'overtaking'), columnStats['overtaking'].min, columnStats['overtaking'].max, columnStats['overtaking'].median))}>
                    <div className="text-sm text-gray-900">{getStatValue(driver, 'overtaking')}</div>
                  </td>
                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats['blocking'] && getStatBackgroundColor(getStatValue(driver, 'blocking'), columnStats['blocking'].min, columnStats['blocking'].max, columnStats['blocking'].median))}>
                    <div className="text-sm text-gray-900">{getStatValue(driver, 'blocking')}</div>
                  </td>
                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats['qualifying'] && getStatBackgroundColor(getStatValue(driver, 'qualifying'), columnStats['qualifying'].min, columnStats['qualifying'].max, columnStats['qualifying'].median))}>
                    <div className="text-sm text-gray-900">{getStatValue(driver, 'qualifying')}</div>
                  </td>
                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats['raceStart'] && getStatBackgroundColor(getStatValue(driver, 'raceStart'), columnStats['raceStart'].min, columnStats['raceStart'].max, columnStats['raceStart'].median))}>
                    <div className="text-sm text-gray-900">{getStatValue(driver, 'raceStart')}</div>
                  </td>
                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats['tyreUse'] && getStatBackgroundColor(getStatValue(driver, 'tyreUse'), columnStats['tyreUse'].min, columnStats['tyreUse'].max, columnStats['tyreUse'].median))}>
                    <div className="text-sm text-gray-900">{getStatValue(driver, 'tyreUse')}</div>
                  </td>
                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats['total_value'] && getStatBackgroundColor(getStatValue(driver, 'overtaking') + getStatValue(driver, 'blocking') + getStatValue(driver, 'qualifying') + getStatValue(driver, 'tyreUse') + getStatValue(driver, 'raceStart'), columnStats['total_value'].min, columnStats['total_value'].max, columnStats['total_value'].median))}>
                    <div className="text-sm font-medium text-gray-900">
                      {getStatValue(driver, 'overtaking') + getStatValue(driver, 'blocking') + getStatValue(driver, 'qualifying') + getStatValue(driver, 'tyreUse') + getStatValue(driver, 'raceStart')}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {sortedDrivers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No drivers found</div>
            <div className="text-gray-400 text-sm">
              Try adjusting your search or filter criteria
            </div>
          </div>
        )}
      </div>
    </div>
  );
}