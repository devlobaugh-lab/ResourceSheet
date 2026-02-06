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
import { useDriverLookup } from '@/hooks/useDriverLookup'
import { GPGuide, GPGuideTrack, DriverView, BoostView, UserCarSetupWithParts } from '@/types/database'
import { DriverSelectionGrid } from '@/components/DriverSelectionGrid'
import { DriverDisplay } from '@/components/DriverDisplay'
import Link from 'next/link'
import { calculateHighestLevel, cn } from '@/lib/utils'
import { getRarityBackground, getRarityDisplay } from '@/lib/utils'
import { Shield, ArrowUpRight, Signal, Car, Gauge, ArrowRight, Zap, Timer, AlertTriangle, Pencil, Plus, Trash2, Save, Upload } from 'lucide-react'
import { BoostDisplay } from '@/components/BoostDisplay'

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
  return stat
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

// Get boost value background color based on tier
const getBoostValueColor = (tierValue: number): string => {
  return tierValue === 1 ? "bg-blue-200" :
         tierValue === 2 ? "bg-green-200" :
         tierValue === 3 ? "bg-yellow-200" :
         tierValue === 4 ? "bg-orange-200" :
         tierValue === 5 ? "bg-red-300" : "bg-gray-50";
}

// Track condition options
const TRACK_CONDITIONS = [
  { value: 'unknown', label: 'Unknown', color: 'bg-gray-100 text-gray-800' },
  { value: 'dry', label: 'Dry', color: 'bg-orange-100 text-orange-800' },
  { value: 'wet', label: 'Wet', color: 'bg-blue-100 text-blue-800' }
]

