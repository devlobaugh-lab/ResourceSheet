'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuthHeaders, useUserCarSetups } from '@/hooks/useApi'
import { useToast } from '@/components/ui/Toast'
import { Track, UserTrackGuide, DriverView, BoostView, UserCarSetupWithParts } from '@/types/database'
import { DriverSelectionGrid } from '@/components/DriverSelectionGrid'
import Link from 'next/link'
import { calculateHighestLevel, cn } from '@/lib/utils'

// Force dynamic rendering since this page requires authentication
export const dynamic = 'force-dynamic'

// GP level configuration
const GP_LEVELS = [
  { id: 0, name: 'Junior', color: 'bg-blue-100 text-blue-800', seriesMax: 3 },
  { id: 1, name: 'Challenger', color: 'bg-green-100 text-green-800', seriesMax: 6 },
  { id: 2, name: 'Contender', color: 'bg-yellow-100 text-yellow-800', seriesMax: 9 },
  { id: 3, name: 'Champion', color: 'bg-red-100 text-red-800', seriesMax: 12 }
]

// Helper function to capitalize stat names
const capitalizeStat = (stat: string): string => {
  // Handle camelCase stats (overtaking -> Overtaking, raceStart -> Race Start)
  return stat
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim() // Remove leading/trailing whitespace
}

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
}

// Get rarity background color for cells
const getRarityBackground = (rarity: number): string => {
  return rarity === 0 ? "bg-gray-300" :
         rarity === 1 ? "bg-blue-200" :
         rarity === 2 ? "bg-orange-300" :
         rarity === 3 ? "bg-purple-300" :
         rarity === 4 ? "bg-yellow-300" :
         rarity === 5 ? "bg-red-300" :
         rarity === 6 ? "bg-rose-400" : "bg-gray-300";
}

// Get boost value background color based on tier (1=blue, 2=green, 3=yellow, 4=orange, 5=red)
const getBoostValueColor = (tierValue: number): string => {
  return tierValue === 1 ? "bg-blue-200" :
         tierValue === 2 ? "bg-green-200" :
         tierValue === 3 ? "bg-yellow-200" :
         tierValue === 4 ? "bg-orange-200" :
         tierValue === 5 ? "bg-red-300" : "bg-gray-50";
}

