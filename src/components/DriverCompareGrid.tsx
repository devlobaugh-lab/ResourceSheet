'use client'

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DriverView } from '@/types/database'
import { useDrivers, useUserDrivers } from '@/hooks/useApi'
import { cn, calculateHighestLevel } from '@/lib/utils'
import { getRarityDisplay, getRarityOptions } from '@/lib/rarityUtils'
import { useSeason } from '@/contexts/SeasonContext'

// Helper function to get stat background color based on value position in range
const getStatBackgroundColor = (value: number, min: number, max: number, median: number): string => {
  if (value === max) return 'bg-green-400'
  if (value === median) return 'bg-white'
  if (value === min) return 'bg-red-400'

  if (value < median) {
    // Gradient from red-400 to white for values below median
    const ratio = (value - min) / (median - min)
    if (ratio < 0.25) return 'bg-red-400'
    if (ratio < 0.5) return 'bg-red-300'
    if (ratio < 0.75) return 'bg-red-200'
    return 'bg-red-100'
  } else {
    // Gradient from white to green-400 for values above median
    const ratio = (value - median) / (max - median)
    if (ratio < 0.25) return 'bg-green-100'
    if (ratio < 0.5) return 'bg-green-200'
    if (ratio < 0.75) return 'bg-green-300'
    return 'bg-green-400'
  }
}

  // Data structure for a driver in the compare grid
  interface CompareDriver {
    driverName: string
    rarity: number
    rarityValue?: string // Store the unique value from the API (optional for backward compatibility)
    level: number
    hasBonus: boolean
  }

// localStorage key for persistence
const COMPARE_DRIVERS_KEY = 'compare-drivers-settings'

interface DriverCompareGridProps {
  className?: string
}

