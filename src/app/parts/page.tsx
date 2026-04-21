'use client'

import { useState, useMemo, useEffect } from 'react'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCarParts, useUserCarParts } from '@/hooks/useApi'
import { useSeason } from '@/contexts/SeasonContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/components/auth/AuthContext'
import Link from 'next/link'
import { CarPartView } from '@/types/database'
import { cn, calculateHighestLevel, getRarityDisplay, getCollectionRarityDisplay, getRarityBackground } from '@/lib/utils'

// Helper function to get stat background color based on value position in range
const getStatBackgroundColor = (value: number, min: number, max: number, median: number, isPitStopTime: boolean = false): string => {
  // Special handling for Pit Stop Time: lower values are better
  if (isPitStopTime) {
    // For Pit Stop Time: 0 is always red (invalid), lower non-zero values are green (better)
    if (value === 0) return 'bg-red-400';
    if (value === min) return 'bg-green-400';
    if (value === median) return 'bg-white';
    if (value === max) return 'bg-red-400';

    if (value < median) {
      // For Pit Stop Time: values below median are better (green gradient)
      const ratio = (value - min) / (median - min);
      if (ratio < 0.25) return 'bg-green-400';
      if (ratio < 0.5) return 'bg-green-300';
      if (ratio < 0.75) return 'bg-green-200';
      return 'bg-green-100';
    } else {
      // For Pit Stop Time: values above median are worse (red gradient)
      const ratio = (value - median) / (max - median);
      if (ratio < 0.25) return 'bg-red-100';
      if (ratio < 0.5) return 'bg-red-200';
      if (ratio < 0.75) return 'bg-red-300';
      return 'bg-red-400';
    }
  }

  // Normal logic for all other stats: higher values are better
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

function AuthenticatedPartsPage() {
  const { activeSeasonId, activeSeason } = useSeason()
  const isFY26 = (activeSeason?.season_number ?? 0) >= 7
  const { data: carPartsResponse, isLoading: carPartsLoading, error: carPartsError } = useCarParts({
    page: 1,
    limit: 100,
    ...(activeSeasonId ? { season_id: activeSeasonId } : {}),
  })
  const { data: userCarPartsResponse, isLoading: userCarPartsLoading, error: userCarPartsError } = useUserCarParts({
    page: 1,
    limit: 100,
    ...(activeSeasonId ? { season_id: activeSeasonId } : {}),
  })

  const isLoading = carPartsLoading || userCarPartsLoading
  const error = carPartsError || userCarPartsError

  // Merge catalog car parts with user ownership data
  const mergedCarParts: CarPartView[] = (carPartsResponse?.data || []).map((carPart: any) => {
    // Find user's ownership data for this car part
    const userData = (userCarPartsResponse?.data || []).find((userCarPart: any) => userCarPart.id === carPart.id);

    return {
      ...carPart,
      level: userData?.level || 0,
      card_count: userData?.card_count || 0,
      is_owned: !!userData
    };
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [maxSeries, setMaxSeries] = useState(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem('parts-max-series')
      return stored ? parseInt(stored, 10) : 12
    } catch (error) {
      console.warn('Failed to load max series from localStorage:', error)
      return 12
    }
  })
  const [bonusPercentage, setBonusPercentage] = useState('')
  const [bonusCheckedItems, setBonusCheckedItems] = useState<Set<string>>(() => {
    // Initialize from localStorage
    try {
      const storedCheckedItems = localStorage.getItem('parts-bonus-checked-items')
      if (storedCheckedItems) {
        const parsedItems = JSON.parse(storedCheckedItems)
        return new Set(parsedItems)
      }
    } catch (error) {
      console.warn('Failed to load bonus checked items from localStorage:', error)
    }
    return new Set()
  })

  const [showHighestLevel, setShowHighestLevel] = useState(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem('parts-show-highest-level')
      return stored ? JSON.parse(stored) : false
    } catch (error) {
      console.warn('Failed to load show highest level from localStorage:', error)
      return false
    }
  })

  // State for theoretical parts comparison - stores up to 3 theoretical parts per part type
  // Key format: `${partType}_${index}` where index is 0, 1, or 2
  const [theoreticalParts, setTheoreticalParts] = useState<Record<string, { partId: string; level: number }>>(() => {
    try {
      const stored = localStorage.getItem('parts-theoretical-parts')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn('Failed to load theoretical parts from localStorage:', error)
      return {}
    }
  })

  // Update theoretical part selection
  const setTheoreticalPart = (partType: number, index: number, partId: string | null, level: number | null) => {
    const key = `${partType}_${index}`
    setTheoreticalParts(prev => {
      const updated = { ...prev }
      if (partId === null || level === null) {
        delete updated[key]
      } else {
        updated[key] = { partId, level }
      }
      return updated
    })
  }

  // Load bonus settings from localStorage on mount
  useEffect(() => {
    try {
      const storedBonusPercentage = localStorage.getItem('parts-bonus-percentage')
      const storedCheckedItems = localStorage.getItem('parts-bonus-checked-items')

      if (storedBonusPercentage) {
        setBonusPercentage(storedBonusPercentage)
      }

      if (storedCheckedItems) {
        setBonusCheckedItems(new Set(JSON.parse(storedCheckedItems)))
      }
    } catch (error) {
      console.warn('Failed to load bonus settings from localStorage:', error)
    }
  }, [])

  // Save bonus settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('parts-bonus-percentage', bonusPercentage)
    } catch (error) {
      console.warn('Failed to save bonus percentage to localStorage:', error)
    }
  }, [bonusPercentage])

  useEffect(() => {
    try {
      localStorage.setItem('parts-bonus-checked-items', JSON.stringify(Array.from(bonusCheckedItems)))
    } catch (error) {
      console.warn('Failed to save bonus checked items to localStorage:', error)
    }
  }, [bonusCheckedItems])

  useEffect(() => {
    try {
      localStorage.setItem('parts-show-highest-level', JSON.stringify(showHighestLevel))
    } catch (error) {
      console.warn('Failed to save show highest level to localStorage:', error)
    }
  }, [showHighestLevel])

  useEffect(() => {
    try {
      localStorage.setItem('parts-max-series', maxSeries.toString())
    } catch (error) {
      console.warn('Failed to save max series to localStorage:', error)
    }
  }, [maxSeries])

  // Save theoretical parts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('parts-theoretical-parts', JSON.stringify(theoreticalParts))
    } catch (error) {
      console.warn('Failed to save theoretical parts to localStorage:', error)
    }
  }, [theoreticalParts])

  // Handle bonus checkbox changes
  const handleBonusToggle = (itemId: string) => {
    setBonusCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Helper function for part type names
  const getPartTypeName = (type: number | null): string => {
    if (type === null) return 'Unknown';
    const typeMap: Record<number, string> = {
      0: 'Gearbox',
      1: 'Brakes',
      2: 'Engine',
      3: 'Suspension',
      4: 'Front Wing',
      5: 'Rear Wing'
    };
    return typeMap[type] || 'Unknown';
  };

  // Apply filters to the merged data
  const filteredCarParts = useMemo(() => {
    if (!mergedCarParts) return []

    return mergedCarParts.filter(carPart => {
      const matchesSearch = !searchTerm ||
        carPart.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMaxSeries = carPart.series <= maxSeries

      // Exclude starter components (series 0)
      const isNotStarterPart = carPart.series > 0

      return matchesSearch && matchesMaxSeries && isNotStarterPart
    })
  }, [mergedCarParts, searchTerm, maxSeries])

  // Group parts by part type in the correct order: brakes, gearbox, rear wing, front wing, suspension, engine
  const groupedParts = useMemo(() => {
    // Define the display order for part types
    const partTypeDisplayOrder: Record<string, number> = {
      'Brakes': 0,      // first
      'Gearbox': 1,     // second
      'Rear Wing': 2,   // third
      'Front Wing': 3,  // fourth
      'Suspension': 4,  // fifth
      'Engine': 5,      // sixth
      'Battery': 6      // seventh (FY26+)
    };

    const getPartTypeName = (type: number | null): string => {
      if (type === null) return 'Unknown';
      const typeMap: Record<number, string> = {
        0: 'Gearbox',
        1: 'Brakes',
        2: 'Engine',
        3: 'Suspension',
        4: 'Front Wing',
        5: 'Rear Wing',
        6: 'Battery'
      };
      return typeMap[type] || 'Unknown';
    };

    // Group by part type
    const groups: Record<string, CarPartView[]> = {};
    filteredCarParts.forEach(part => {
      const typeName = getPartTypeName(part.car_part_type);
      if (!groups[typeName]) {
        groups[typeName] = [];
      }
      groups[typeName].push(part);
    });

    // Sort within each group by series then rarity
    Object.keys(groups).forEach(typeName => {
      groups[typeName].sort((a, b) => {
        if (a.series !== b.series) return a.series - b.series;
        return a.rarity - b.rarity;
      });
    });

    // Sort groups by the defined display order
    const orderedGroups = Object.entries(groups)
      .sort(([a], [b]) => {
        const aOrder = partTypeDisplayOrder[a] ?? 99;
        const bOrder = partTypeDisplayOrder[b] ?? 99;
        return aOrder - bOrder;
      })
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, CarPartView[]>);

    return orderedGroups;
  }, [filteredCarParts]);

  // Calculate column statistics for each part type
  const columnStats = useMemo(() => {
    const stats: { [key: string]: { min: number; max: number; median: number } } = {};
    const partTypes = [0, 1, 2, 3, 4, 5, 6]; // Gearbox, Brakes, Engine, Suspension, Front Wing, Rear Wing, Battery
    const extraStat = isFY26 ? 'overtake' : 'drs';
    const statColumns = ['speed', 'cornering', 'powerUnit', 'qualifying', extraStat, 'pitStopTime', 'total_value'];

    partTypes.forEach(partType => {
      statColumns.forEach(statName => {
        const statKey = `${partType}_${statName}`;
        const values: number[] = [];

        filteredCarParts.forEach(part => {
          if (part.car_part_type === partType) {
            const userLevel = part.level || 0;

            if (userLevel === 0) {
              // Skip level 0 items (they have 0 values and shouldn't affect color coding)
              return;
            }

            let baseValue = 0;
            if (part.stats_per_level && Array.isArray(part.stats_per_level)) {
              const s = part.stats_per_level;
              if (s && s.length > userLevel - 1) {
                if (statName === 'overtake') {
                  const level = s[userLevel - 1] as Record<string, number>;
                  baseValue = (level['powerBoostImpact'] || 0) + (level['powerBoostDuration'] || 0) + (level['powerBoostRechargeRate'] || 0);
                } else if (s[userLevel - 1][statName] !== undefined) {
                  baseValue = (s[userLevel - 1] as Record<string, number>)[statName];
                }
              }
            }

            // Apply bonus if item has bonus checked and bonus percentage is set
            if (bonusCheckedItems.has(part.id) && parseFloat(bonusPercentage) > 0) {
              if (statName === 'pitStopTime') {
                // Pit stop time should decrease (lower is better)
                baseValue = Math.round((baseValue * (1 - parseFloat(bonusPercentage) / 100)) * 100) / 100;
              } else {
                // All other stats should increase and round up
                baseValue = Math.ceil(baseValue * (1 + parseFloat(bonusPercentage) / 100));
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

    return stats;
  }, [filteredCarParts, bonusCheckedItems, bonusPercentage, isFY26]);

  // Use shared rarity helpers (for rarity 5, prefer collection-driven label)
  const rarityLabel = (item: any) => item.rarity === 5 ? getCollectionRarityDisplay(item.collection_theme ?? null, item.collection_sub_name ?? null) : getRarityDisplay(item.rarity)

  // Helper to get part type number from name
  const getPartTypeNumber = (typeName: string): number => {
    const typeMap: Record<string, number> = {
      'Gearbox': 0,
      'Brakes': 1,
      'Engine': 2,
      'Suspension': 3,
      'Front Wing': 4,
      'Rear Wing': 5,
      'Battery': 6
    };
    return typeMap[typeName] ?? -1;
  };

  // Get all parts available for theoretical comparison (excluding starter parts)
  const allPartsForComparison = useMemo(() => {
    return mergedCarParts.filter(part => part.series > 0);
  }, [mergedCarParts]);

  // Get max level for a part based on rarity
  const getMaxLevelForRarity = (rarity: number): number => {
    switch (rarity) {
      case 1: return 11; // Common
      case 2: return 9;  // Rare
      case 3: return 8;  // Epic
      case 4: return 6;  // Legendary (assumed)
      case 5: return 8;  // Collection
      default: return 11;
    }
  };

  // Get stats for a theoretical part
  const getTheoreticalPartStats = (partId: string, level: number) => {
    const part = mergedCarParts.find(p => p.id === partId);
    if (!part || level < 1) return null;

    const stats = part.stats_per_level;
    if (!stats || !Array.isArray(stats) || stats.length < level) return null;

    const levelStats = stats[level - 1];
    const ls = levelStats as Record<string, number>;
    return {
      speed: levelStats.speed || 0,
      cornering: levelStats.cornering || 0,
      powerUnit: levelStats.powerUnit || 0,
      qualifying: levelStats.qualifying || 0,
      drs: ls['drs'] || 0,
      powerBoostImpact: ls['powerBoostImpact'] || 0,
      powerBoostDuration: ls['powerBoostDuration'] || 0,
      powerBoostRechargeRate: ls['powerBoostRechargeRate'] || 0,
      overtake: (ls['powerBoostImpact'] || 0) + (ls['powerBoostDuration'] || 0) + (ls['powerBoostRechargeRate'] || 0),
      pitStopTime: levelStats.pitStopTime || 0,
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Title and Filters */}
      <div className="mb-8 flex items-center gap-6">
        <h1 className="text-3xl font-bold text-gray-900 mr-4">Car Parts</h1>

        {/* Search and Max Series Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="maxSeries" className="text-sm font-medium text-gray-700">
              Max Series:
            </label>
            <select
              id="maxSeries"
              className="rounded-lg border-gray-300 text-sm px-3 py-2 pr-8 bg-white bg-no-repeat bg-right appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' class=\'w-4 h-4\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }}
              value={maxSeries}
              onChange={(e) => setMaxSeries(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={12 - i} value={12 - i}>
                {12 - i}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="bonusPercentage" className="text-sm font-medium text-gray-700">
              Bonus %:
            </label>
            <input
              id="bonusPercentage"
              type="text"
              className="rounded-lg border-gray-300 text-sm px-2 py-2 w-12"
              value={bonusPercentage}
              onChange={(e) => setBonusPercentage(e.target.value)}
              placeholder="0"
            />
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
      </div>

      <ErrorBoundary
        fallback={
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Failed to load car parts. Please try again.</p>
          </div>
        }
      >
        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Error loading car parts: {error.message}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedParts).map(([partType, parts]) => (
              <div key={partType} className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-gray-900">{partType}</h2>
                  <div className="ml-4 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                    {parts.length} {parts.length === 1 ? 'part' : 'parts'}
                  </div>
                </div>

                {/* Parts Table */}
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 w-fit max-h-[73vh]">
                  <table className="table divide-y divide-gray-200">
                    <thead className="bg-gray-700 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Rarity
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Lvl
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Bonus
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Speed
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Corner
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          PU
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Quali
                        </th>
                        {partType === 'Battery' && (
                          <>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                              Over take
                            </th>
                          </>
                        )}
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Pit Stop
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Series
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parts.map((part) => {
                        // Get stats for the current level
                        const getStatValue = (statName: string): number => {
                          let userLevel = part.level || 0;
                          if (userLevel === 0) return 0;

                          // If showHighestLevel is enabled, use the highest possible level instead of current level
                          if (showHighestLevel) {
                            const cardCount = part.card_count || 0;
                            userLevel = calculateHighestLevel(userLevel, cardCount, part.rarity);
                          }

                          let stats: Array<{ [key: string]: number }> | null = null;
                          if (part.stats_per_level && Array.isArray(part.stats_per_level)) {
                            stats = part.stats_per_level;
                          }

                          let baseValue = 0;
                          if (stats && stats.length > userLevel - 1) {
                            if (statName === 'overtake') {
                              const s = stats[userLevel - 1];
                              baseValue = (s['powerBoostImpact'] || 0) + (s['powerBoostDuration'] || 0) + (s['powerBoostRechargeRate'] || 0);
                            } else if (stats[userLevel - 1][statName] !== undefined) {
                              baseValue = stats[userLevel - 1][statName];
                            }
                          }

                          // Apply bonus if item has bonus checked and bonus percentage is set
                          if (bonusCheckedItems.has(part.id) && parseFloat(bonusPercentage) > 0) {
                            if (statName === 'pitStopTime') {
                              // Pit stop time should decrease (lower is better)
                              baseValue = Math.round((baseValue * (1 - parseFloat(bonusPercentage) / 100)) * 100) / 100;
                            } else {
                              // All other stats should increase and round up
                              baseValue = Math.ceil(baseValue * (1 + parseFloat(bonusPercentage) / 100));
                            }
                          }

                          return baseValue;
                        };

                        const speed = getStatValue('speed');
                        const cornering = getStatValue('cornering');
                        const powerUnit = getStatValue('powerUnit');
                        const qualifying = getStatValue('qualifying');
                        const isBattery = partType === 'Battery';
                        const powerBoostImpact = isBattery ? getStatValue('powerBoostImpact') : 0;
                        const powerBoostDuration = isBattery ? getStatValue('powerBoostDuration') : 0;
                        const powerBoostRechargeRate = isBattery ? getStatValue('powerBoostRechargeRate') : 0;
                        const overtake = isBattery ? getStatValue('overtake') : 0;
                        const pitStopTime = getStatValue('pitStopTime');
                        const totalValue = speed + cornering + powerUnit + qualifying + (isBattery ? overtake : 0); // Exclude pit stop from total

                        return (
                          <>
                            <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                              <td className={cn("px-3 py-1 whitespace-nowrap", getRarityBackground(part.rarity))}>
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {part.name}
                                  </div>
                                </div>
                              </td>
                            <td className={cn("px-3 py-1 whitespace-nowrap", getRarityBackground(part.rarity))}>
                              <div className="text-sm font-medium text-gray-900">
                                {rarityLabel(part)}
                              </div>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center">
                              <div className={`text-sm text-gray-900 ${showHighestLevel && calculateHighestLevel(part.level || 0, part.card_count || 0, part.rarity) > (part.level || 0) ? 'text-red-600' : ''}`}>
                                {showHighestLevel ?
                                  calculateHighestLevel(part.level || 0, part.card_count || 0, part.rarity) :
                                  (part.level || 0)}
                              </div>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={bonusCheckedItems.has(part.id)}
                                onChange={() => handleBonusToggle(part.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </td>
                            <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${part.car_part_type}_speed`] && getStatBackgroundColor(speed, columnStats[`${part.car_part_type}_speed`].min, columnStats[`${part.car_part_type}_speed`].max, columnStats[`${part.car_part_type}_speed`].median))}>
                              <div className="text-sm text-gray-900">{speed}</div>
                            </td>
                            <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${part.car_part_type}_cornering`] && getStatBackgroundColor(cornering, columnStats[`${part.car_part_type}_cornering`].min, columnStats[`${part.car_part_type}_cornering`].max, columnStats[`${part.car_part_type}_cornering`].median))}>
                              <div className="text-sm text-gray-900">{cornering}</div>
                            </td>
                            <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${part.car_part_type}_powerUnit`] && getStatBackgroundColor(powerUnit, columnStats[`${part.car_part_type}_powerUnit`].min, columnStats[`${part.car_part_type}_powerUnit`].max, columnStats[`${part.car_part_type}_powerUnit`].median))}>
                              <div className="text-sm text-gray-900">{powerUnit}</div>
                            </td>
                            <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${part.car_part_type}_qualifying`] && getStatBackgroundColor(qualifying, columnStats[`${part.car_part_type}_qualifying`].min, columnStats[`${part.car_part_type}_qualifying`].max, columnStats[`${part.car_part_type}_qualifying`].median))}>
                              <div className="text-sm text-gray-900">{qualifying}</div>
                            </td>
                            {isBattery && (
                              <>
                                <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${part.car_part_type}_overtake`] && getStatBackgroundColor(overtake, columnStats[`${part.car_part_type}_overtake`].min, columnStats[`${part.car_part_type}_overtake`].max, columnStats[`${part.car_part_type}_overtake`].median))}>
                                  <div className="text-sm text-gray-900">{overtake}</div>
                                </td>
                              </>
                            )}
                            <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${part.car_part_type}_pitStopTime`] && getStatBackgroundColor(pitStopTime, columnStats[`${part.car_part_type}_pitStopTime`].min, columnStats[`${part.car_part_type}_pitStopTime`].max, columnStats[`${part.car_part_type}_pitStopTime`].median, true))}>
                              <div className="text-sm text-gray-900">{pitStopTime}</div>
                            </td>
                            <td className={cn("px-3 py-1 whitespace-nowrap text-center", columnStats[`${part.car_part_type}_total_value`] && getStatBackgroundColor(totalValue, columnStats[`${part.car_part_type}_total_value`].min, columnStats[`${part.car_part_type}_total_value`].max, columnStats[`${part.car_part_type}_total_value`].median))}>
                              <div className="text-sm font-medium text-gray-900">{totalValue}</div>
                            </td>
                              <td className="px-3 py-1 whitespace-nowrap text-center">
                                <div className="text-sm text-gray-900">{part.series}</div>
                              </td>
                            </tr>
                            {isBattery && (
                              <tr key={`${part.id}-pb`} className="hover:bg-gray-50 transition-colors">
                                <td colSpan={12} className="px-3 py-0.5 text-xs text-gray-500 text-left">
                                  PB Impact: {powerBoostImpact} · PB Duration: {powerBoostDuration} · PB Charge: {powerBoostRechargeRate}
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}

                      {/* Theoretical Parts Comparison Rows */}
                      {[0, 1, 2].map((index) => {
                        const partTypeNum = getPartTypeNumber(partType);
                        const key = `${partTypeNum}_${index}`;
                        const selection = theoreticalParts[key];
                        const selectedPart = selection ? allPartsForComparison.find(p => p.id === selection.partId) : null;
                        const rawStats = selection ? getTheoreticalPartStats(selection.partId, selection.level) : null;

                        // Get parts available for this part type, sorted same as grid (series then rarity ascending)
                        const availableParts = allPartsForComparison
                          .filter(p => p.car_part_type === partTypeNum)
                          .sort((a, b) => {
                            if (a.series !== b.series) return a.series - b.series;
                            return a.rarity - b.rarity;
                          });

                        // Generate a unique ID for theoretical part bonus tracking
                        const theoreticalBonusId = `theoretical-${partTypeNum}-${index}`;

                        // Apply bonus to theoretical part stats if checked
                        const bonusMult = bonusCheckedItems.has(theoreticalBonusId) && parseFloat(bonusPercentage) > 0 ? parseFloat(bonusPercentage) / 100 : 0;
                        const stats = rawStats && bonusMult > 0
                          ? {
                              speed: Math.ceil(rawStats.speed * (1 + bonusMult)),
                              cornering: Math.ceil(rawStats.cornering * (1 + bonusMult)),
                              powerUnit: Math.ceil(rawStats.powerUnit * (1 + bonusMult)),
                              qualifying: Math.ceil(rawStats.qualifying * (1 + bonusMult)),
                              drs: Math.ceil(rawStats.drs * (1 + bonusMult)),
                              powerBoostImpact: Math.ceil(rawStats.powerBoostImpact * (1 + bonusMult)),
                              powerBoostDuration: Math.ceil(rawStats.powerBoostDuration * (1 + bonusMult)),
                              powerBoostRechargeRate: Math.ceil(rawStats.powerBoostRechargeRate * (1 + bonusMult)),
                              overtake: Math.ceil(rawStats.overtake * (1 + bonusMult)),
                              pitStopTime: Math.round((rawStats.pitStopTime * (1 - bonusMult)) * 100) / 100,
                            }
                          : rawStats;

                        return (
                          <>
                            <tr key={`theoretical-${partType}-${index}`} className="bg-gray-100 hover:bg-gray-200 transition-colors">
                              <td className="px-3 py-1 whitespace-nowrap bg-gray-200">
                              <select
                                className="text-sm bg-white border border-gray-300 rounded px-2 py-1 w-32"
                                value={selection?.partId || ''}
                                onChange={(e) => {
                                  const newPartId = e.target.value;
                                  if (newPartId) {
                                    const part = allPartsForComparison.find(p => p.id === newPartId);
                                    const defaultLevel = part ? 1 : 1;
                                    setTheoreticalPart(partTypeNum, index, newPartId, selection?.level || defaultLevel);
                                  } else {
                                    setTheoreticalPart(partTypeNum, index, null, null);
                                  }
                                }}
                              >
                                <option value="">Select part...</option>
                                {availableParts.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap bg-gray-200">
                              <div className="text-sm text-gray-900">
                                {selectedPart ? rarityLabel(selectedPart) : '-'}
                              </div>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center bg-gray-200">
                              {selectedPart ? (
                                <select
                                  className="text-sm bg-white border border-gray-300 rounded px-2 py-1 w-16"
                                  value={selection?.level || 1}
                                  onChange={(e) => {
                                    const newLevel = parseInt(e.target.value, 10);
                                    if (selection?.partId) {
                                      setTheoreticalPart(partTypeNum, index, selection.partId, newLevel);
                                    }
                                  }}
                                >
                                  {Array.from({ length: getMaxLevelForRarity(selectedPart.rarity) }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center bg-gray-200">
                              <input
                                type="checkbox"
                                checked={bonusCheckedItems.has(theoreticalBonusId)}
                                onChange={() => handleBonusToggle(theoreticalBonusId)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </td>
                            <td className={cn("px-3 py-1 whitespace-nowrap text-center", stats && columnStats[`${partTypeNum}_speed`] && getStatBackgroundColor(stats.speed, columnStats[`${partTypeNum}_speed`].min, columnStats[`${partTypeNum}_speed`].max, columnStats[`${partTypeNum}_speed`].median))}>
                              <div className="text-sm text-gray-900">{stats?.speed ?? '-'}</div>
                            </td>
                            <td className={cn("px-3 py-1 whitespace-nowrap text-center", stats && columnStats[`${partTypeNum}_cornering`] && getStatBackgroundColor(stats.cornering, columnStats[`${partTypeNum}_cornering`].min, columnStats[`${partTypeNum}_cornering`].max, columnStats[`${partTypeNum}_cornering`].median))}>
                              <div className="text-sm text-gray-900">{stats?.cornering ?? '-'}</div>
                            </td>
                            <td className={cn("px-3 py-1 whitespace-nowrap text-center", stats && columnStats[`${partTypeNum}_powerUnit`] && getStatBackgroundColor(stats.powerUnit, columnStats[`${partTypeNum}_powerUnit`].min, columnStats[`${partTypeNum}_powerUnit`].max, columnStats[`${partTypeNum}_powerUnit`].median))}>
                              <div className="text-sm text-gray-900">{stats?.powerUnit ?? '-'}</div>
                            </td>
                            <td className={cn("px-3 py-1 whitespace-nowrap text-center", stats && columnStats[`${partTypeNum}_qualifying`] && getStatBackgroundColor(stats.qualifying, columnStats[`${partTypeNum}_qualifying`].min, columnStats[`${partTypeNum}_qualifying`].max, columnStats[`${partTypeNum}_qualifying`].median))}>
                              <div className="text-sm text-gray-900">{stats?.qualifying ?? '-'}</div>
                            </td>
                            {partType === 'Battery' && (
                              <>
                                <td className={cn("px-3 py-1 whitespace-nowrap text-center", stats && columnStats[`${partTypeNum}_overtake`] && getStatBackgroundColor(stats.overtake, columnStats[`${partTypeNum}_overtake`].min, columnStats[`${partTypeNum}_overtake`].max, columnStats[`${partTypeNum}_overtake`].median))}>
                                  <div className="text-sm text-gray-900">{stats?.overtake ?? '-'}</div>
                                </td>
                              </>
                            )}
                            <td className={cn("px-3 py-1 whitespace-nowrap text-center", stats && columnStats[`${partTypeNum}_pitStopTime`] && getStatBackgroundColor(stats.pitStopTime, columnStats[`${partTypeNum}_pitStopTime`].min, columnStats[`${partTypeNum}_pitStopTime`].max, columnStats[`${partTypeNum}_pitStopTime`].median, true))}>
                              <div className="text-sm text-gray-900">{stats?.pitStopTime ?? '-'}</div>
                            </td>
                            <td className={cn("px-3 py-1 whitespace-nowrap text-center", stats && columnStats[`${partTypeNum}_total_value`] && getStatBackgroundColor(stats.speed + stats.cornering + stats.powerUnit + stats.qualifying + (partType === 'Battery' ? stats.overtake : 0), columnStats[`${partTypeNum}_total_value`].min, columnStats[`${partTypeNum}_total_value`].max, columnStats[`${partTypeNum}_total_value`].median))}>
                              <div className="text-sm font-medium text-gray-900">
                                {stats ? stats.speed + stats.cornering + stats.powerUnit + stats.qualifying + (partType === 'Battery' ? stats.overtake : 0) : '-'}
                              </div>
                            </td>
                              <td className="px-3 py-1 whitespace-nowrap text-center bg-gray-200">
                                <div className="text-sm text-gray-900">{selectedPart?.series ?? '-'}</div>
                              </td>
                            </tr>
                            {partType === 'Battery' && stats && (
                              <tr key={`${key}-pb`} className="bg-gray-100 hover:bg-gray-200 transition-colors">
                                <td colSpan={12} className="px-3 py-0.5 text-xs text-gray-500 text-left bg-gray-100">
                                  PB Impact: {stats.powerBoostImpact ?? '-'} · PB Duration: {stats.powerBoostDuration ?? '-'} · PB Charge: {stats.powerBoostRechargeRate ?? '-'}
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </ErrorBoundary>

      {/* Additional bottom spacing */}
      <div className="h-4"></div>
    </div>
  )
}

function LoginPrompt() {
  return (
    <div className="text-center py-12">
      <Card className="p-8 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign in Required</h2>
        <p className="text-gray-600 mb-6">
          Please sign in to view and manage your car parts collection.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/auth/login">
            <Button variant="primary">Sign In</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline">Create Account</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default function PartsPage() {
  const { user, loading: authLoading } = useAuth()

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="space-y-6">
        <SkeletonGrid count={8} />
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return <LoginPrompt />
  }

  // Show authenticated parts page if user is logged in
  return (
    <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
      <AuthenticatedPartsPage />
    </div>
  )
}