export default function TrackGuideEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const trackId = params.id as string

  const [selectedGpLevel, setSelectedGpLevel] = useState(0)
  const [formData, setFormData] = useState<Partial<UserTrackGuide>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([])
  const [driverModalGpLevel, setDriverModalGpLevel] = useState(0)
  const [showBoostModal, setShowBoostModal] = useState(false)

  // Fetch user's saved car setups
  const { data: userSetupsResponse } = useUserCarSetups()
  const userSetups = userSetupsResponse?.data || []

  // Fetch free boosts for the dropdown
  const { data: freeBoosts = [] } = useQuery({
    queryKey: ['free-boosts'],
    queryFn: async () => {
      const response = await fetch('/api/boosts?is_free=true', {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return []
      const result = await response.json()
      return result.data || []
    }
  })

  // Fetch all boosts for the boost selection modal
  const { data: allBoosts = [], isLoading: boostsLoading } = useQuery({
    queryKey: ['all-boosts'],
    queryFn: async () => {
      const response = await fetch('/api/boosts?limit=100', {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return []
      const result = await response.json()
      return result.data || []
    },
    enabled: showBoostModal
  })

  // Fetch track details
  const { data: track, isLoading: trackLoading } = useQuery({
    queryKey: ['track', trackId],
    queryFn: async () => {
      const response = await fetch(`/api/tracks/${trackId}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) throw new Error('Track not found')
      return response.json()
    },
    enabled: !!trackId
  })

  // Fetch existing track guide for this track and GP level
  const { data: trackGuide, isLoading: guideLoading } = useQuery({
    queryKey: ['track-guide', trackId, selectedGpLevel],
    queryFn: async () => {
      const response = await fetch(`/api/track-guides?track_id=${trackId}&gp_level=${selectedGpLevel}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return null
      const result = await response.json()
      return result.data?.[0] || null
    }
  })

  // Fetch drivers for display and selection
  const { data: availableDrivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['drivers-for-gp', selectedGpLevel],
    queryFn: async () => {
      const response = await fetch(`/api/drivers/user?limit=100`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return []
      const result = await response.json()
      return result.data || []
    }
  })

  // Fetch driver details for selected drivers to ensure they're available immediately
  const { data: selectedDriverDetails = [], isLoading: driverDetailsLoading } = useQuery({
    queryKey: ['driver-details', formData.suggested_drivers],
    queryFn: async () => {
      if (!formData.suggested_drivers || formData.suggested_drivers.length === 0) {
        return []
      }
      
      const response = await fetch(`/api/drivers/user?limit=100`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return []
      const result = await response.json()
      const allDrivers = result.data || []
      
      // Filter to only include the selected drivers
      return allDrivers.filter((driver: DriverView) => 
        formData.suggested_drivers?.includes(driver.id)
      )
    },
    enabled: !!formData.suggested_drivers && formData.suggested_drivers.length > 0
  })

  // Update form data when track guide loads
  useEffect(() => {
    if (trackGuide) {
      setFormData(trackGuide)
    } else {
      // Reset form for new guide
      setFormData({
        track_id: trackId,
        gp_level: selectedGpLevel,
        suggested_drivers: [],
        suggested_boosts: [],
        dry_strategy: '',
        wet_strategy: '',
        notes: ''
      })
    }
  }, [trackGuide, trackId, selectedGpLevel])

  // Save track guide mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<UserTrackGuide>) => {
      const isUpdate = !!trackGuide
      const url = isUpdate ? `/api/track-guides/${trackGuide.id}` : '/api/track-guides'
      const method = isUpdate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          ...await getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to save track guide')
      }

      return response.json()
    },
    onSuccess: () => {
      // Removed toast message for auto-save during tab navigation
      queryClient.invalidateQueries({ queryKey: ['track-guides'] })
      queryClient.invalidateQueries({ queryKey: ['track-guide', trackId, selectedGpLevel] })
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    }
  })

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      track_id: trackId,
      gp_level: selectedGpLevel,
    }
    saveMutation.mutate(dataToSave)
  }

  const handleGpLevelChange = async (newGpLevel: number) => {
    // Only auto-save if there are changes to save
    if (selectedGpLevel !== newGpLevel) {
      // Check if we have any data to save (not just empty defaults)
      const hasDataToSave = formData.suggested_drivers?.length > 0 ||
                           formData.suggested_boosts?.length > 0 ||
                           formData.free_boost_id ||
                           formData.saved_setup_id ||
                           formData.setup_notes ||
                           formData.dry_strategy ||
                           formData.wet_strategy ||
                           formData.notes

      if (hasDataToSave) {
        setIsSaving(true)
        try {
          await new Promise<void>((resolve, reject) => {
            saveMutation.mutate({
              ...formData,
              track_id: trackId,
              gp_level: selectedGpLevel,
            }, {
              onSuccess: () => {
                setIsSaving(false)
                setSelectedGpLevel(newGpLevel)
                resolve()
              },
              onError: (error) => {
                setIsSaving(false)
                // Still switch tabs even if save fails, but show error
                setSelectedGpLevel(newGpLevel)
                addToast(`Failed to save changes: ${error.message}`, 'error')
                resolve()
              }
            })
          })
        } catch (error) {
          setIsSaving(false)
          setSelectedGpLevel(newGpLevel)
        }
      } else {
        // No data to save, just switch tabs
        setSelectedGpLevel(newGpLevel)
      }
    }
  }

  const handleSelectDrivers = () => {
    setDriverModalGpLevel(selectedGpLevel)
    setShowDriverModal(true)
  }

  const handleDriverSelection = (selectedDriverIds: string[]) => {
    setFormData(prev => ({ ...prev, suggested_drivers: selectedDriverIds }))
    setShowDriverModal(false)
  }

  const handleSelectBoosts = () => {
    setShowBoostModal(true)
  }

  const handleBoostSelection = (selectedBoostIds: string[]) => {
    setFormData(prev => ({ ...prev, suggested_boosts: selectedBoostIds }))
    setShowBoostModal(false)
  }

  const isLoading = trackLoading || guideLoading

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!track) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">Track not found</div>
              <Link href="/track-guides">
                <Button variant="outline">Back to Track Guides</Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {track.name} {track.alt_name && `(${track.alt_name})`}
                </h1>
                <p className="mt-2 text-gray-600">
                  Track Stats: {capitalizeStat(track.driver_track_stat)}, {capitalizeStat(track.car_track_stat)}
                </p>
              </div>
              <Link href="/track-guides">
                <Button variant="outline">Back to Track Guides</Button>
              </Link>
            </div>
          </div>

          {/* GP Level Tabs */}
          <Card className="p-6 mb-6">
            <div className="flex space-x-1 mb-6">
              {GP_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => handleGpLevelChange(level.id)}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGpLevel === level.id
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {level.name}
                  {isSaving && selectedGpLevel === level.id && (
                    <span className="ml-2 inline-flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-600">
              <strong>Current Level:</strong> {GP_LEVELS[selectedGpLevel].name} (Series ≤ {GP_LEVELS[selectedGpLevel].seriesMax})
            </div>
          </Card>

          {/* Track Guide Editor */}
          <div className="space-y-6">
            {/* Driver Selection Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Recommendations</h3>
              <div className="text-sm text-gray-600 mb-4">
                Select up to 4 drivers for this GP level (2 main + 2 alternates).
                Drivers are filtered by series and sorted by track performance.
              </div>
              
              {/* Display Selected Drivers */}
              {formData.suggested_drivers && formData.suggested_drivers.length > 0 ? (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Selected Drivers:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {formData.suggested_drivers.map((driverId: string, index: number) => {
                      // First try to find driver from selected driver details (faster)
                      let driver = selectedDriverDetails.find((d: DriverView) => d.id === driverId)
                      
                      // If not found in selected details, try available drivers
                      if (!driver) {
                        driver = availableDrivers.find((d: DriverView) => d.id === driverId)
                      }
                      
                      // If driver is still not found (still loading), show placeholder
                      if (!driver) {
                        return (
                          <div key={driverId} className="p-2 rounded-lg bg-gray-200">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-black">
                                {index + 1}. Loading...
                              </span>
                              <span className="text-sm text-black">
                                • Level 0
                              </span>
                              <span className="text-sm text-black">
                                • Unknown
                              </span>
                            </div>
                          </div>
                        )
                      }
                      
                      return (
                        <div key={driverId} className={`p-2 rounded-lg ${getRarityBackground(driver.rarity)}`}>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-black">
                              {index + 1}. {driver.name}
                            </span>
                            <span className="text-sm text-black">
                              • Level {driver.level}
                            </span>
                            <span className="text-sm text-black">
                              • {getRarityDisplay(driver.rarity)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">No drivers selected yet</div>
                </div>
              )}
              
              <Button variant="outline" className="w-full" onClick={handleSelectDrivers}>
                Select Drivers ({formData.suggested_drivers?.length || 0}/4)
              </Button>
            </Card>

            {/* Boost Recommendations Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Boost Recommendations</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free Boost Recommendation
                  </label>
                  <select
                    className="w-full rounded-lg border-gray-300"
                    value={formData.free_boost_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, free_boost_id: e.target.value || undefined }))}
                  >
                    <option value="">Select a free boost...</option>
                    {freeBoosts.map((boost: any) => (
                      <option key={boost.id} value={boost.id}>
                        {boost.boost_custom_names?.custom_name || boost.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Boost Recommendations
                  </label>
                  <Button variant="outline" className="w-full" onClick={handleSelectBoosts}>
                    Select Boosts ({formData.suggested_boosts?.length || 0} selected)
                  </Button>
                </div>
              </div>
            </Card>

            {/* Car Setup Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Car Setup</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saved Setup (Optional)
                  </label>
                  <select
                    className="w-full rounded-lg border-gray-300"
                    value={formData.saved_setup_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, saved_setup_id: e.target.value || undefined }))}
                  >
                    <option value="">Select a saved setup...</option>
                    {userSetups.map((setup) => (
                      <option key={setup.id} value={setup.id}>
                        {setup.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setup Notes
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-300"
                    rows={3}
                    placeholder="Track-specific setup changes..."
                    value={formData.setup_notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, setup_notes: e.target.value }))}
                  />
                </div>
              </div>
            </Card>

            {/* Tire Strategy Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tire Strategies</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dry Conditions Strategy
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-300"
                    rows={2}
                    placeholder="e.g., 3m3m2s (3 laps medium, 3 laps medium, 2 laps soft)"
                    value={formData.dry_strategy || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dry_strategy: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wet Conditions Strategy
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-300"
                    rows={2}
                    placeholder="e.g., 10w (all wet tires)"
                    value={formData.wet_strategy || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, wet_strategy: e.target.value }))}
                  />
                </div>
              </div>
            </Card>

            {/* Notes Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
              <textarea
                className="w-full rounded-lg border-gray-300"
                rows={4}
                placeholder="Any additional notes about this track..."
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="px-8"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Track Guide'}
              </Button>
            </div>
          </div>

          {/* Driver Selection Modal */}
          {showDriverModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Select Drivers - {GP_LEVELS[driverModalGpLevel].name} GP
                    </h2>
                    <button
                      onClick={() => setShowDriverModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Choose up to 4 drivers for this GP level. Drivers are sorted by their {capitalizeStat(track?.driver_track_stat || 'overtaking')} stat.
                  </p>
                </div>

                <div className="px-4 py-2 overflow-y-auto max-h-[60vh]">
                  {driversLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <DriverSelectionGrid
                      drivers={availableDrivers}
                      selectedDriverIds={formData.suggested_drivers || []}
                      onDriverSelectionChange={(selectedDriverIds) => {
                        setFormData(prev => ({ ...prev, suggested_drivers: selectedDriverIds }))
                      }}
                      trackStat={track?.driver_track_stat || 'overtaking'}
                      maxSeries={GP_LEVELS[driverModalGpLevel].seriesMax}
                      initialShowHighestLevel={false}
                      maxSelectable={4}
                    />
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        Selected: {formData.suggested_drivers?.length || 0}/4 drivers
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, suggested_drivers: [] }))}
                        disabled={!formData.suggested_drivers?.length}
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowDriverModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => setShowDriverModal(false)}
                        disabled={!formData.suggested_drivers?.length}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boost Selection Modal */}
          {showBoostModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Select Recommended Boosts
                    </h2>
                    <button
                      onClick={() => setShowBoostModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>
                </div>

                <div className="px-4 py-2 overflow-y-auto max-h-[60vh]">
                  {boostsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="overflow-auto bg-white rounded-lg border border-gray-200 w-fit max-h-[50vh]">
                      <table className="table divide-y divide-gray-200">
                        <thead className="bg-gray-700 sticky top-0 z-10">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                              <div className="flex items-center">Name</div>
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                              <div className="flex items-center">Amount</div>
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                              <div className="flex items-center">Defend</div>
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                              <div className="flex items-center">Overtake</div>
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                              <div className="flex items-center">Corners</div>
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                              <div className="flex items-center">Tyre Use</div>
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                              <div className="flex items-center">Power Unit</div>
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                              <div className="flex items-center">Speed</div>
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                              <div className="flex items-center">Pit Stop</div>
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                              <div className="flex items-center">Race Start</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allBoosts
                            .sort((a: any, b: any) => {
                              const aStats = a.boost_stats || {}
                              const bStats = b.boost_stats || {}
                              
                              // Map track stat names to boost stat names
                              const statMap: Record<string, string> = {
                                'overtaking': 'overtake',
                                'defending': 'block',
                                'defend': 'block',
                                'corners': 'corners',
                                'tyre_use': 'tyre_use',
                                'power_unit': 'power_unit',
                                'powerUnit': 'power_unit',
                                'speed': 'speed',
                                'pit_stop': 'pit_stop',
                                'pitStop': 'pit_stop',
                                'race_start': 'race_start',
                                'raceStart': 'race_start'
                              }
                              
                              // Primary sort: track's driver stat (mapped to boost stat)
                              const trackDriverStat = track?.driver_track_stat || 'block'
                              const boostDriverStat = statMap[trackDriverStat] || trackDriverStat
                              const aDriverStat = aStats[boostDriverStat] || 0
                              const bDriverStat = bStats[boostDriverStat] || 0
                              
                              if (aDriverStat !== bDriverStat) {
                                return bDriverStat - aDriverStat // Descending order
                              }
                              
                              // Secondary sort: track's car stat (mapped to boost stat)
                              const trackCarStat = track?.car_track_stat || 'speed'
                              const boostCarStat = statMap[trackCarStat] || trackCarStat
                              const aCarStat = aStats[boostCarStat] || 0
                              const bCarStat = bStats[boostCarStat] || 0
                              
                              if (aCarStat !== bCarStat) {
                                return bCarStat - aCarStat // Descending order
                              }
                              
                              // Tertiary sort: boost name (using custom name → icon → name priority, with BoostIcon_ prefix removed)
                              const aName = a.boost_custom_names?.custom_name || (a.icon ? a.icon.replace('BoostIcon_', '') : null) || a.name
                              const bName = b.boost_custom_names?.custom_name || (b.icon ? b.icon.replace('BoostIcon_', '') : null) || b.name
                              return aName.localeCompare(bName)
                            })
                            .map((boost: any) => {
                              const isSelected = formData.suggested_boosts?.includes(boost.id)
                              const boostStats = boost.boost_stats || {}

                              return (
                                <tr
                                  key={boost.id}
                                  className={cn(
                                    'hover:bg-gray-50 transition-colors',
                                    isSelected && 'bg-blue-50'
                                  )}
                                  onClick={() => {
                                    const currentSelected = formData.suggested_boosts || []
                                    let newSelected: string[]

                                    if (isSelected) {
                                      newSelected = currentSelected.filter((id: string) => id !== boost.id)
                                    } else {
                                      newSelected = [...currentSelected, boost.id]
                                    }

                                    setFormData(prev => ({ ...prev, suggested_boosts: newSelected }))
                                  }}
                                >
                                  {/* Name Column */}
                                  <td className="px-3 py-1 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {}} // Handled by onClick
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-2"
                                      />
                                      <div className="text-sm font-medium text-gray-900">
                                        {boost.boost_custom_names?.custom_name || (boost.icon ? boost.icon.replace('BoostIcon_', '') : null) || boost.name}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Amount Column */}
                                  <td className="px-3 py-1 whitespace-nowrap text-center">
                                    <div className="text-sm text-gray-900">{boost.card_count || 0}</div>
                                  </td>

                                  {/* Stat Columns with color coding */}
                                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", boostStats.block > 0 && getBoostValueColor(boostStats.block))}>
                                    <div className="text-sm font-medium">{boostStats.block ? boostStats.block * 5 : ''}</div>
                                  </td>
                                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", boostStats.overtake > 0 && getBoostValueColor(boostStats.overtake))}>
                                    <div className="text-sm font-medium">{boostStats.overtake ? boostStats.overtake * 5 : ''}</div>
                                  </td>
                                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", boostStats.corners > 0 && getBoostValueColor(boostStats.corners))}>
                                    <div className="text-sm font-medium">{boostStats.corners ? boostStats.corners * 5 : ''}</div>
                                  </td>
                                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", boostStats.tyre_use > 0 && getBoostValueColor(boostStats.tyre_use))}>
                                    <div className="text-sm font-medium">{boostStats.tyre_use ? boostStats.tyre_use * 5 : ''}</div>
                                  </td>
                                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", boostStats.power_unit > 0 && getBoostValueColor(boostStats.power_unit))}>
                                    <div className="text-sm font-medium">{boostStats.power_unit ? boostStats.power_unit * 5 : ''}</div>
                                  </td>
                                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", boostStats.speed > 0 && getBoostValueColor(boostStats.speed))}>
                                    <div className="text-sm font-medium">{boostStats.speed ? boostStats.speed * 5 : ''}</div>
                                  </td>
                                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", boostStats.pit_stop > 0 && getBoostValueColor(boostStats.pit_stop))}>
                                    <div className="text-sm font-medium">{boostStats.pit_stop ? boostStats.pit_stop * 5 : ''}</div>
                                  </td>
                                  <td className={cn("px-3 py-1 whitespace-nowrap text-center", boostStats.race_start > 0 && getBoostValueColor(boostStats.race_start))}>
                                    <div className="text-sm font-medium">{boostStats.race_start ? boostStats.race_start * 5 : ''}</div>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>

                      {/* Empty State */}
                      {allBoosts.filter((boost: any) => !boost.is_free).length === 0 && (
                        <div className="text-center py-12">
                          <div className="text-gray-500 text-lg mb-2">No boosts found</div>
                          <div className="text-gray-400 text-sm">
                            Try adjusting your search or filter criteria
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        Selected: {formData.suggested_boosts?.length || 0} boosts
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, suggested_boosts: [] }))}
                        disabled={!formData.suggested_boosts?.length}
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowBoostModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => setShowBoostModal(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