export function DriverCompareGrid({ className }: DriverCompareGridProps) {
  const { activeSeasonId } = useSeason()
  const { data: userDriversResponse } = useUserDrivers({
    season_id: activeSeasonId ?? undefined,
    page: 1,
    limit: 1000 // Get all drivers for dropdown and stats
  })

  const allDrivers = useMemo(() => userDriversResponse?.data || [], [userDriversResponse?.data])

  // State for the compare grid
  const [compareDrivers, setCompareDrivers] = useState<CompareDriver[]>(() => {
    try {
      const stored = localStorage.getItem(COMPARE_DRIVERS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // New format: { seasonId, drivers }
        if (parsed.drivers) return parsed.drivers
        // Old format: array directly
        if (Array.isArray(parsed)) return parsed
      }
    } catch (error) {
      console.warn('Failed to load compare drivers from localStorage:', error)
    }
    return []
  })

  // State for rarity options
  const [rarityOptions, setRarityOptions] = useState<Array<{ rarity: number; display: string; collectionId?: string; value?: string }>>([])

  const prevSeasonIdRef = useRef<string | null | undefined>(undefined)

  const [bonusPercentage, setBonusPercentage] = useState(() => {
    // Load bonus percentage from localStorage
    try {
      const stored = localStorage.getItem('compare-drivers-bonus-percentage')
      const parsed = stored ? parseFloat(stored) : 0
      return isNaN(parsed) ? 0 : parsed
    } catch (error) {
      console.warn('Failed to load bonus percentage from localStorage:', error)
      return 0
    }
  })

  // Effect A: on mount, validate stored season matches current season
  useEffect(() => {
    if (activeSeasonId === null) return
    try {
      const stored = localStorage.getItem(COMPARE_DRIVERS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.seasonId && parsed.seasonId !== activeSeasonId) {
          setCompareDrivers([])
          localStorage.removeItem(COMPARE_DRIVERS_KEY)
        }
      }
    } catch {}
  }, [activeSeasonId])

  // Effect B: detect active season switch (not initial mount)
  useEffect(() => {
    if (prevSeasonIdRef.current === undefined) {
      prevSeasonIdRef.current = activeSeasonId
      return
    }
    if (activeSeasonId !== null && prevSeasonIdRef.current !== activeSeasonId) {
      prevSeasonIdRef.current = activeSeasonId
      setCompareDrivers([])
      localStorage.removeItem(COMPARE_DRIVERS_KEY)
    }
  }, [activeSeasonId])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!activeSeasonId) return
    try {
      localStorage.setItem(COMPARE_DRIVERS_KEY, JSON.stringify({
        seasonId: activeSeasonId,
        drivers: compareDrivers
      }))
    } catch (error) {
      console.warn('Failed to save compare drivers to localStorage:', error)
    }
  }, [activeSeasonId, compareDrivers])

  useEffect(() => {
    try {
      localStorage.setItem('compare-drivers-bonus-percentage', bonusPercentage.toString())
    } catch (error) {
      console.warn('Failed to save bonus percentage to localStorage:', error)
    }
  }, [bonusPercentage])

  // Fetch rarity options on component mount
  useEffect(() => {
    const fetchRarityOptions = async () => {
      try {
        const options = await getRarityOptions()
        setRarityOptions(options)
      } catch (error) {
        console.error('Failed to fetch rarity options:', error)
        // Fallback to basic rarities
        setRarityOptions([
          { rarity: 1, display: 'Common' },
          { rarity: 2, display: 'Rare' },
          { rarity: 3, display: 'Epic' },
          { rarity: 4, display: 'Legendary' },
          { rarity: 5, display: 'Special Edition' }
        ])
      }
    }

    fetchRarityOptions()
  }, [])

  // Helper function to get driver by name and rarity
  const getDriverByNameAndRarity = useCallback((driverName: string, rarity: number, rarityValue?: string): DriverView | undefined => {
    // If we have a rarityValue, try to find by collection_id and collection_sub_name
    if (rarityValue && rarity === 5) {
      // Handle UUID format properly - UUIDs are 36 characters long
      let collectionId: string
      let subName: string
      
      if (rarityValue.length === 36) {
        // Pure UUID (like PodiumStars)
        collectionId = rarityValue
        subName = ''
      } else if (rarityValue.includes('-') && rarityValue.split('-')[0].length === 36) {
        // UUID followed by subName
        const parts = rarityValue.split('-')
        collectionId = parts[0]
        subName = parts.slice(1).join('-')
      } else {
        // Fallback: try to find the UUID (first 36 characters)
        collectionId = rarityValue.substring(0, 36)
        subName = rarityValue.substring(37)
      }
      
      return allDrivers.find((driver: DriverView) => 
        driver.name === driverName && 
        driver.rarity === rarity &&
        driver.collection_id === collectionId &&
        (driver.collection_sub_name === subName || (driver.collection_sub_name === null && subName === ''))
      )
    }
    
    // Fallback to basic rarity lookup for non-Rarity-5 or when rarityValue is not available
    return allDrivers.find((driver: DriverView) => driver.name === driverName && driver.rarity === rarity)
  }, [allDrivers])

  // Helper function to check if driver/rarity combination exists
  const isValidDriverRarity = useCallback((driverName: string, rarity: number, rarityValue?: string): boolean => {
    if (!driverName || rarity < 1) return false
    
    // For Rarity-5 variants, we need to check the specific collection_id and collection_sub_name
    if (rarityValue && rarity === 5) {
      // Handle UUID format properly - UUIDs are 36 characters long
      let collectionId: string
      let subName: string
      
      if (rarityValue.length === 36) {
        // Pure UUID (like PodiumStars)
        collectionId = rarityValue
        subName = ''
      } else if (rarityValue.includes('-') && rarityValue.split('-')[0].length === 36) {
        // UUID followed by subName
        const parts = rarityValue.split('-')
        collectionId = parts[0]
        subName = parts.slice(1).join('-')
      } else {
        // Fallback: try to find the UUID (first 36 characters)
        collectionId = rarityValue.substring(0, 36)
        subName = rarityValue.substring(37)
      }
      
      // First try exact match
      const exactMatch = allDrivers.some((driver: DriverView) => 
        driver.name === driverName && 
        driver.rarity === rarity &&
        driver.collection_id === collectionId &&
        driver.collection_sub_name === subName
      )
      
      if (exactMatch) return true
      
      // If exact match fails, try just collection_id match (fallback for data inconsistencies)
      return allDrivers.some((driver: DriverView) => 
        driver.name === driverName && 
        driver.rarity === rarity &&
        driver.collection_id === collectionId
      )
    }
    
    // For non-Rarity-5 or when rarityValue is not available, use basic lookup
    return allDrivers.some((driver: DriverView) => driver.name === driverName && driver.rarity === rarity)
  }, [allDrivers])

  // Filter to unique drivers by name (highest rarity), then sort by last name
  const sortedDrivers = useMemo(() => {
    // Create a map of driver names to the driver with highest rarity
    const driverMap = new Map<string, DriverView>()

    allDrivers.forEach((driver: DriverView) => {
      const name = driver.name
      const existing = driverMap.get(name)
      if (!existing || driver.rarity > existing.rarity) {
        driverMap.set(name, driver)
      }
    })

    // Convert map to array and sort by last name
    return Array.from(driverMap.values()).sort((a, b) => {
      const aParts = a.name.split(' ')
      const bParts = b.name.split(' ')
      const aLast = aParts[aParts.length - 1]
      const bLast = bParts[bParts.length - 1]

      if (aLast !== bLast) {
        return aLast.localeCompare(bLast)
      }

      // If last names are the same, sort by first name
      const aFirst = aParts.slice(0, -1).join(' ')
      const bFirst = bParts.slice(0, -1).join(' ')
      return aFirst.localeCompare(bFirst)
    })
  }, [allDrivers])

  // Helper function to get max level for a rarity
  const getMaxLevelForRarity = (rarity: number): number => {
    // Common: 11, Rare: 9, Epic: 8, Legendary/Special: 7
    switch (rarity) {
      case 0: return 11 // Basic
      case 1: return 11 // Common
      case 2: return 9  // Rare
      case 3: return 8  // Epic
      case 4: return 7  // Legendary
      case 5: return 7  // Special Edition
      // case 6: return 7  // SE Turbo
      default: return 11
    }
  }

  // Helper function to get stat value for a driver
  const getStatValue = useCallback((
    driver: DriverView | undefined,
    statName: string,
    level: number,
    hasBonus: boolean,
    bonusPercentage: number
  ): number => {
    if (!driver) {
      return 0
    }

    // Treat level 0 as level 1 for comparison purposes
    const effectiveLevel = level === 0 ? 1 : level

    let stats: Array<{ [key: string]: number }> | null = null
    if (driver.stats_per_level && Array.isArray(driver.stats_per_level)) {
      stats = driver.stats_per_level
    }

    let baseValue = 0
    if (stats && stats.length > effectiveLevel - 1 && stats[effectiveLevel - 1][statName] !== undefined) {
      baseValue = stats[effectiveLevel - 1][statName]
    }

    // Apply bonus if driver has bonus checked and bonus percentage is set
    if (hasBonus && bonusPercentage > 0) {
      if (statName === 'pitStopTime') {
        // Pit stop time should decrease (lower is better)
        baseValue = Math.round((baseValue * (1 - bonusPercentage / 100)) * 100) / 100
      } else {
        // All other stats should increase and round up
        baseValue = Math.ceil(baseValue * (1 + bonusPercentage / 100))
      }
    }

    return baseValue
  }, [])

  // Helper function to get stat display value (with N/A for invalid combinations)
  const getStatDisplayValue = useCallback((
    compareDriver: CompareDriver,
    statName: string
  ): string => {
    // Check if driver/rarity combination is valid
    if (!isValidDriverRarity(compareDriver.driverName, compareDriver.rarity, compareDriver.rarityValue)) {
      return 'N/A'
    }

    const driver = getDriverByNameAndRarity(compareDriver.driverName, compareDriver.rarity, compareDriver.rarityValue)
    const value = getStatValue(driver, statName, compareDriver.level, compareDriver.hasBonus, bonusPercentage)
    
    // For total value, calculate sum of stats
    if (statName === 'total_value') {
      if (!driver) return 'N/A'
      const total = ['overtaking', 'blocking', 'qualifying', 'raceStart', 'tyreUse']
        .reduce((sum, stat) => sum + getStatValue(driver, stat, compareDriver.level, compareDriver.hasBonus, bonusPercentage), 0)
      return total.toString()
    }

    return value.toString()
  }, [isValidDriverRarity, getDriverByNameAndRarity, getStatValue, bonusPercentage])

  // Calculate column statistics for color coding
  const columnStats = useMemo(() => {
    if (compareDrivers.length === 0) return {}

    const stats: { [key: string]: { min: number; max: number; median: number } } = {}

    const statColumns = ['overtaking', 'blocking', 'qualifying', 'raceStart', 'tyreUse', 'total_value']

    statColumns.forEach(statName => {
      const values: number[] = []

      compareDrivers.forEach(compareDriver => {
        const driver = getDriverByNameAndRarity(compareDriver.driverName, compareDriver.rarity)
        if (driver) {
          const value = getStatValue(
            driver,
            statName === 'total_value' ? 'overtaking' : statName,
            compareDriver.level,
            compareDriver.hasBonus,
            bonusPercentage
          )

          if (statName === 'total_value') {
            // Calculate total value as sum of 5 driver stats
            const total = ['overtaking', 'blocking', 'qualifying', 'raceStart', 'tyreUse']
              .reduce((sum, stat) => sum + getStatValue(driver, stat, compareDriver.level, compareDriver.hasBonus, bonusPercentage), 0)
            values.push(total)
          } else {
            values.push(value)
          }
        }
      })

      if (values.length > 0) {
        // Filter out any remaining 0 values before calculating statistics
        const nonZeroValues = values.filter(val => val > 0)

        if (nonZeroValues.length > 0) {
          const sortedValues = [...nonZeroValues].sort((a, b) => a - b)
          const min = sortedValues[0]
          const max = sortedValues[sortedValues.length - 1]
          const mid = Math.floor(sortedValues.length / 2)
          const median = sortedValues.length % 2 === 0
            ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
            : sortedValues[mid]
          stats[statName] = { min, max, median }
        }
      }
    })

    return stats
  }, [compareDrivers, getStatValue, bonusPercentage, getDriverByNameAndRarity])

  // Add a new driver column
  const addDriver = () => {
    const newDriver: CompareDriver = {
      driverName: '', // Empty initially, user will select
      rarity: 1, // Default to Common
      level: 1, // Default level
      hasBonus: false
    }
    setCompareDrivers(prev => [...prev, newDriver])
  }

  // Remove a driver column
  const removeDriver = (index: number) => {
    setCompareDrivers(prev => prev.filter((_, i) => i !== index))
  }

  // Update a driver column
  const updateDriver = (index: number, updates: Partial<CompareDriver>) => {
    setCompareDrivers(prev => prev.map((driver, i) =>
      i === index ? { ...driver, ...updates } : driver
    ))
  }

  // Handle driver selection change
  const handleDriverChange = (index: number, driverName: string) => {
    // When selecting from dropdown, set rarity to Common (1) by default
    updateDriver(index, { driverName, rarity: 1 })
  }

  // Handle rarity change with level adjustment
  const handleRarityChange = (index: number, rarity: number) => {
    const maxLevel = getMaxLevelForRarity(rarity)
    updateDriver(index, {
      rarity,
      level: Math.min(compareDrivers[index].level, maxLevel)
    })
  }

  // Use shared utility for rarity display (collection-driven for rarity 5 when available)

  return (
    <div className={cn('w-full', className)}>
      {/* Header with bonus percentage */}
      <div className="flex items-center gap-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Driver Comparison</h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="bonusPercentage" className="text-sm font-medium text-gray-700">
            Bonus %:
          </label>
          <input
            id="bonusPercentage"
            type="text"
            className="rounded-lg border-gray-300 text-sm px-2 py-2 w-12"
            value={bonusPercentage || ''}
            onChange={(e) => {
              const value = e.target.value.trim();
              setBonusPercentage(value === '' ? 0 : parseFloat(value) || 0);
            }}
            placeholder="0"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="primary" onClick={addDriver}>
            Add Driver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCompareDrivers([])
              setBonusPercentage(0)
              localStorage.removeItem(COMPARE_DRIVERS_KEY)
              localStorage.removeItem('compare-drivers-bonus-percentage')
            }}
            className="text-gray-600"
          >
            Reset All
          </Button>
        </div>
      </div>

      {/* Comparison Grid */}
      {compareDrivers.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="table w-auto divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Driver Row */}
              <tr className="bg-gray-300">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-700">
                  Driver
                </td>
                {compareDrivers.map((compareDriver, index) => (
                  <td key={index} className="px-3 py-2 text-center min-w-[150px]">
                    {/* Driver selection */}
                    <select
                      className="w-full rounded border-gray-300 text-xs px-2 py-1 bg-white text-gray-900"
                      value={compareDriver.driverName}
                      onChange={(e) => handleDriverChange(index, e.target.value)}
                    >
                      {!compareDriver.driverName && (
                        <option value="" className="text-gray-900">Select Driver</option>
                      )}
                      {sortedDrivers.map(driver => {
                        // Format name as "Last, First Initial"
                        const nameParts = driver.name.split(' ')
                        const lastName = nameParts[nameParts.length - 1]
                        const firstInitial = nameParts[0]?.charAt(0) || ''
                        const displayName = `${lastName}, ${firstInitial}.`
                        return (
                          <option key={driver.name} value={driver.name} className="text-gray-900">
                            {displayName}
                          </option>
                        )
                      })}
                    </select>
                  </td>
                ))}
              </tr>

              {/* Rarity Row */}
              <tr className="bg-gray-300">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-700">
                  Rarity
                </td>
                {compareDrivers.map((compareDriver, index) => (
                  <td key={index} className="px-3 py-2 text-center">
                    <select
                      className="w-full rounded border-gray-300 text-xs px-2 py-1 bg-white text-gray-900"
                      value={compareDriver.rarityValue || compareDriver.rarity}
                      onChange={(e) => {
                        const selectedValue = e.target.value
                        const selectedOption = rarityOptions.find(opt => opt.value === selectedValue)
                        if (selectedOption) {
                          updateDriver(index, { 
                            rarity: selectedOption.rarity, 
                            rarityValue: selectedValue 
                          })
                        }
                      }}
                    >
                      {rarityOptions.map((rarityOption, index) => (
                        <option key={`${rarityOption.rarity}-${rarityOption.display}`} value={rarityOption.value} className="text-gray-900">
                          {rarityOption.display}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>

              {/* Level Row */}
              <tr className="bg-gray-300">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-700">
                  Level
                </td>
                {compareDrivers.map((compareDriver, index) => (
                  <td key={index} className="px-3 py-2 text-center">
                    <select
                      className="w-full rounded border-gray-300 text-xs px-2 py-1 bg-white text-gray-900"
                      value={compareDriver.level}
                      onChange={(e) => updateDriver(index, { level: Number(e.target.value) })}
                    >
                      {Array.from({ length: 11 }, (_, i) => i + 1)
                        .filter(level => level <= getMaxLevelForRarity(compareDriver.rarity))
                        .map(level => (
                          <option key={level} value={level} className="text-gray-900">
                            {level}
                          </option>
                        ))}
                    </select>
                  </td>
                ))}
              </tr>

              {/* Driver Name Row */}
              <tr className="bg-gray-700">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-white sticky left-0 bg-gray-700">
                  Name
                </td>
                {compareDrivers.map((compareDriver, index) => {
                  const driver = getDriverByNameAndRarity(compareDriver.driverName, compareDriver.rarity)
                  const getRarityBackground = (rarity: number): string => {
                    return rarity === 0 ? "bg-gray-300" :
                           rarity === 1 ? "bg-blue-200" :
                           rarity === 2 ? "bg-orange-300" :
                           rarity === 3 ? "bg-purple-300" :
                           rarity === 4 ? "bg-yellow-300" :
                           rarity === 5 ? "bg-red-300" :
                           rarity === 6 ? "bg-rose-400" : "bg-gray-300";
                  };

                  // Format name as "Last, First Initial"
                  const formatDriverName = (name: string): string => {
                    const nameParts = name.split(' ')
                    const lastName = nameParts[nameParts.length - 1]
                    const firstInitial = nameParts[0]?.charAt(0) || ''
                    return `${lastName}, ${firstInitial}.`
                  };

                  return (
                    <td key={index} className={cn("px-3 py-2 text-center", driver && getRarityBackground(driver.rarity))}>
                      <div className="text-sm text-gray-900 font-bold">
                        {driver ? formatDriverName(driver.name) : ''}
                      </div>
                    </td>
                  )
                })}
              </tr>

              {/* Bonus Row */}
              <tr className="bg-gray-700">
                <td className="px-3 py-1 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-700">
                  Bonus
                </td>
                {compareDrivers.map((compareDriver, index) => (
                  <td key={index} className="px-3 pb-2 pt-1 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={compareDriver.hasBonus}
                      onChange={(e) => updateDriver(index, { hasBonus: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </td>
                ))}
              </tr>

              {/* Overtaking */}
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-700">
                  Overtaking
                </td>
                {compareDrivers.map((compareDriver, index) => {
                  const displayValue = getStatDisplayValue(compareDriver, 'overtaking')
                  const numericValue = displayValue === 'N/A' ? 0 : parseInt(displayValue)
                  return (
                    <td key={index} className={cn("px-3 py-2 whitespace-nowrap text-center", columnStats['overtaking'] && getStatBackgroundColor(numericValue, columnStats['overtaking'].min, columnStats['overtaking'].max, columnStats['overtaking'].median))}>
                      <div className="text-sm text-gray-900">{displayValue}</div>
                    </td>
                  )
                })}
              </tr>

              {/* Defending */}
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-700">
                  Defending
                </td>
                {compareDrivers.map((compareDriver, index) => {
                  const displayValue = getStatDisplayValue(compareDriver, 'blocking')
                  const numericValue = displayValue === 'N/A' ? 0 : parseInt(displayValue)
                  return (
                    <td key={index} className={cn("px-3 py-2 whitespace-nowrap text-center", columnStats['blocking'] && getStatBackgroundColor(numericValue, columnStats['blocking'].min, columnStats['blocking'].max, columnStats['blocking'].median))}>
                      <div className="text-sm text-gray-900">{displayValue}</div>
                    </td>
                  )
                })}
              </tr>

              {/* Qualifying */}
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-700">
                  Qualifying
                </td>
                {compareDrivers.map((compareDriver, index) => {
                  const displayValue = getStatDisplayValue(compareDriver, 'qualifying')
                  const numericValue = displayValue === 'N/A' ? 0 : parseInt(displayValue)
                  return (
                    <td key={index} className={cn("px-3 py-2 whitespace-nowrap text-center", columnStats['qualifying'] && getStatBackgroundColor(numericValue, columnStats['qualifying'].min, columnStats['qualifying'].max, columnStats['qualifying'].median))}>
                      <div className="text-sm text-gray-900">{displayValue}</div>
                    </td>
                  )
                })}
              </tr>

              {/* Race Start */}
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-700">
                  Race Start
                </td>
                {compareDrivers.map((compareDriver, index) => {
                  const displayValue = getStatDisplayValue(compareDriver, 'raceStart')
                  const numericValue = displayValue === 'N/A' ? 0 : parseInt(displayValue)
                  return (
                    <td key={index} className={cn("px-3 py-2 whitespace-nowrap text-center", columnStats['raceStart'] && getStatBackgroundColor(numericValue, columnStats['raceStart'].min, columnStats['raceStart'].max, columnStats['raceStart'].median))}>
                      <div className="text-sm text-gray-900">{displayValue}</div>
                    </td>
                  )
                })}
              </tr>

              {/* Tyre Management */}
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-700">
                  Tyre Mgt
                </td>
                {compareDrivers.map((compareDriver, index) => {
                  const displayValue = getStatDisplayValue(compareDriver, 'tyreUse')
                  const numericValue = displayValue === 'N/A' ? 0 : parseInt(displayValue)
                  return (
                    <td key={index} className={cn("px-3 py-2 whitespace-nowrap text-center", columnStats['tyreUse'] && getStatBackgroundColor(numericValue, columnStats['tyreUse'].min, columnStats['tyreUse'].max, columnStats['tyreUse'].median))}>
                      <div className="text-sm text-gray-900">{displayValue}</div>
                    </td>
                  )
                })}
              </tr>

              {/* Total Value */}
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-700">
                  Total Value
                </td>
                {compareDrivers.map((compareDriver, index) => {
                  const displayValue = getStatDisplayValue(compareDriver, 'total_value')
                  const numericValue = displayValue === 'N/A' ? 0 : parseInt(displayValue)
                  return (
                    <td key={index} className={cn("px-3 py-2 whitespace-nowrap text-center", columnStats['total_value'] && getStatBackgroundColor(numericValue, columnStats['total_value'].min, columnStats['total_value'].max, columnStats['total_value'].median))}>
                      <div className="text-sm font-medium text-gray-900">{displayValue}</div>
                    </td>
                  )
                })}
              </tr>

              {/* Series */}
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-700">
                  Series
                </td>
                {compareDrivers.map((compareDriver, index) => {
                  const driver = getDriverByNameAndRarity(compareDriver.driverName, compareDriver.rarity)
                  return (
                    <td key={index} className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">{driver?.series || '-'}</div>
                    </td>
                  )
                })}
              </tr>

              {/* Remove Row */}
              <tr className="bg-gray-300">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-gray-300">
                </td>
                {compareDrivers.map((compareDriver, index) => (
                  <td key={index} className="px-3 py-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDriver(index)}
                      className="text-red-600 bg-white hover:text-red-800 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Drivers Selected</h3>
          <p className="text-gray-600 mb-6">
            Click &ldquo;Add Driver&rdquo; to start comparing drivers side by side
          </p>
        </div>
      )}
    </div>
  )
}
