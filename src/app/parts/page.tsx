'use client'

import { useState, useMemo, useEffect } from 'react'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUserCarParts } from '@/hooks/useApi'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/components/auth/AuthContext'
import Link from 'next/link'
import { CarPartView } from '@/types/database'
import { cn } from '@/lib/utils'

function AuthenticatedPartsPage() {
  const { data: carPartsResponse, isLoading, error } = useUserCarParts({
    page: 1,
    limit: 100
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [maxSeries, setMaxSeries] = useState(12)
  const [bonusPercentage, setBonusPercentage] = useState('')
  const [bonusCheckedItems, setBonusCheckedItems] = useState<Set<string>>(new Set())

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

  // Apply filters to the data
  const filteredCarParts = useMemo(() => {
    if (!carPartsResponse?.data) return []

    return carPartsResponse.data.filter(carPart => {
      const matchesSearch = !searchTerm ||
        carPart.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMaxSeries = carPart.series <= maxSeries

      // Exclude starter components (series 0)
      const isNotStarterPart = carPart.series > 0

      return matchesSearch && matchesMaxSeries && isNotStarterPart
    })
  }, [carPartsResponse?.data, searchTerm, maxSeries])

  // Group parts by part type in the correct order: brakes, gearbox, rear wing, front wing, suspension, engine
  const groupedParts = useMemo(() => {
    // Define the display order for part types
    const partTypeDisplayOrder: Record<string, number> = {
      'Brakes': 0,      // first
      'Gearbox': 1,     // second
      'Rear Wing': 2,   // third
      'Front Wing': 3,  // fourth
      'Suspension': 4,  // fifth
      'Engine': 5       // sixth
    };

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

  // Helper functions
  const getRarityDisplay = (rarity: number): string => {
    const rarityMap: Record<number, string> = {
      0: 'Common',
      1: 'Uncommon',
      2: 'Rare',
      3: 'Epic',
      4: 'Legendary',
      5: 'Special Edition'
    };
    return rarityMap[rarity] || 'Unknown';
  };

  const getRarityBackground = (rarity: number): string => {
    return rarity === 0 ? "bg-gray-300" :
           rarity === 1 ? "bg-blue-200" :
           rarity === 2 ? "bg-orange-200" :
           rarity === 3 ? "bg-purple-300" :
           rarity === 4 ? "bg-yellow-300" :
           rarity === 5 ? "bg-red-300" : "bg-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Page Title and Filters */}
      <div className="flex items-center gap-6">
        <h1 className="text-3xl font-bold text-gray-900 mr-4">Car Parts</h1>

        {/* Search and Max Series Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search parts..."
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
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 w-full">
                  <table className="table divide-y divide-gray-200 min-w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Rarity
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Bonus
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Speed
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Cornering
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Power Unit
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Qualifying
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          DRS
                        </th>
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
                          const userLevel = part.level || 0;
                          if (userLevel === 0) return 0;

                          let stats: Array<{ [key: string]: number }> | null = null;
                          if (part.stats_per_level && Array.isArray(part.stats_per_level)) {
                            stats = part.stats_per_level;
                          }

                          let baseValue = 0;
                          if (stats && stats.length > userLevel - 1 && stats[userLevel - 1][statName] !== undefined) {
                            baseValue = stats[userLevel - 1][statName];
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
                        const drs = getStatValue('drs');
                        const pitStopTime = getStatValue('pitStopTime');
                        const totalValue = speed + cornering + powerUnit + qualifying + drs; // Exclude pit stop from total

                        return (
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
                                {getRarityDisplay(part.rarity)}
                              </div>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900">{part.level || 0}</div>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={bonusCheckedItems.has(part.id)}
                                onChange={() => handleBonusToggle(part.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900">{speed}</div>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900">{cornering}</div>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900">{powerUnit}</div>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900">{qualifying}</div>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900">{drs}</div>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900">{pitStopTime}</div>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center">
                              <div className="text-sm font-medium text-gray-900">{totalValue}</div>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900">{part.series}</div>
                            </td>
                          </tr>
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
  return <AuthenticatedPartsPage />
}
