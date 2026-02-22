'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { useCarParts } from '@/hooks/useApi'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import type { CarPart } from '@/types/database'
import { cn } from '@/lib/utils'

// Part type definitions
const PART_TYPES = [
  { key: 'brake', type: 1, name: 'Brake', label: 'Brake' },
  { key: 'gearbox', type: 0, name: 'Gearbox', label: 'Gearbox' },
  { key: 'rear_wing', type: 5, name: 'Rear Wing', label: 'Rear Wing' },
  { key: 'front_wing', type: 4, name: 'Front Wing', label: 'Front Wing' },
  { key: 'suspension', type: 3, name: 'Suspension', label: 'Suspension' },
  { key: 'engine', type: 2, name: 'Engine', label: 'Engine' }
] as const

// Setup types for max loadouts
const SETUP_TYPES = [
  { value: 'speed', label: 'Speed' },
  { value: 'cornering', label: 'Cornering' },
  { value: 'powerUnit', label: 'Power Unit' },
]

// Get stat value from a part at max level
const getMaxStatValue = (part: CarPart, statName: string): number => {
  const stats = part.stats_per_level
  if (!stats || !Array.isArray(stats) || stats.length === 0) return 0
  
  // Get the last level (max level)
  const maxLevelStats = stats[stats.length - 1]
  return maxLevelStats[statName] || 0
}

// Find the best part for a given stat and part type within a series
// Note: car_parts.series is 1 higher than series index (series 0 = starter, series 1 = for game series 0)
const findBestPart = (
  parts: CarPart[], 
  partType: number, 
  seriesIndex: number, 
  statName: string
): CarPart | null => {
  // Car parts series values: 0=starter, 1=for series 0, 2=for series 1, etc.
  // So for series index N, we want car_parts with series <= N+1
  const partsOfType = parts.filter(p => 
    p.car_part_type === partType && 
    p.series <= seriesIndex + 1
  )
  
  if (partsOfType.length === 0) return null
  
  // Score by the target stat
  const scoredParts = partsOfType.map(part => ({
    part,
    score: getMaxStatValue(part, statName)
  }))
  
  // Sort by score descending and pick the best
  scoredParts.sort((a, b) => b.score - a.score)
  return scoredParts[0]?.part || null
}

// Generate the best setup for a given stat type and series
interface SetupResult {
  brake: CarPart | null
  gearbox: CarPart | null
  rear_wing: CarPart | null
  front_wing: CarPart | null
  suspension: CarPart | null
  engine: CarPart | null
  totalStat: number
}

const generateSetup = (
  parts: CarPart[],
  seriesFilter: number,
  statType: string
): SetupResult => {
  const setup: SetupResult = {
    brake: null,
    gearbox: null,
    rear_wing: null,
    front_wing: null,
    suspension: null,
    engine: null,
    totalStat: 0
  }
  
  PART_TYPES.forEach(({ key, type }) => {
    const bestPart = findBestPart(parts, type, seriesFilter, statType)
    setup[key] = bestPart
    if (bestPart) {
      setup.totalStat += getMaxStatValue(bestPart, statType)
    }
  })
  
  return setup
}

// Get rarity background color
const getRarityBg = (rarity: number): string => {
  return rarity === 0 ? "bg-gray-300" :
         rarity === 1 ? "bg-blue-200" :
         rarity === 2 ? "bg-orange-200" :
         rarity === 3 ? "bg-purple-300" :
         rarity === 4 ? "bg-yellow-300" :
         rarity === 5 ? "bg-red-300" : "bg-gray-300"
}

function SeriesMaxLoadoutsContent() {
  // Fetch all car parts with a high limit to ensure we get all of them
  const { data: carPartsResponse, isLoading, error } = useCarParts({ limit: 100 })
  
  // Show all series from 0-11 (12 series total)
  // Note: Series 12 in the database is the "all parts unlocked" tier, not a regular series
  const seriesList = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  }, [])
  
  // Generate setups for all series
  const seriesSetups = useMemo(() => {
    if (!carPartsResponse?.data) return new Map()
    
    const setups = new Map<number, Record<string, SetupResult>>()
    
    seriesList.forEach(series => {
      const setupsForSeries: Record<string, SetupResult> = {}
      
      SETUP_TYPES.forEach(({ value }) => {
        setupsForSeries[value] = generateSetup(carPartsResponse.data, series, value)
      })
      
      setups.set(series, setupsForSeries)
    })
    
    return setups
  }, [carPartsResponse?.data, seriesList])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <Card className="p-8 text-center bg-red-50">
        <p className="text-red-600">Error loading car parts data. Please try again.</p>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Series Max Loadouts</h1>
        <p className="mt-2 text-gray-600">
          Mathematically best car setups for each series assuming max level parts. Shows the optimal parts for Speed, Cornering, and Power Unit builds. Note that this does mean these are the Best loadouts, just the most optimized for a specific stat. 
        </p>
      </div>
      
      {/* Series Tables */}
      <div className="space-y-4">
        {seriesList.map(series => {
          const setups = seriesSetups.get(series)
          if (!setups) return null
          
          return (
            <div key={series} className="overflow-x-auto bg-white rounded-lg border border-gray-200 w-[700px]">
              <table className="table divide-y divide-gray-200 w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      <span className="text-xl font-bold text-white">Series {series + 1}</span>
                    </th>
                    {SETUP_TYPES.map(({ label }) => (
                      <th key={label} className="px-8 py-2 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {PART_TYPES.map(({ key, label }) => {
                    const speedPart = setups.speed?.[key]
                    const corneringPart = setups.cornering?.[key]
                    const powerUnitPart = setups.powerUnit?.[key]
                    
                    return (
                      <tr key={key} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                          {label}
                        </td>
                        <td className={cn("px-8 py-1 whitespace-nowrap text-center", speedPart ? getRarityBg(speedPart.rarity) : "")}>
                          {speedPart ? (
                            <span className="text-sm font-medium text-gray-900">{speedPart.name}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className={cn("px-8 py-1 whitespace-nowrap text-center", corneringPart ? getRarityBg(corneringPart.rarity) : "")}>
                          {corneringPart ? (
                            <span className="text-sm font-medium text-gray-900">{corneringPart.name}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className={cn("px-8 py-1 whitespace-nowrap text-center", powerUnitPart ? getRarityBg(powerUnitPart.rarity) : "")}>
                          {powerUnitPart ? (
                            <span className="text-sm font-medium text-gray-900">{powerUnitPart.name}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
      
      {/* Summary */}
      <div className="text-center text-sm text-gray-500">
        {seriesList.length} series
      </div>
    </div>
  )
}

export default function SeriesMaxLoadoutsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          <SeriesMaxLoadoutsContent />
        </div>
      </div>
    </ProtectedRoute>
  )
}