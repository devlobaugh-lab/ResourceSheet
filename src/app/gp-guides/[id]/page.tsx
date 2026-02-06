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

export default function GPGuideEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const guideId = params.id as string

  const [formData, setFormData] = useState<Partial<GPGuide>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedTrackForImport, setSelectedTrackForImport] = useState<string | null>(null)
  const [importGPLevel, setImportGPLevel] = useState(0)
  const [trackCondition, setTrackCondition] = useState('unknown')
  
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
    }
  })

  // Fetch GP guide data
  const { data: gpGuide, isLoading: guideLoading } = useQuery({
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

  // Fetch tracks for import modal
  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const response = await fetch('/api/tracks', {
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
    queryKey: ['drivers-for-gp', importGPLevel],
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

  // Update form data when GP guide loads
  useEffect(() => {
    if (gpGuide) {
      setFormData(gpGuide)
      // Reset dirty state when loading existing guide
      setIsDirty(false)
    } else {
      // Reset form for new guide
      setFormData({
        name: '',
        start_date: null,
        gp_level: 0,
        boosted_assets: null,
        reward_bonus: null,
      })
      // Reset dirty state for new guide
      setIsDirty(false)
    }
  }, [gpGuide])

  // Track form changes to set dirty state
  useEffect(() => {
    if (gpGuide) {
      // Compare current form data with saved guide data
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(gpGuide)
      setIsDirty(hasChanges)
    } else {
      // For new guides, check if form has any data
      const hasData = Object.values(formData).some(value => {
        if (value === null || value === undefined) return false
        if (typeof value === 'string') return value.trim() !== ''
        if (Array.isArray(value)) return value.length > 0
        return true
      })
      setIsDirty(hasData)
    }
  }, [formData, gpGuide])

  // Save GP guide mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<GPGuide>) => {
      const isUpdate = !!gpGuide
      const url = isUpdate ? `/api/gp-guides/${gpGuide.id}` : '/api/gp-guides'
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
        throw new Error(errorData.error?.message || 'Failed to save GP guide')
      }

      return response.json()
    },
    onSuccess: () => {
      addToast('GP guide saved successfully', 'success')
      queryClient.invalidateQueries({ queryKey: ['gp-guide', guideId] })
      queryClient.invalidateQueries({ queryKey: ['gp-guides'] })
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    }
  })

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      name: formData.name || '',
      gp_level: formData.gp_level || 0,
    }
    saveMutation.mutate(dataToSave)
  }

  const handleSelectDrivers = () => {
    setShowDriverModal(true)
  }

  const handleSelectBoosts = () => {
    setShowBoostModal(true)
  }

  const handleImportTrack = () => {
    setShowImportModal(true)
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

  const handleImportTrackConfirm = async () => {
    if (!selectedTrackForImport) {
      addToast('Please select a track to import', 'error')
      return
    }

    try {
      const response = await fetch(`/api/gp-guides/${guideId}/import-track`, {
        method: 'POST',
        headers: {
          ...await getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          track_id: selectedTrackForImport,
          source_gp_level: importGPLevel,
          track_condition: trackCondition
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to import track')
      }

      const result = await response.json()
      addToast('Track imported successfully', 'success')
      setShowImportModal(false)
      setSelectedTrackForImport(null)
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['gp-guide', guideId] })
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to import track', 'error')
    }
  }

  if (guideLoading) {
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

  if (!gpGuide) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">GP guide not found</div>
              <Link href="/gp-guides">
                <Button variant="outline">Back to GP Guides</Button>
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
        <div className="max-w-7xl mx-auto py-0 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {formData.name || 'New GP Guide'}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={GP_LEVELS[formData.gp_level || 0].color}>
                    {GP_LEVELS[formData.gp_level || 0].name}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : 'No date set'}
                  </span>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending || !isDirty}
                  className="px-4 mx-4"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Guide'}
                </Button>
                <Link href="/gp-guides">
                  <Button variant="outline">Back to GP Guides</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Layout - 2 Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* GP Guide Details Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">GP Guide Details</h3>
              
              <div className="space-y-4">
                {/* GP Level Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    GP Level
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {GP_LEVELS.map(level => (
                      <Button
                        key={level.id}
                        variant={formData.gp_level === level.id ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, gp_level: level.id }))}
                        className="text-sm"
                      >
                        {level.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border-gray-300"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value || null }))}
                  />
                </div>

                {/* Boosted Assets */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Boosted Assets (JSON)
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-300"
                    rows={3}
                    placeholder='{"drivers": ["driver_id_1"], "parts": ["part_id_1"]}'
                    value={formData.boosted_assets ? JSON.stringify(formData.boosted_assets, null, 2) : ''}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value)
                        setFormData(prev => ({ ...prev, boosted_assets: parsed }))
                      } catch {
                        setFormData(prev => ({ ...prev, boosted_assets: null }))
                      }
                    }}
                  />
                </div>

                {/* Reward Bonus */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Reward Bonus (JSON)
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-300"
                    rows={3}
                    placeholder='{"type": "race_points", "amount": 5, "requirement": "Norris rare lvl3+"}'
                    value={formData.reward_bonus ? JSON.stringify(formData.reward_bonus, null, 2) : ''}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value)
                        setFormData(prev => ({ ...prev, reward_bonus: parsed }))
                      } catch {
                        setFormData(prev => ({ ...prev, reward_bonus: null }))
                      }
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Actions Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
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
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleImportTrack}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Track
                  </Button>
                  
                  <Link href={`/gp-guides/${guideId}/results`} className="w-full">
                    <Button variant="outline" className="w-full">
                      <Timer className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </Link>
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
              </div>
            </Card>
          </div>

          {/* Tracks Section */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tracks</h3>
              <span className="text-sm text-gray-600">
                {gpGuide.gp_guide_tracks?.length || 0} tracks configured
              </span>
            </div>

            {gpGuide.gp_guide_tracks && gpGuide.gp_guide_tracks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Track
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Drivers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Strategy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gpGuide.gp_guide_tracks.map((track: GPGuideTrack) => (
                      <tr key={track.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {track.tracks?.name || 'Unknown Track'}
                            </div>
                            {track.tracks?.alt_name && (
                              <div className="text-sm text-gray-500">
                                {track.tracks.alt_name}
                              </div>
                            )}
                            {track.tracks && (
                              <div className="text-xs text-gray-400">
                                {track.tracks.laps} laps • {capitalizeStat(track.tracks.driver_track_stat)} / {capitalizeStat(track.tracks.car_track_stat)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={
                            track.track_condition === 'dry' ? 'bg-orange-100 text-orange-800' :
                            track.track_condition === 'wet' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {track.track_condition?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {track.driver_1_id ? findDriver(track.driver_1_id)?.name : 'No driver 1'}
                          </div>
                          <div className="text-sm text-gray-900">
                            {track.driver_2_id ? findDriver(track.driver_2_id)?.name : 'No driver 2'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {track.driver_1_strategy || 'No strategy'}
                          </div>
                          <div className="text-sm text-gray-900">
                            {track.driver_2_strategy || 'No strategy'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/gp-guides/${guideId}/tracks/${track.id}`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">No tracks configured yet</div>
                <div className="text-gray-400 mb-4">
                  Import tracks from your existing track guides or add them manually.
                </div>
                <Button variant="outline" onClick={handleImportTrack}>
                  Import Tracks
                </Button>
              </div>
            )}
          </Card>

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
                      trackStat="overtaking"
                      maxSeries={GP_LEVELS[formData.gp_level || 0].seriesMax}
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
                              const trackDriverStat = 'block' // Default for GP guides
                              const boostDriverStat = trackDriverStat
                              const aDriverStat = aStats[boostDriverStat] || 0
                              const bDriverStat = bStats[boostDriverStat] || 0
                              
                              if (aDriverStat !== bDriverStat) {
                                return bDriverStat - aDriverStat // Descending order
                              }
                              
                              // Secondary sort: track's car stat (mapped to boost stat)
                              const trackCarStat = 'speed' // Default for GP guides
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

          {/* Import Track Modal */}
          {showImportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Import Track from Track Guide
                    </h2>
                    <button
                      onClick={() => setShowImportModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* GP Level Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Source GP Level
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {GP_LEVELS.map(level => (
                        <Button
                          key={level.id}
                          variant={importGPLevel === level.id ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setImportGPLevel(level.id)}
                          className="text-sm"
                        >
                          {level.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Track Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Select Track
                    </label>
                    <select
                      className="w-full rounded-lg border-gray-300"
                      value={selectedTrackForImport || ''}
                      onChange={(e) => setSelectedTrackForImport(e.target.value)}
                    >
                      <option value="">Select a track...</option>
                      {tracks.map((track: any) => (
                        <option key={track.id} value={track.id}>
                          {track.name} {track.alt_name && `(${track.alt_name})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Track Condition Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Track Condition
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TRACK_CONDITIONS.map(condition => (
                        <Button
                          key={condition.value}
                          variant={trackCondition === condition.value ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setTrackCondition(condition.value)}
                          className="text-sm"
                        >
                          {condition.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Import Preview */}
                  {selectedTrackForImport && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 mb-1">Import Preview:</div>
                      <div className="text-sm text-gray-600">
                        Track: {tracks.find(t => t.id === selectedTrackForImport)?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Source Level: {GP_LEVELS[importGPLevel].name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Condition: {TRACK_CONDITIONS.find(c => c.value === trackCondition)?.label || 'Unknown'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setShowImportModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleImportTrackConfirm}
                      disabled={!selectedTrackForImport}
                    >
                      Import Track
                    </Button>
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