'use client'

import { useState, useMemo, useEffect } from 'react'
import { DataGrid } from '@/components/DataGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUserDrivers, useDrivers } from '@/hooks/useApi'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/components/auth/AuthContext'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

function AuthenticatedDriversPage() {
  const { data: driversResponse, isLoading, error } = useUserDrivers({
    page: 1,
    limit: 100
  })

  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [maxSeries, setMaxSeries] = useState(12)
  const [bonusPercentage, setBonusPercentage] = useState('')
  const [bonusCheckedItems, setBonusCheckedItems] = useState<Set<string>>(() => {
    // Initialize from localStorage
    try {
      const storedCheckedItems = localStorage.getItem('drivers-bonus-checked-items')
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
      const stored = localStorage.getItem('drivers-show-highest-level')
      return stored ? JSON.parse(stored) : false
    } catch (error) {
      console.warn('Failed to load show highest level from localStorage:', error)
      return false
    }
  })

  // Load bonus settings from localStorage on mount
  useEffect(() => {
    try {
      const storedBonusPercentage = localStorage.getItem('drivers-bonus-percentage')
      const storedCheckedItems = localStorage.getItem('drivers-bonus-checked-items')

      if (storedBonusPercentage) {
        setBonusPercentage(storedBonusPercentage)
      }

      if (storedCheckedItems) {
        const parsedItems = JSON.parse(storedCheckedItems)
        setBonusCheckedItems(new Set(parsedItems))
      }
    } catch (error) {
      console.warn('Failed to load bonus settings from localStorage:', error)
    }
  }, [])

  // Save bonus settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('drivers-bonus-percentage', bonusPercentage)
    } catch (error) {
      console.warn('Failed to save bonus percentage to localStorage:', error)
    }
  }, [bonusPercentage])

  useEffect(() => {
    try {
      const itemsArray = Array.from(bonusCheckedItems)
      localStorage.setItem('drivers-bonus-checked-items', JSON.stringify(itemsArray))
    } catch (error) {
      console.warn('Failed to save bonus checked items to localStorage:', error)
    }
  }, [bonusCheckedItems])

  useEffect(() => {
    try {
      localStorage.setItem('drivers-show-highest-level', JSON.stringify(showHighestLevel))
    } catch (error) {
      console.warn('Failed to save show highest level to localStorage:', error)
    }
  }, [showHighestLevel])

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

  // Handle adding driver to compare
  const handleAddToCompare = (driver: { id: string; name: string; level: number; rarity: number }) => {
    try {
      // Get existing compare drivers from localStorage
      const stored = localStorage.getItem('compare-drivers-settings')
      const existingDrivers: any[] = stored ? JSON.parse(stored) : []

      // Check if driver is already in the compare list (using driverName for new format, fallback to id for old format)
      const isAlreadyAdded = existingDrivers.some((d: any) =>
        d.driverName === driver.name || d.id === driver.id
      )

      if (!isAlreadyAdded) {
        // Add the driver with new data structure
        const newDriver = {
          driverName: driver.name,
          rarity: driver.rarity,
          level: Math.min(driver.level, getMaxLevelForRarity(driver.rarity)),
          hasBonus: false
        }

        const updatedDrivers = [...existingDrivers, newDriver]
        localStorage.setItem('compare-drivers-settings', JSON.stringify(updatedDrivers))

        // Show toast notification
        addToast(`${driver.name} added to compare page`, 'success')
      } else {
        addToast(`${driver.name} is already in compare list`, 'warning')
      }
    } catch (error) {
      console.warn('Failed to add driver to compare:', error)
      addToast('Failed to add driver to compare', 'error')
    }
  };

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
      default: return 11
    }
  };

  // Apply filters to the data
  const filteredDrivers = useMemo(() => {
    if (!driversResponse?.data) return []

    return driversResponse.data.filter(driver => {
      const matchesSearch = !searchTerm ||
        driver.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMaxSeries = driver.series <= maxSeries

      return matchesSearch && matchesMaxSeries
    })
  }, [driversResponse?.data, searchTerm, maxSeries])

  return (
    <div className="space-y-4">
      {/* Page Title and Filters */}
      <div className="flex items-center gap-6">
        <h1 className="text-3xl font-bold text-gray-900 mr-4">Drivers</h1>

        {/* Search and Max Series Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full sm:w-64">
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
            <p className="text-red-600">Failed to load drivers. Please try again.</p>
          </div>
        }
      >
        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Error loading drivers: {error.message}</p>
          </div>
        ) : (
          <DataGrid
            drivers={filteredDrivers}
            title=""
            gridType="drivers"
            showFilters={false}
            showSearch={false}
            showCompareButton={true}
            onAddToCompare={handleAddToCompare}
            bonusPercentage={parseFloat(bonusPercentage) || 0}
            bonusCheckedItems={bonusCheckedItems}
            onBonusToggle={handleBonusToggle}
            showHighestLevel={showHighestLevel}
          />
        )}
      </ErrorBoundary>

    </div>
  )
}

function LoginPrompt() {
  return (
    <div className="text-center py-12">
      <Card className="p-8 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign in Required</h2>
        <p className="text-gray-600 mb-6">
          Please sign in to view and manage your driver collection.
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

export default function DriversPage() {
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

  // Show authenticated drivers page if user is logged in
  return <AuthenticatedDriversPage />
}