export default function GPGuideTrackPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const guideId = params.id as string
  const trackId = params.trackId as string

  const [formData, setFormData] = useState<Partial<GPGuideTrack>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showBoostModal, setShowBoostModal] = useState(false)
  
  // Fetch GP guide data to get the level
  const { data: gpGuide } = useQuery({
    queryKey: ['gp-guide', guideId],
    queryFn: async () => {
      const response = await fetch(`/api/gp-guides/${guideId}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) throw new Error('GP guide not found')
      return response.json()
    },
    enabled: !!guideId
  })

  // Fetch track data
  const { data: trackData, isLoading: trackLoading } = useQuery({
    queryKey: ['gp-guide-track', guideId, trackId],
    queryFn: async () => {
      const response = await fetch(`/api/gp-guides/${guideId}/tracks/${trackId}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) throw new Error('Track not found')
      return response.json()
    },
    enabled: !!guideId && !!trackId
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
    }
  })

  // Fetch drivers for display and selection
  const { data: availableDrivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['drivers-for-gp', gpGuide?.gp_level],
    queryFn: async () => {
      const response = await fetch(`/api/drivers/user?limit=100`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return []
      const result = await response.json()
      return result.data || []
    },
    enabled: !!gpGuide?.gp_level
  })

  // Fetch driver details for selected drivers
  const { data: selectedDriverDetails = [], isLoading: driverDetailsLoading } = useQuery({
    queryKey: ['driver-details', formData.driver_1_id, formData.driver_2_id],
    queryFn: async () => {
      if (!formData.driver_1_id && !formData.driver_2_id) {
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
        (formData.driver_1_id && driver.id === formData.driver_1_id) ||
        (formData.driver_2_id && driver.id === formData.driver_2_id)
      )
    },
    enabled: !!formData.driver_1_id || !!formData.driver_2_id
  })

  // Use the driver lookup hook for optimized driver finding
  const { findDriver } = useDriverLookup({
    selectedDriverDetails,
    availableDrivers
  })

  // Update form data when track data loads
  useEffect(() => {
    if (trackData) {
      setFormData(trackData)
      // Reset dirty state when loading existing track
      setIsDirty(false)
    } else {
      // Reset form for new track
      setFormData({
        gp_guide_id: guideId,
        track_id: trackId,
        race_number: null,
        race_type: null,
        track_condition: 'unknown',
        driver_1_id: null,
        driver_2_id: null,
        driver_1_boost_id: null,
        driver_2_boost_id: null,
        driver_1_strategy: null,
        driver_2_strategy: null,
        setup_notes: null,
        notes: null,
      })
      // Reset dirty state for new track
      setIsDirty(false)
    }
  }, [trackData, guideId, trackId])

  // Track form changes to set dirty state
  useEffect(() => {
    if (trackData) {
      // Compare current form data with saved track data
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(trackData)
      setIsDirty(hasChanges)
    } else {
      // For new tracks, check if form has any data
      const hasData = Object.values(formData).some(value => {
        if (value === null || value === undefined) return false
        if (typeof value === 'string') return value.trim() !== ''
        if (Array.isArray(value)) return value.length > 0
        return true
      })
      setIsDirty(hasData)
    }
  }, [formData, trackData])

  // Save track mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<GPGuideTrack>) => {
      const isUpdate = !!trackData
      const url = isUpdate ? `/api/gp-guides/${guideId}/tracks/${trackId}` : `/api/gp-guides/${guideId}/tracks`
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
        throw new Error(errorData.error?.message || 'Failed to save track')
      }

      return response.json()
    },
    onSuccess: () => {
      addToast('Track saved successfully', 'success')
      queryClient.invalidateQueries({ queryKey: ['gp-guide', guideId] })
      queryClient.invalidateQueries({ queryKey: ['gp-guide-track', guideId, trackId] })
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    }
  })

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      gp_guide_id: guideId,
      track_id: trackId,
    }
    saveMutation.mutate(dataToSave)
  }

  const handleSelectDrivers = () => {
    setShowDriverModal(true)
  }

  const handleSelectBoosts = () => {
    setShowBoostModal(true)
  }

  const handleDriverSelection = (selectedDriverIds: string[]) => {
    setFormData(prev => ({ 
      ...prev, 
      driver_1_id: selectedDriverIds[0] || null,
      driver_2_id: selectedDriverIds[1] || null
    }))
    setShowDriverModal(false)
  }

  const handleBoostSelection = (selectedBoostIds: string[]) => {
    setFormData(prev => ({ ...prev, suggested_boosts: selectedBoostIds }))
    setShowBoostModal(false)
  }

  if (trackLoading) {
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

  if (!trackData && !gpGuide) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">Track not found</div>
              <Link href={`/gp-guides/${guideId}`}>
                <Button variant="outline">Back to GP Guide</Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const track = trackData?.tracks || null
  const currentGPLevel = gpGuide?.gp_level || 0

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-0 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {track?.name || 'Track Details'}
                </h1>
                {track?.alt_name && (
                  <div className="text-gray-600 text-lg">{track.alt_name}</div>
                )}
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={GP_LEVELS[currentGPLevel].color}>
                    {GP_LEVELS[currentGPLevel].name}
                  </Badge>
                  {track && (
                    <div className="text-sm text-gray-600">
                      {track.laps} laps • {capitalizeStat(track.driver_track_stat)} / {capitalizeStat(track.car_track_stat)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending || !isDirty}
                  className="px-4 mx-4"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Track'}
                </Button>
                <Link href={`/gp-guides/${guideId}`}>
                  <Button variant="outline">Back to GP Guide</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Layout - 2 Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Track Details Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Track Configuration</h3>
              
              <div className="space-y-4">
                {/* Track Condition */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Track Condition
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TRACK_CONDITIONS.map(condition => (
                      <Button
                        key={condition.value}
                        variant={formData.track_condition === condition.value ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, track_condition: condition.value }))}
                        className="text-sm"
                      >
                        {condition.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Race Number */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Race Number
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border-gray-300"
                    value={formData.race_number || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, race_number: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                </div>

                {/* Race Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Race Type
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-300"
                    placeholder="e.g., Qualifying, Race, Sprint"
                    value={formData.race_type || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, race_type: e.target.value || null }))}
                  />
                </div>

                {/* Setup Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Setup Notes
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-300"
                    rows={3}
                    placeholder="Notes about car setup for this track..."
                    value={formData.setup_notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, setup_notes: e.target.value || null }))}
                  />
                </div>

                {/* General Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    General Notes
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-300"
                    rows={3}
                    placeholder="Additional notes about this track..."
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value || null }))}
                  />
                </div>
              </div>
            </Card>

            {/* Driver & Boost Configuration Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver & Boost Configuration</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSelectDrivers}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Select Drivers
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSelectBoosts}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Select Boosts
                  </Button>
                </div>

                {/* Selected Drivers */}
                {(formData.driver_1_id || formData.driver_2_id) && (
                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Selected Drivers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DriverDisplay
                        driver={formData.driver_1_id ? findDriver(formData.driver_1_id) : null}
                        isLoading={driversLoading}
                        placeholderText="No driver 1 selected"
                      />
                      <DriverDisplay
                        driver={formData.driver_2_id ? findDriver(formData.driver_2_id) : null}
                        isLoading={driversLoading}
                        placeholderText="No driver 2 selected"
                      />
                    </div>
                  </div>
                )}

                {/* Driver Strategies */}
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Driver Strategies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Driver 1 Strategy
                      </label>
                      <textarea
                        className="w-full rounded-lg border-gray-300"
                        rows={2}
                        placeholder="Strategy for driver 1..."
                        value={formData.driver_1_strategy || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, driver_1_strategy: e.target.value || null }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Driver 2 Strategy
                      </label>
                      <textarea
                        className="w-full rounded-lg border-gray-300"
                        rows={2}
                        placeholder="Strategy for driver 2..."
                        value={formData.driver_2_strategy || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, driver_2_strategy: e.target.value || null }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Driver Selection Modal */}
          {showDriverModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Select Drivers
                    </h2>
                    <button
                      onClick={() => setShowDriverModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>
                </div>

                <div className="px-4 py-2 overflow-y-auto max-h-[60vh]">
                  {driversLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <DriverSelectionGrid
                      drivers={availableDrivers}
                      selectedDriverIds={[(formData.driver_1_id as string) || '', (formData.driver_2_id as string) || ''].filter(Boolean)}
                      onDriverSelectionChange={(selectedDriverIds) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          driver_1_id: selectedDriverIds[0] || null,
                          driver_2_id: selectedDriverIds[1] || null
                        }))
                      }}
                      trackStat={track?.driver_track_stat || 'overtaking'}
                      maxSeries={GP_LEVELS[currentGPLevel].seriesMax}
                      initialShowHighestLevel={false}
                      maxSelectable={2}
                      singleSelect={false}
                    />
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        Selected: {[(formData.driver_1_id as string) || '', (formData.driver_2_id as string) || ''].filter(Boolean).length}/2
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, driver_1_id: null, driver_2_id: null }))}
                        disabled={!formData.driver_1_id && !formData.driver_2_id}
                      >
                        Clear Selection
                      </Button>
                    </div>
                    <div className="space-x-3">
                      <Button
                        onClick={() => setShowDriverModal(false)}
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
                      Select Boosts
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
                            .slice() // Create a copy to avoid mutating the original array
                            .sort((a: any, b: any) => {
                              const aStats = a.boost_stats || {}
                              const bStats = b.boost_stats || {}
                              
                              // Primary sort: track's driver stat (mapped to boost stat)
                              const trackDriverStat = track?.driver_track_stat || 'block'
                              const boostDriverStat = trackDriverStat === 'overtaking' ? 'overtake' : trackDriverStat
                              const aDriverStat = aStats[boostDriverStat] || 0
                              const bDriverStat = bStats[boostDriverStat] || 0
                              
                              if (aDriverStat !== bDriverStat) {
                                return bDriverStat - aDriverStat // Descending order
                              }
                              
                              // Secondary sort: track's car stat (mapped to boost stat)
                              const trackCarStat = track?.car_track_stat || 'speed'
                              const boostCarStat = trackCarStat
                              const aCarStat = aStats[boostCarStat] || 0
                              const bCarStat = bStats[boostCarStat] || 0
                              
                              if (aCarStat !== bCarStat) {
                                return bCarStat - aCarStat // Descending order
                              }
                              
                              // Tertiary sort: boost name
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
                                  onClick={(e) => {
                                    // Prevent checkbox click from interfering with row click
                                    e.stopPropagation()
                                    
                                    const currentSelected = formData.suggested_boosts || []
                                    let newSelected: string[]

                                    if (isSelected) {
                                      // Toggle off: remove the boost from selection
                                      newSelected = currentSelected.filter((id: string) => id !== boost.id)
                                    } else {
                                      // Toggle on: add the boost to selection
                                      newSelected = [...currentSelected, boost.id]
                                    }

                                    // Force state update with a new array reference
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      suggested_boosts: [...newSelected] 
                                    }))
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
                        Selected: {formData.suggested_boosts?.length || 0}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, suggested_boosts: [] }))}
                        disabled={!formData.suggested_boosts?.length}
                      >
                        Clear Selection
                      </Button>
                    </div>
                    <div className="space-x-3">
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