'use client'

import { useState, useMemo } from 'react'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUserCarParts, useUserCarSetups, useCreateSetup, useUpdateSetup, useDeleteSetup } from '@/hooks/useApi'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/components/auth/AuthContext'
import Link from 'next/link'
import { CarPartView } from '@/types/database'
import { cn } from '@/lib/utils'

// Helper function to calculate stat value with bonus
const getStatValue = (part: CarPartView | undefined, statName: string, bonusPercentage: number, hasBonus: boolean): number => {
  if (!part) return 0

  const userLevel = part.level || 0
  if (userLevel === 0) return 0

  const stats = part.stats_per_level
  if (!stats || !Array.isArray(stats) || stats.length < userLevel) return 0

  let baseValue = stats[userLevel - 1][statName] || 0

  // Apply bonus if enabled
  if (hasBonus && bonusPercentage > 0) {
    if (statName === 'pitStopTime') {
      // Pit stop time decreases (lower is better)
      baseValue = Math.round((baseValue * (1 - bonusPercentage / 100)) * 100) / 100
    } else {
      // Other stats increase (higher is better)
      baseValue = Math.ceil(baseValue * (1 + bonusPercentage / 100))
    }
  }

  return baseValue
}

// Part type definitions
const PART_TYPES = [
  { key: 'brake', type: 1, name: 'Brake', label: 'Brake' },
  { key: 'gearbox', type: 0, name: 'Gearbox', label: 'Gearbox' },
  { key: 'rear_wing', type: 5, name: 'Rear Wing', label: 'Rear Wing' },
  { key: 'front_wing', type: 4, name: 'Front Wing', label: 'Front Wing' },
  { key: 'suspension', type: 3, name: 'Suspension', label: 'Suspension' },
  { key: 'engine', type: 2, name: 'Engine', label: 'Engine' }
] as const

