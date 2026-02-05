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
import { Track, UserTrackGuide, DriverView, BoostView, UserCarSetupWithParts } from '@/types/database'
import { DriverSelectionGrid } from '@/components/DriverSelectionGrid'
import { DriverDisplay } from '@/components/DriverDisplay'
import Link from 'next/link'
import { calculateHighestLevel, cn } from '@/lib/utils'
import { getRarityBackground, getRarityDisplay } from '@/lib/utils'
import { Shield, ArrowUpRight, Signal, Car, Gauge, ArrowRight, Zap, Timer, AlertTriangle, Pencil } from 'lucide-react'

// New - imported components for boost stats and editable fields
import { BoostStatsDisplay } from '@/components/BoostStatsDisplay'
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
  // Handle camelCase stats (overtaking -> Overtaking, raceStart -> Race Start)
  return stat
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim() // Remove leading/trailing whitespace
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
  const [isDirty, setIsDirty] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [driverModalGpLevel, setDriverModalGpLevel] = useState(0)
  // const [driverSelectionMode, setDriverSelectionMode] = useState<'recommended' | 'alternate'>('recommended')
  const [driverSelectionMode, setDriverSelectionMode] = useState<'driver1' | 'driver2' | 'alternate'>('alternate')
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [showDriver1BoostModal, setShowDriver1BoostModal] = useState(false)
  const [showDriver2BoostModal, setShowDriver2BoostModal] = useState(false)
  const [alternateDrivers, setAlternateDrivers] = useState<string[]>([])
  
  const [driver1DryStrategy, setDriver1DryStrategy] = useState('')
  const [driver2DryStrategy, setDriver2DryStrategy] = useState('')
  const [driver1WetStrategy, setDriver1WetStrategy] = useState('')
  const [driver2WetStrategy, setDriver2WetStrategy] = useState('')
  const [driver_1_id, setDriver_1_id] = useState('')
  const [driver_2_id, setDriver_2_id] = useState('')
  const [driver_1_boost_id, setDriver_1_boost_id] = useState<string | null>(null)
  const [driver_2_boost_id, setDriver_2_boost_id] = useState<string | null>(null)

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

  // Use the driver lookup hook for optimized driver finding
  const { findDriver } = useDriverLookup({
    selectedDriverDetails,
    availableDrivers
  })

  // start section holding imported code from new page
  // New - Fetch driver details for selected drivers
  const { data: selectedDriver1Details = null } = useQuery({
    queryKey: ['driver-details', formData.driver_1_id],
    queryFn: async () => {
      if (!formData.driver_1_id) return null
      const response = await fetch(`/api/drivers/user?limit=100`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return null
      const result = await response.json()
      const allDrivers = result.data || []
      return allDrivers.find((d: DriverView) => d.id === formData.driver_1_id) || null
    },
    enabled: !!formData.driver_1_id
  })

  const { data: selectedDriver2Details = null } = useQuery({
    queryKey: ['driver-details', formData.driver_2_id],
    queryFn: async () => {
      if (!formData.driver_2_id) return null
      const response = await fetch(`/api/drivers/user?limit=100`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return null
      const result = await response.json()
      const allDrivers = result.data || []
      return allDrivers.find((d: DriverView) => d.id === formData.driver_2_id) || null
    },
    enabled: !!formData.driver_2_id
  })

  // New - Fetch boost details for selected boosts
  const { data: selectedDriver1BoostDetails = null } = useQuery({
    queryKey: ['boost-details', formData.driver_1_boost_id],
    queryFn: async () => {
      if (!formData.driver_1_boost_id) return null
      const response = await fetch(`/api/boosts?limit=100`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return null
      const result = await response.json()
      const allBoosts = result.data || []
      return allBoosts.find((b: BoostView) => b.id === formData.driver_1_boost_id) || null
    },
    enabled: !!formData.driver_1_boost_id
  })

  const { data: selectedDriver2BoostDetails = null } = useQuery({
    queryKey: ['boost-details', formData.driver_2_boost_id],
    queryFn: async () => {
      if (!formData.driver_2_boost_id) return null
      const response = await fetch(`/api/boosts?limit=100`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return null
      const result = await response.json()
      const allBoosts = result.data || []
      return allBoosts.find((b: BoostView) => b.id === formData.driver_2_boost_id) || null
    },
    enabled: !!formData.driver_2_boost_id
  })


  // Update form data when track guide loads
  useEffect(() => {
    if (trackGuide) {
      setFormData(trackGuide)
      // Set alternate drivers from the new field or fallback to suggested_drivers
      setAlternateDrivers(trackGuide.alt_driver_ids || trackGuide.suggested_drivers || [])
      // Reset dirty state when loading existing guide
      setIsDirty(false)
      setAutoSaveStatus('idle')
    } else {
      // Reset form for new guide
      setFormData({
        track_id: trackId,
        gp_level: selectedGpLevel,
        driver_1_id: null,
        driver_2_id: null,
        driver_1_boost_id: null,
        driver_2_boost_id: null,
        driver_1_dry_strategy: '',
        driver_2_dry_strategy: '',
        driver_1_wet_strategy: '',
        driver_2_wet_strategy: '',
        alt_driver_ids: [],
        alt_boost_ids: [],
        dry_strategy: '',
        wet_strategy: '',
        suggested_drivers: [],
        suggested_boosts: [],
        notes: ''
      })
      setAlternateDrivers([])
      // Reset dirty state for new guide
      setIsDirty(false)
      setAutoSaveStatus('idle')
    }
  }, [trackGuide, trackId, selectedGpLevel])

  // Track form changes to set dirty state
  useEffect(() => {
    if (!trackGuide) {
      // For new guides, check if form has any data (other than default values)
      const hasData = Object.values(formData).some(value => {
        if (value === null || value === undefined) return false
        if (typeof value === 'string') return value.trim() !== ''
        if (Array.isArray(value)) return value.length > 0
        return true
      })
      setIsDirty(hasData)
    } else {
      // Compare current form data with saved guide data
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(trackGuide)
      setIsDirty(hasChanges)
    }
  }, [formData, trackGuide])

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
      // Use the dirty state to determine if we have changes to save
      const hasChangesToSave = isDirty
      
      if (hasChangesToSave) {
        setAutoSaveStatus('saving')
        setIsSaving(true)
        
        try {
          await new Promise<void>((resolve, reject) => {
            saveMutation.mutate({
              ...formData,
              track_id: trackId,
              gp_level: selectedGpLevel, // Save with current GP level, not new one
            }, {
              onSuccess: () => {
                setAutoSaveStatus('saved')
                setIsSaving(false)
                setSelectedGpLevel(newGpLevel)
                
                // Reset dirty state after successful save
                setIsDirty(false)
                
                // Reset auto save status after a short delay
                setTimeout(() => {
                  setAutoSaveStatus('idle')
                }, 2000)
                
                resolve()
              },
              onError: (error) => {
                setAutoSaveStatus('error')
                setIsSaving(false)
                // Still switch tabs even if save fails, but show error
                setSelectedGpLevel(newGpLevel)
                addToast(`Failed to save changes: ${error.message}`, 'error')
                
                // Reset auto save status after a short delay
                setTimeout(() => {
                  setAutoSaveStatus('idle')
                }, 3000)
                
                resolve()
              }
            })
          })
        } catch (error) {
          setAutoSaveStatus('error')
          setIsSaving(false)
          setSelectedGpLevel(newGpLevel)
          
          // Reset auto save status after a short delay
          setTimeout(() => {
            setAutoSaveStatus('idle')
          }, 3000)
        }
      } else {
        // No changes to save, just switch tabs
        setSelectedGpLevel(newGpLevel)
      }
    }
  }

  const handleSelectDrivers = () => {
    setDriverModalGpLevel(selectedGpLevel)
    setShowDriverModal(true)
  }

  const handleDriverSelection = (selectedDriverIds: string[]) => {
    if (driverSelectionMode === 'driver1') {
      // For driver1, just set the single driver
      // Add validation to prevent duplicate main drivers
      if (selectedDriverIds[0] === formData.driver_2_id) {
        // Clear driver2 if trying to select the same driver
        setFormData(prev => ({ 
          ...prev, 
          driver_1_id: selectedDriverIds[0] || null,
          driver_2_id: null
        }))
        setDriver_1_id(selectedDriverIds[0] || '')
        setDriver_2_id('')
      } else {
        setFormData(prev => ({ ...prev, driver_1_id: selectedDriverIds[0] || null }))
        setDriver_1_id(selectedDriverIds[0] || '')
      }
    } else if (driverSelectionMode === 'driver2') {
      // For driver2, just set the single driver
      // Add validation to prevent duplicate main drivers
      if (selectedDriverIds[0] === formData.driver_1_id) {
        // Clear driver1 if trying to select the same driver
        setFormData(prev => ({ 
          ...prev, 
          driver_2_id: selectedDriverIds[0] || null,
          driver_1_id: null
        }))
        setDriver_2_id(selectedDriverIds[0] || '')
        setDriver_1_id('')
      } else {
        setFormData(prev => ({ ...prev, driver_2_id: selectedDriverIds[0] || null }))
        setDriver_2_id(selectedDriverIds[0] || '')
      }
    } else {
      // For alternate drivers, set the new field
      setFormData(prev => ({ 
        ...prev, 
        alt_driver_ids: selectedDriverIds
      }))
      setAlternateDrivers(selectedDriverIds)
    }
    setShowDriverModal(false)
  }

  const handleSelectBoosts = () => {
    setShowBoostModal(true)
  }

  const handleBoostSelection = (selectedBoostIds: string[]) => {
    setFormData(prev => ({ ...prev, suggested_boosts: selectedBoostIds }))
    setShowBoostModal(false)
  }

  const handleDriverSelect = (driverId: string | null, position: 'driver1' | 'driver2') => {
    if (position === 'driver1') {
      setFormData(prev => ({ ...prev, driver_1_id: driverId }))
    } else {
      setFormData(prev => ({ ...prev, driver_2_id: driverId }))
    }
  }

  const handleBoostSelect = (boostId: string | null, position: 'driver1' | 'driver2') => {
    if (position === 'driver1') {
      setFormData(prev => ({ ...prev, driver_1_boost_id: boostId }))
    } else {
      setFormData(prev => ({ ...prev, driver_2_boost_id: boostId }))
    }
  }

  // Edit handler functions for driver cards
  const handleEditDriver1 = () => {
    setDriverSelectionMode('driver1')
    handleSelectDrivers()
  }

  const handleEditDriver2 = () => {
    setDriverSelectionMode('driver2')
    handleSelectDrivers()
  }

  // Edit handler functions for boost cards
  const handleEditDriver1Boost = () => {
    setShowDriver1BoostModal(true)
  }

  const handleEditDriver2Boost = () => {
    setShowDriver2BoostModal(true)
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
        <div className="max-w-7xl mx-auto py-0 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {track.name} {track.alt_name && `(${track.alt_name})`}
                </h1>
                <span className='text-lg font-normal'>{capitalizeStat(track.driver_track_stat)} / {capitalizeStat(track.car_track_stat)}</span>
              </div>
              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="px-4 mx-4"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Guide'}
                </Button>
                <Link href="/track-guides">
                  <Button variant="outline">Back to Track Guides</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* GP Level Tabs */}
          <Card className="px-4 pt-2 mb-4">
            <div className="flex space-x-1 mb-2 justify-center">
              {GP_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => handleGpLevelChange(level.id)}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors relative ${
                    selectedGpLevel === level.id
                      ? 'bg-gray-600 text-gray-100 border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {level.name}
                  {/* Auto-save status indicator */}
                  {selectedGpLevel === level.id && (
                    <div className="absolute -top-1 -right-1">
                      {autoSaveStatus === 'saving' && (
                        <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-blue-600"></div>
                          <span>Saving</span>
                        </div>
                      )}
                      {autoSaveStatus === 'saved' && (
                        <div className="flex items-center space-x-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          <Shield className="h-3 w-3" />
                          <span>Saved</span>
                        </div>
                      )}
                      {autoSaveStatus === 'error' && (
                        <div className="flex items-center space-x-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Error</span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Main Layout - 4 Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Driver 1 Card */}
            <Card 
              className="p-4"
              backgroundColor={getRarityBackground(selectedDriver1Details?.rarity || 0)}
            >
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-700">Driver 1</h3>
                  <DriverDisplay
                    driver={formData.driver_1_id ? findDriver(formData.driver_1_id) : null}
                    isLoading={driversLoading}
                    placeholderText="No driver selected yet"
                    onEdit={handleEditDriver1}
                  />
                </div>
                <div>
                  <BoostDisplay
                    boost={selectedDriver1BoostDetails}
                    isLoading={boostsLoading}
                    placeholderText="No boost selected yet"
                    onEdit={handleEditDriver1Boost}
                  />
                </div>

                {/* Tire Strategies */}
                <div>
                  <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="text-normal font-bold text-gray-900 px-2 mb-2">
                      {track.laps} Laps
                    </div>                    
                    <div className="text-sm font-bold text-gray-900 px-2 mb-1">Dry:
                       <input type="text"
                        className="w-2/3 rounded-lg border-gray-300 ml-2 text-sm"
                        value={formData.driver_1_dry_strategy || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, driver_1_dry_strategy: e.target.value }))}
                      />
                    </div>
                    <div className="text-sm font-bold text-gray-900 px-2 mb-1">Wet:
                       <input type="text"
                          className="w-2/3 rounded-lg border-gray-300 ml-2 text-sm"
                          value={formData.driver_1_wet_strategy || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, driver_1_wet_strategy: e.target.value }))}
                        />
                    </div>
                  </div>
                </div>
                {/* <Button variant="outline" className="flex-1 text-sm px-2 bg-white font-bold" onClick={() => {
                  setDriverSelectionMode('driver1')
                  handleSelectDrivers()
                }}>
                  Select Driver
                </Button>
                <Button variant="outline" className="flex-1 text-sm ml-2 px-2 bg-white font-bold" onClick={() => setShowDriver1BoostModal(true)}>
                  Select Boost
                </Button> */}
              </div>
            </Card>

            {/* Driver 2 Card */}
            <Card 
              className="p-4"
              backgroundColor={getRarityBackground(selectedDriver2Details?.rarity || 0)}
            >
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-700">Driver 2</h3>
                  <DriverDisplay
                    driver={formData.driver_2_id ? findDriver(formData.driver_2_id) : null}
                    isLoading={driversLoading}
                    placeholderText="No driver selected yet"
                    onEdit={handleEditDriver2}
                  />
                </div>
                <div>
                  <BoostDisplay
                    boost={selectedDriver2BoostDetails}
                    isLoading={boostsLoading}
                    placeholderText="No boost selected yet"
                    onEdit={handleEditDriver2Boost}
                  />
                </div>

                {/* Tire Strategies */}
                <div>
                  <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="text-normal font-bold text-gray-900 px-2 mb-2">
                      {track.laps} Laps
                    </div>
                    <div className="text-sm font-bold text-gray-900 px-2 mb-1">Dry:
                        <input type="text"
                        className="w-2/3 rounded-lg border-gray-300 ml-2 text-sm"
                        value={formData.driver_2_dry_strategy || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, driver_2_dry_strategy: e.target.value }))}
                      />
                    </div>
                    <div className="text-sm font-bold text-gray-900 px-2 mb-1">Wet:
                        <input type="text"
                          className="w-2/3 rounded-lg border-gray-300 ml-2 text-sm"
                          value={formData.driver_2_wet_strategy || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, driver_2_wet_strategy: e.target.value }))}
                        />
                    </div>
                  </div>
                </div>
                
                {/* <Button variant="outline" className="flex-1 text-sm px-2 bg-white font-bold" onClick={() => {
                  setDriverSelectionMode('driver2')
                  handleSelectDrivers()
                }}>
                  Select Driver
                </Button>
                <Button variant="outline" className="flex-1 text-sm ml-2 px-2 bg-white font-bold" onClick={() => setShowDriver2BoostModal(true)}>
                  Select Boost
                </Button> */}
              </div>
            </Card>

            {/* Car Setup Card (1 columns width) */}
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Car Setup</h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Saved Setup
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
                </div>
                <div className='flex-1'>
                  {/* <h4 className="text-sm font-medium text-gray-700 mb-1">Setup Notes</h4> */}
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                      Setup Notes
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-300 text-sm"
                    rows={8}
                    placeholder="Track-specific setup changes..."
                    value={formData.setup_notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, setup_notes: e.target.value }))}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Track Guide Editor */}
          <div className="space-y-6">
            {/* Boost Recommendations Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Boost Recommendations</h3>
              
              {/* Display Selected Boosts in Grid */}
              {(formData.suggested_boosts && formData.suggested_boosts.length > 0) || formData.free_boost_id ? (
                <div className="mb-4">
                  {/* <div className="text-sm font-medium text-gray-700 mb-2">Selected Boosts:</div> */}
                  <div className="overflow-auto bg-white rounded-lg border border-gray-200 w-fit max-h-[200px]">
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
                        {/* Additional Boosts */}
                        {formData.suggested_boosts && formData.suggested_boosts.map((boostId: string, index: number) => {
                          const boost = allBoosts.find((b: any) => b.id === boostId)
                          if (!boost) return null
                          
                          const boostStats = boost.boost_stats || {}
                          return (
                            <tr key={boostId} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 py-1 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {boost.boost_custom_names?.custom_name || (boost.icon ? boost.icon.replace('BoostIcon_', '') : null) || boost.name}
                                  </div>
                              </td>
                              <td className="px-3 py-1 whitespace-nowrap text-center">
                                <div className="text-sm text-gray-900">{boost.card_count || 0}</div>
                              </td>
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
                        {/* Free Boost at Bottom */}
                        {formData.free_boost_id && (
                          (() => {
                            const freeBoost = freeBoosts.find((b: any) => b.id === formData.free_boost_id)
                            if (!freeBoost) return null
                            
                            const boostStats = freeBoost.boost_stats || {}
                            return (
                              <tr key="free-boost" className="bg-blue-50 hover:bg-blue-100 transition-colors">
                                <td className="px-3 py-1 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {freeBoost.boost_custom_names?.custom_name || freeBoost.name} (Free)
                                  </div>
                                </td>
                                <td className="px-3 py-1 whitespace-nowrap text-center">
                                  <div className="text-sm text-gray-900">{freeBoost.card_count || 0}</div>
                                </td>
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
                          })()
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">No boosts selected yet</div>
                </div>
              )}
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    Free Boost
                  </label>
                  <select
                    className="w-2/3 rounded-lg border-gray-300"
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
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Additional Boosts
                  </label>
                  <Button variant="outline" className="w-1/2 bg-white font-bold" onClick={handleSelectBoosts}>
                    Select Boosts
                  </Button>
                </div>
              </div>
            </Card>

            {/* Alt Drivers Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Alternative Drivers</h3>
              
              {/* Display Selected Alt Drivers */}
              {(formData.alt_driver_ids && formData.alt_driver_ids.length > 0) ? (
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    {formData.alt_driver_ids.map((driverId: string, index: number) => {
                      // Find driver details
                      const driver = availableDrivers.find((d: DriverView) => d.id === driverId)
                      
                      if (!driver) {
                        return (
                          <div key={driverId} className="p-3 rounded-lg bg-gray-200">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-black">
                                Loading...
                              </span>
                              <span className="text-sm text-black">
                                Level 0
                              </span>
                              <span className="text-sm text-black">
                                • Unknown
                              </span>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div key={driverId} className={`p-3 rounded-lg ${getRarityBackground(driver.rarity)}`}>
                          <div className="flex w-full text-sm font-bold text-black">
                            {/* <div className="flex-1 w-full text-sm font-bold text-black"> */}
                              {driver.name}
                          </div>
                          <div className="flex-1 w-full text-sm font-medium text-gray-700">
                              Level {driver.level} • {getRarityDisplay(driver.rarity)}
                            {/* </div> */}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">No alternate drivers selected yet</div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" className="w-full bg-white font-bold" onClick={() => setShowDriverModal(true)}>
                  Select Alternatives ({(formData.alt_driver_ids || []).length}/6 selected)
                </Button>
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
                    {driverSelectionMode === 'driver1' || driverSelectionMode === 'driver2'
                      ? `Choose a driver for this GP level. Drivers are sorted by their ${capitalizeStat(track?.driver_track_stat || 'overtaking')} stat.`
                      : `Choose up to 6 alternate drivers for this GP level. Drivers are sorted by their ${capitalizeStat(track?.driver_track_stat || 'overtaking')} stat.`
                    }
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
                      selectedDriverIds={driverSelectionMode === 'driver1' 
                        ? (formData.driver_1_id ? [formData.driver_1_id] : []) 
                        : driverSelectionMode === 'driver2' 
                          ? (formData.driver_2_id ? [formData.driver_2_id] : []) 
                          : alternateDrivers}
                      
                      onDriverSelectionChange={(selectedDriverIds) => {
                        if (driverSelectionMode === 'driver1') {
                          // Single select logic for driver1
                          const currentDriverId = formData.driver_1_id
                          const clickedDriverId = selectedDriverIds[0]
                          
                          // If clicking the same driver, toggle it off
                          if (currentDriverId === clickedDriverId) {
                            setFormData(prev => ({ ...prev, driver_1_id: null }))
                            setDriver_1_id('')
                          } else {
                            // If clicking a different driver, deselect all others and select this one
                            setFormData(prev => ({ ...prev, driver_1_id: clickedDriverId }))
                            setDriver_1_id(clickedDriverId || '')
                          }
                          
                          // Add validation to prevent duplicate main drivers
                          if (clickedDriverId === formData.driver_2_id) {
                            // Clear driver2 if trying to select the same driver
                            setFormData(prev => ({ ...prev, driver_2_id: null }))
                            setDriver_2_id('')
                          }
                        } else if (driverSelectionMode === 'driver2') {
                          // Single select logic for driver2
                          const currentDriverId = formData.driver_2_id
                          const clickedDriverId = selectedDriverIds[0]
                          
                          // If clicking the same driver, toggle it off
                          if (currentDriverId === clickedDriverId) {
                            setFormData(prev => ({ ...prev, driver_2_id: null }))
                            setDriver_2_id('')
                          } else {
                            // If clicking a different driver, deselect all others and select this one
                            setFormData(prev => ({ ...prev, driver_2_id: clickedDriverId }))
                            setDriver_2_id(clickedDriverId || '')
                          }
                          
                          // Add validation to prevent duplicate main drivers
                          if (clickedDriverId === formData.driver_1_id) {
                            // Clear driver1 if trying to select the same driver
                            setFormData(prev => ({ ...prev, driver_1_id: null }))
                            setDriver_1_id('')
                          }
                        } else {
                          // For alternate drivers, just set the alternate drivers
                          // Allow duplicates - a driver can be both main and alternate
                          setFormData(prev => ({ 
                            ...prev, 
                            alt_driver_ids: selectedDriverIds
                          }))
                          setAlternateDrivers(selectedDriverIds)
                        }
                      }}
                      trackStat={track?.driver_track_stat || 'overtaking'}
                      maxSeries={GP_LEVELS[driverModalGpLevel].seriesMax}
                      initialShowHighestLevel={false}
                      maxSelectable={driverSelectionMode === 'alternate' ? 6 : 1}
                      singleSelect={driverSelectionMode === 'driver1' || driverSelectionMode === 'driver2'}
                      driver1Id={formData.driver_1_id || undefined}
                      driver2Id={formData.driver_2_id || undefined}
                    />
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        Selected: {
                          driverSelectionMode === 'driver1' ? formData.driver_1_id ? '1' : '0' 
                            : driverSelectionMode === 'driver2' ? formData.driver_2_id ? '1' : '0' 
                            : driverSelectionMode === 'alternate' ? alternateDrivers?.length : 0}  
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (driverSelectionMode === 'driver1') {
                            setFormData(prev => ({ ...prev, driver_1_id: null }))
                            setDriver_1_id('')
                          } else if (driverSelectionMode === 'driver2') {
                            setFormData(prev => ({ ...prev, driver_2_id: null }))
                            setDriver_2_id('')
                          } else {
                            // For alternate drivers, clear the new field
                            setFormData(prev => ({ ...prev, alt_driver_ids: [] }))
                            setAlternateDrivers([])
                          }
                        }}
                      >
                        Clear Selection
                      </Button>
                    </div>
                    <div className="space-x-3">
                      <Button
                        onClick={() => setShowDriverModal(false)}
                        // disabled={!formData.suggested_drivers?.length}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unified Boost Selection Modal */}
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
                            .slice() // Create a copy to avoid mutating the original array
                            .sort((a: any, b: any) => {
                              const aStats = a.boost_stats || {}
                              const bStats = b.boost_stats || {}
                              
                              // Map track stat names to boost stat names
                              const statMap: Record<string, string> = {
                                // Overtaking variations
                                'overtaking': 'overtake',
                                'overtake': 'overtake',
                                
                                // Defending variations
                                'defending': 'block',
                                'defend': 'block',
                                'block': 'block',
                                
                                // Corners variations
                                'corners': 'corners',
                                'cornering': 'corners',
                                
                                // Tyre Use variations
                                'tyre_use': 'tyre_use',
                                'tyreUse': 'tyre_use',  // Added camelCase version
                                'tyre': 'tyre_use',
                                'tire': 'tyre_use',
                                'tyre_management': 'tyre_use',
                                'tyre_mgt': 'tyre_use',
                                'tire_use': 'tyre_use',
                                'tire_management': 'tyre_use',
                                'tire_mgt': 'tyre_use',
                                
                                // Power Unit variations
                                'power_unit': 'power_unit',
                                'powerUnit': 'power_unit',
                                'powerunit': 'power_unit',
                                
                                // Speed variations
                                'speed': 'speed',
                                
                                // Pit Stop variations
                                'pit_stop': 'pit_stop',
                                'pitStop': 'pit_stop',
                                'pitstop': 'pit_stop',
                                
                                // Race Start variations
                                'race_start': 'race_start',
                                'raceStart': 'race_start',
                                'racestart': 'race_start'
                              }
                              
                              // Primary sort: track's driver stat (mapped to boost stat)
                              const trackDriverStat = track?.driver_track_stat || 'block'
                              const boostDriverStat = statMap[trackDriverStat] || trackDriverStat
                              const aDriverStat = aStats[boostDriverStat] || 0
                              const bDriverStat = bStats[boostDriverStat] || 0
                              
                              // Debug logging
                              if (process.env.NODE_ENV === 'development') {
                                console.log('Track driver stat:', trackDriverStat)
                                console.log('Mapped boost stat:', boostDriverStat)
                                console.log('Available boost stats for A:', Object.keys(aStats))
                                console.log('Available boost stats for B:', Object.keys(bStats))
                                console.log('Boost A', a.name, 'stat:', aDriverStat)
                                console.log('Boost B', b.name, 'stat:', bDriverStat)
                                console.log('Stat map lookup result:', statMap[trackDriverStat])
                              }
                              
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

          {/* Driver 1 Individual Boost Selection Modal */}
          {showDriver1BoostModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Select Driver 1 Boost
                    </h2>
                    <button
                      onClick={() => setShowDriver1BoostModal(false)}
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
                              
                              // Map track stat names to boost stat names
                              const statMap: Record<string, string> = {
                                // Overtaking variations
                                'overtaking': 'overtake',
                                'overtake': 'overtake',
                                
                                // Defending variations
                                'defending': 'block',
                                'defend': 'block',
                                'block': 'block',
                                
                                // Corners variations
                                'corners': 'corners',
                                'cornering': 'corners',
                                
                                // Tyre Use variations
                                'tyre_use': 'tyre_use',
                                'tyreUse': 'tyre_use',  // Added camelCase version
                                'tyre': 'tyre_use',
                                'tire': 'tyre_use',
                                'tyre_management': 'tyre_use',
                                'tyre_mgt': 'tyre_use',
                                'tire_use': 'tyre_use',
                                'tire_management': 'tyre_use',
                                'tire_mgt': 'tyre_use',
                                
                                // Power Unit variations
                                'power_unit': 'power_unit',
                                'powerUnit': 'power_unit',
                                'powerunit': 'power_unit',
                                
                                // Speed variations
                                'speed': 'speed',
                                
                                // Pit Stop variations
                                'pit_stop': 'pit_stop',
                                'pitStop': 'pit_stop',
                                'pitstop': 'pit_stop',
                                
                                // Race Start variations
                                'race_start': 'race_start',
                                'raceStart': 'race_start',
                                'racestart': 'race_start'
                              }
                              
                              // Primary sort: track's driver stat (mapped to boost stat)
                              const trackDriverStat = track?.driver_track_stat || 'block'
                              const boostDriverStat = statMap[trackDriverStat] || trackDriverStat
                              const aDriverStat = aStats[boostDriverStat] || 0
                              const bDriverStat = bStats[boostDriverStat] || 0
                              
                              // Debug logging
                              if (process.env.NODE_ENV === 'development') {
                                console.log('Track driver stat:', trackDriverStat)
                                console.log('Mapped boost stat:', boostDriverStat)
                                console.log('Available boost stats for A:', Object.keys(aStats))
                                console.log('Available boost stats for B:', Object.keys(bStats))
                                console.log('Boost A', a.name, 'stat:', aDriverStat)
                                console.log('Boost B', b.name, 'stat:', bDriverStat)
                                console.log('Stat map lookup result:', statMap[trackDriverStat])
                              }
                              
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
                              const isSelected = formData.driver_1_boost_id === boost.id
                              const boostStats = boost.boost_stats || {}

                              return (
                                <tr
                                  key={boost.id}
                                  className={cn(
                                    'hover:bg-gray-50 transition-colors cursor-pointer',
                                    isSelected && 'bg-blue-50'
                                  )}
                                  onClick={() => {
                                    // Toggle logic for single select: if already selected, deselect it
                                    const currentBoostId = formData.driver_1_boost_id
                                    const newBoostId = currentBoostId === boost.id ? null : boost.id
                                    setFormData(prev => ({ ...prev, driver_1_boost_id: newBoostId }))
                                  }}
                                >
                                  {/* Name Column */}
                                  <td className="px-3 py-1 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        name="driver1-boost"
                                        checked={isSelected}
                                        onChange={() => {}}
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
                      {allBoosts.length === 0 && (
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
                        Selected: {formData.driver_1_boost_id ? '1' : '0'}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, driver_1_boost_id: null }))}
                        disabled={!formData.driver_1_boost_id}
                      >
                        Clear Selection
                      </Button>
                    </div>
                    <div className="space-x-3">
                      <Button
                        onClick={() => setShowDriver1BoostModal(false)}
                        // disabled={!formData.driver_1_boost_id}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Driver 2 Individual Boost Selection Modal */}
          {showDriver2BoostModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Select Driver 2 Boost
                    </h2>
                    <button
                      onClick={() => setShowDriver2BoostModal(false)}
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
                              
                              // Map track stat names to boost stat names
                              const statMap: Record<string, string> = {
                                // Overtaking variations
                                'overtaking': 'overtake',
                                'overtake': 'overtake',
                                
                                // Defending variations
                                'defending': 'block',
                                'defend': 'block',
                                'block': 'block',
                                
                                // Corners variations
                                'corners': 'corners',
                                'cornering': 'corners',
                                
                                // Tyre Use variations
                                'tyre_use': 'tyre_use',
                                'tyreUse': 'tyre_use',  // Added camelCase version
                                'tyre': 'tyre_use',
                                'tire': 'tyre_use',
                                'tyre_management': 'tyre_use',
                                'tyre_mgt': 'tyre_use',
                                'tire_use': 'tyre_use',
                                'tire_management': 'tyre_use',
                                'tire_mgt': 'tyre_use',
                                
                                // Power Unit variations
                                'power_unit': 'power_unit',
                                'powerUnit': 'power_unit',
                                'powerunit': 'power_unit',
                                
                                // Speed variations
                                'speed': 'speed',
                                
                                // Pit Stop variations
                                'pit_stop': 'pit_stop',
                                'pitStop': 'pit_stop',
                                'pitstop': 'pit_stop',
                                
                                // Race Start variations
                                'race_start': 'race_start',
                                'raceStart': 'race_start',
                                'racestart': 'race_start'
                              }
                              
                              // Primary sort: track's driver stat (mapped to boost stat)
                              const trackDriverStat = track?.driver_track_stat || 'block'
                              const boostDriverStat = statMap[trackDriverStat] || trackDriverStat
                              const aDriverStat = aStats[boostDriverStat] || 0
                              const bDriverStat = bStats[boostDriverStat] || 0
                              
                              // Debug logging
                              if (process.env.NODE_ENV === 'development') {
                                console.log('Track driver stat:', trackDriverStat)
                                console.log('Mapped boost stat:', boostDriverStat)
                                console.log('Available boost stats for A:', Object.keys(aStats))
                                console.log('Available boost stats for B:', Object.keys(bStats))
                                console.log('Boost A', a.name, 'stat:', aDriverStat)
                                console.log('Boost B', b.name, 'stat:', bDriverStat)
                                console.log('Stat map lookup result:', statMap[trackDriverStat])
                              }
                              
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
                              const isSelected = formData.driver_2_boost_id === boost.id
                              const boostStats = boost.boost_stats || {}

                              return (
                                <tr
                                  key={boost.id}
                                  className={cn(
                                    'hover:bg-gray-50 transition-colors cursor-pointer',
                                    isSelected && 'bg-blue-50'
                                  )}
                                  onClick={() => {
                                    // Toggle logic for single select: if already selected, deselect it
                                    const currentBoostId = formData.driver_2_boost_id
                                    const newBoostId = currentBoostId === boost.id ? null : boost.id
                                    setFormData(prev => ({ ...prev, driver_2_boost_id: newBoostId }))
                                  }}
                                >
                                  {/* Name Column */}
                                  <td className="px-3 py-1 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        name="driver2-boost"
                                        checked={isSelected}
                                        onChange={() => {}}
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
                      {allBoosts.length === 0 && (
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
                        Selected: {formData.driver_2_boost_id ? '1' : '0'}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, driver_2_boost_id: null }))}
                        disabled={!formData.driver_2_boost_id}
                      >
                        Clear Selection
                      </Button>
                    </div>
                    <div className="space-x-3">
                      <Button
                        onClick={() => setShowDriver2BoostModal(false)}
                        // disabled={!formData.driver_2_boost_id}
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