function AuthenticatedSetupsPage() {
  const { data: carPartsResponse, isLoading: partsLoading, error: partsError } = useUserCarParts({
    page: 1,
    limit: 1000
  })

  const { data: setupsResponse, isLoading: setupsLoading, error: setupsError } = useUserCarSetups()
  const createSetup = useCreateSetup()
  const updateSetup = useUpdateSetup()
  const deleteSetup = useDeleteSetup()

  // Setup state
  const [setupName, setSetupName] = useState('')
  const [setupNotes, setSetupNotes] = useState('')
  const [selectedParts, setSelectedParts] = useState<Record<string, string>>({
    brake: '',
    gearbox: '',
    rear_wing: '',
    front_wing: '',
    suspension: '',
    engine: ''
  })
  const [bonusParts, setBonusParts] = useState<Set<string>>(new Set())
  const [seriesFilter, setSeriesFilter] = useState(12)
  const [bonusPercentage, setBonusPercentage] = useState('')

  // Saved setups state
  const [editingSetup, setEditingSetup] = useState<string | null>(null)

  // Filter parts by series
  const filteredParts = useMemo(() => {
    if (!carPartsResponse?.data) return []

    return carPartsResponse.data.filter(part => part.series <= seriesFilter)
  }, [carPartsResponse?.data, seriesFilter])

  // Group parts by type
  const partsByType = useMemo(() => {
    const groups: Record<number, CarPartView[]> = {}
    filteredParts.forEach(part => {
      if (!groups[part.car_part_type]) {
        groups[part.car_part_type] = []
      }
      groups[part.car_part_type].push(part)
    })

    // Sort each group by name
    Object.keys(groups).forEach(type => {
      groups[Number(type)].sort((a, b) => a.name.localeCompare(b.name))
    })

    return groups
  }, [filteredParts])

  // Calculate total stats
  const totalStats = useMemo(() => {
    const stats = {
      speed: 0,
      cornering: 0,
      powerUnit: 0,
      qualifying: 0,
      drs: 0,
      pitStopTime: 0
    }

    PART_TYPES.forEach(({ key, type }) => {
      const partId = selectedParts[key]
      const part = carPartsResponse?.data?.find(p => p.id === partId)
      const hasBonus = bonusParts.has(partId)

      if (part) {
        stats.speed += getStatValue(part, 'speed', parseFloat(bonusPercentage) || 0, hasBonus)
        stats.cornering += getStatValue(part, 'cornering', parseFloat(bonusPercentage) || 0, hasBonus)
        stats.powerUnit += getStatValue(part, 'powerUnit', parseFloat(bonusPercentage) || 0, hasBonus)
        stats.qualifying += getStatValue(part, 'qualifying', parseFloat(bonusPercentage) || 0, hasBonus)
        stats.drs += getStatValue(part, 'drs', parseFloat(bonusPercentage) || 0, hasBonus)
        stats.pitStopTime += getStatValue(part, 'pitStopTime', parseFloat(bonusPercentage) || 0, hasBonus)
      }
    })

    return stats
  }, [selectedParts, bonusParts, bonusPercentage, carPartsResponse?.data])

  // Handle part selection
  const handlePartChange = (partKey: string, partId: string) => {
    setSelectedParts(prev => ({
      ...prev,
      [partKey]: partId
    }))
  }

  // Handle bonus toggle
  const handleBonusToggle = (partId: string) => {
    setBonusParts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(partId)) {
        newSet.delete(partId)
      } else {
        newSet.add(partId)
      }
      return newSet
    })
  }

  // Handle save setup
  const handleSaveSetup = async () => {
    if (!setupName.trim()) {
      alert('Please enter a setup name')
      return
    }

    // Check for duplicate names
    const existingSetup = setupsResponse?.data?.find(
      setup => setup.name.toLowerCase() === setupName.trim().toLowerCase()
    )
    if (existingSetup) {
      alert('A setup with this name already exists. Please choose a different name.')
      return
    }

    // Check if all parts are selected
    const missingParts = PART_TYPES.filter(({ key }) => !selectedParts[key])
    if (missingParts.length > 0) {
      alert(`Please select: ${missingParts.map(p => p.label).join(', ')}`)
      return
    }

    try {
      await createSetup.mutateAsync({
        name: setupName.trim(),
        notes: setupNotes.trim() || null,
        brake_id: selectedParts.brake || null,
        gearbox_id: selectedParts.gearbox || null,
        rear_wing_id: selectedParts.rear_wing || null,
        front_wing_id: selectedParts.front_wing || null,
        suspension_id: selectedParts.suspension || null,
        engine_id: selectedParts.engine || null,
        series_filter: seriesFilter,
        bonus_percentage: parseFloat(bonusPercentage) || 0
      })

      // Reset form
      setSetupName('')
      setSetupNotes('')
      alert('Setup saved successfully!')
    } catch (error) {
      console.error('Failed to save setup:', error)
      alert('Failed to save setup')
    }
  }

  // Handle load setup
  const handleLoadSetup = (setup: any) => {
    setSetupName(setup.name || '')
    setSetupNotes(setup.notes || '')
    setSelectedParts({
      brake: setup.brake_id || '',
      gearbox: setup.gearbox_id || '',
      rear_wing: setup.rear_wing_id || '',
      front_wing: setup.front_wing_id || '',
      suspension: setup.suspension_id || '',
      engine: setup.engine_id || ''
    })
    setSeriesFilter(setup.series_filter || 12)
    setBonusPercentage(setup.bonus_percentage?.toString() || '')
    setBonusParts(new Set()) // Reset bonus parts - could be enhanced to store/load these too
  }

  // Handle delete setup
  const handleDeleteSetup = async (setupId: string) => {
    if (!confirm('Are you sure you want to delete this setup?')) return

    try {
      await deleteSetup.mutateAsync(setupId)
      alert('Setup deleted successfully!')
    } catch (error) {
      console.error('Failed to delete setup:', error)
      alert('Failed to delete setup')
    }
  }

  if (partsLoading || setupsLoading) {
    return (
      <div className="space-y-6">
        <SkeletonGrid count={8} />
      </div>
    )
  }

  if (partsError || setupsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">Error loading data. Please try again.</p>
      </div>
    )
  }

  // Helper function to get rarity background color
  const getRarityBackground = (rarity: number): string => {
    return rarity === 0 ? "bg-gray-300" :
           rarity === 1 ? "bg-blue-200" :
           rarity === 2 ? "bg-orange-200" :
           rarity === 3 ? "bg-purple-300" :
           rarity === 4 ? "bg-yellow-300" :
           rarity === 5 ? "bg-red-300" : "bg-gray-300";
  };

  return (
    <div className="space-y-8">
      {/* Page Title and Filters */}
      <div className="flex items-center gap-6">
        <h1 className="text-3xl font-bold text-gray-900 mr-4">Car Setups</h1>

        {/* Series Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="seriesFilter" className="text-sm font-medium text-gray-700">
            Max Series:
          </label>
          <select
            id="seriesFilter"
            className="rounded-lg border-gray-300 text-sm px-3 py-2 pr-8 bg-white"
            value={seriesFilter}
            onChange={(e) => setSeriesFilter(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={12 - i} value={12 - i}>
                {12 - i}
              </option>
            ))}
          </select>
        </div>

        {/* Bonus % */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Setup Creator and Saved Setups */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Setup</h2>

            {/* Setup Name */}
            <div className="mb-4">
              <label htmlFor="setupName" className="block text-sm font-medium text-gray-700 mb-1">
                Setup Name
              </label>
              <Input
                id="setupName"
                placeholder="Enter setup name..."
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
              />
            </div>

            {/* Setup Notes */}
            <div className="mb-6">
              <label htmlFor="setupNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="setupNotes"
                className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 resize-none"
                placeholder="Add notes about this setup..."
                value={setupNotes}
                onChange={(e) => setSetupNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Part Selection Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {PART_TYPES.map(({ key, type, label }) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {label}
                  </label>
                  <select
                    className="w-32 rounded-lg border-gray-300 text-sm px-2 py-2"
                    value={selectedParts[key]}
                    onChange={(e) => handlePartChange(key, e.target.value)}
                  >
                    <option value="">Select {label}</option>
                    {partsByType[type]?.map(part => (
                      <option key={part.id} value={part.id}>
                        {part.name} (Lv.{part.level})
                      </option>
                    ))}
                  </select>

                  {/* Bonus checkbox */}
                  {selectedParts[key] && (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={bonusParts.has(selectedParts[key])}
                        onChange={() => handleBonusToggle(selectedParts[key])}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-600">Bonus</span>
                    </label>
                  )}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveSetup}
              disabled={createSetup.isPending}
              className="w-full"
            >
              {createSetup.isPending ? 'Saving...' : 'Save Setup'}
            </Button>
          </Card>

          {/* Saved Setups */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Setups</h2>

            {setupsResponse?.data?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No setups saved yet</p>
            ) : (
              <div className="space-y-3">
                {setupsResponse?.data?.map(setup => (
                  <div key={setup.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{setup.name}</h3>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoadSetup(setup)}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSetup(setup.id)}
                          disabled={deleteSetup.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {setup.notes ? setup.notes.length > 128 ? `${setup.notes.substring(0, 128)}...` : setup.notes : 'No notes'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Single Card with Setup Name, Parts and Stats */}
        <div className="space-y-6">
          <Card className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{setupName.trim() || "(Unknown)"}</h2>

            {/* Parts Display - 3 columns of 2 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {PART_TYPES.map(({ key, label }) => {
                const partId = selectedParts[key]
                const part = carPartsResponse?.data?.find(p => p.id === partId)

                return (
                  <div key={key} className={`${part ? getRarityBackground(part.rarity) : 'bg-white border border-gray-200'} rounded-lg p-3`}>
                    <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
                    {part ? (
                      <div>
                        <div className="text-lg font-bold text-gray-900 mb-1">
                          {part.name}
                        </div>
                        <div className="text-sm text-gray-700">Lv.{part.level}</div>
                        {bonusParts.has(partId) && (
                          <div className="text-sm text-blue-600 font-medium mt-1">★ Bonus</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">Not selected</div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Stats Display - 3 rows with 2 columns each containing stat + value */}
            <div className="space-y-2">
              {/* Row 1: Speed + Power Unit */}
              <div className="grid grid-cols-2 gap-2">
                <div className="grid grid-cols-[3fr_1fr] gap-0">
                  <div className="bg-gray-600 text-white text-sm px-2 py-1 rounded-l text-left font-medium flex items-center">Speed</div>
                  <div className="bg-gray-900 text-white text-base px-0.5 py-1 rounded-r text-right font-semibold flex items-center justify-end">{totalStats.speed}</div>
                </div>
                <div className="grid grid-cols-[3fr_1fr] gap-0">
                  <div className="bg-gray-600 text-white text-sm px-2 py-1 rounded-l text-left font-medium flex items-center">Power Unit</div>
                  <div className="bg-gray-900 text-white text-base px-0.5 py-1 rounded-r text-right font-semibold flex items-center justify-end">{totalStats.powerUnit}</div>
                </div>
              </div>

              {/* Row 2: Cornering + Qualifying */}
              <div className="grid grid-cols-2 gap-2">
                <div className="grid grid-cols-[3fr_1fr] gap-0">
                  <div className="bg-gray-600 text-white text-sm px-2 py-1 rounded-l text-left font-medium flex items-center">Cornering</div>
                  <div className="bg-gray-900 text-white text-base px-0.5 py-1 rounded-r text-right font-semibold flex items-center justify-end">{totalStats.cornering}</div>
                </div>
                <div className="grid grid-cols-[3fr_1fr] gap-0">
                  <div className="bg-gray-600 text-white text-sm px-2 py-1 rounded-l text-left font-medium flex items-center">Qualifying</div>
                  <div className="bg-gray-900 text-white text-base px-0.5 py-1 rounded-r text-right font-semibold flex items-center justify-end">{totalStats.qualifying}</div>
                </div>
              </div>

              {/* Row 3: Avg Pit Stop + DRS */}
              <div className="grid grid-cols-2 gap-2">
                <div className="grid grid-cols-[3fr_1fr] gap-0">
                  <div className="bg-gray-600 text-white text-sm px-2 py-1 rounded-l text-left font-medium flex items-center">Avg Pit Stop</div>
                    <div className="bg-gray-900 text-white text-base px-0.5 py-1 rounded-r text-right font-semibold flex items-center justify-end">{totalStats.pitStopTime.toFixed(2)}s</div>
                </div>
                <div className="grid grid-cols-[3fr_1fr] gap-0">
                  <div className="bg-gray-600 text-white text-sm px-2 py-1 rounded-l text-left font-medium flex items-center">DRS</div>
                  <div className="bg-gray-900 text-white text-base px-0.5 py-1 rounded-r text-right font-semibold flex items-center justify-end">{totalStats.drs}</div>
                </div>
              </div>
            </div>

            {/* Notes Display */}
            {setupNotes.trim() && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{setupNotes}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function LoginPrompt() {
  return (
    <div className="text-center py-12">
      <Card className="p-8 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign in Required</h2>
        <p className="text-gray-600 mb-6">
          Please sign in to create and manage your car setups.
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

export default function SetupsPage() {
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

  // Show authenticated setups page if user is logged in
  return <AuthenticatedSetupsPage />
}
