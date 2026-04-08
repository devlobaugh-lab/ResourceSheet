'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/auth/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useToast } from '@/components/ui/Toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuthHeaders } from '@/hooks/useApi'
import { useSeason } from '@/contexts/SeasonContext'
import { CustomDriverForm } from '@/components/CustomDriverForm'
import { AIDriverCompareGrid } from '@/components/AIDriverCompareGrid'
import { UserCustomDriver } from '@/types/database'
import { Plus, X, User, Car, Pencil, Trash2 } from 'lucide-react'

// Types
interface AILoadoutOption {
  id: string
  name: string
  track_name: string
  difficulty: string
  display_name: string
  display_track_name?: string
}

interface AILoadoutRow {
  id: string
  name: string
  track_name: string
  difficulty: string
  team_name: string
  driver_slot: number
  overtaking: number
  blocking: number
  qualifying: number
  tyre_use: number
  race_start: number
  car_parts: Record<string, any> | null
  driver_name: string
}

type CustomDriverModalMode = 'create' | 'edit' | 'view'

export default function AIComparePage() {
  const { user } = useAuth()
  const { activeSeasonId } = useSeason()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  
  const STORAGE_KEY = 'compare-ai-page-state'

  const readStorage = () => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  // State — lazily initialised from sessionStorage so restore is synchronous
  const [selectedTrack, setSelectedTrack] = useState<string>(() => readStorage()?.selectedTrack ?? '')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(() => readStorage()?.selectedDifficulty ?? '')
  const [customDriversInGrid, setCustomDriversInGrid] = useState<UserCustomDriver[]>([])
  const [pendingDriverIds, setPendingDriverIds] = useState<string[] | null>(() => {
    const ids = readStorage()?.customDriverIds
    return ids?.length ? ids : null
  })
  const [showCustomDriverModal, setShowCustomDriverModal] = useState(false)
  const [modalMode, setModalMode] = useState<CustomDriverModalMode>('create')
  const [editingDriver, setEditingDriver] = useState<UserCustomDriver | null>(null)
  const prevSeasonRef = useRef<string | null | undefined>(undefined)

  // Clear state if the stored season doesn't match the active season
  useEffect(() => {
    if (activeSeasonId === null) return
    const stored = readStorage()
    if (stored && stored.seasonId !== activeSeasonId) {
      setSelectedTrack('')
      setSelectedDifficulty('')
      setCustomDriversInGrid([])
      setPendingDriverIds(null)
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [activeSeasonId])

  // Clear state when user actively switches seasons
  useEffect(() => {
    if (prevSeasonRef.current === undefined) {
      prevSeasonRef.current = activeSeasonId
      return
    }
    if (activeSeasonId !== null && prevSeasonRef.current !== activeSeasonId) {
      prevSeasonRef.current = activeSeasonId
      setSelectedTrack('')
      setSelectedDifficulty('')
      setCustomDriversInGrid([])
      setPendingDriverIds(null)
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [activeSeasonId])

  // Persist state to sessionStorage (skip until season is known)
  useEffect(() => {
    if (!activeSeasonId) return
    // Don't persist empty state on initial mount before restore/clear logic settles
    const stored = readStorage()
    if (!stored && !selectedTrack && !selectedDifficulty && customDriversInGrid.length === 0) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        seasonId: activeSeasonId,
        selectedTrack,
        selectedDifficulty,
        customDriverIds: customDriversInGrid.map(d => d.id)
      }))
    } catch {}
  }, [activeSeasonId, selectedTrack, selectedDifficulty, customDriversInGrid])
  
  // Fetch AI loadout options (track/difficulty combinations)
  const { data: loadoutOptions, isLoading: optionsLoading } = useQuery({
    queryKey: ['ai-loadouts-options', activeSeasonId],
    queryFn: async () => {
      const params = activeSeasonId ? `?season_id=${encodeURIComponent(activeSeasonId)}` : ''
      const response = await fetch(`/api/ai-loadouts${params}`)
      if (!response.ok) throw new Error('Failed to fetch loadout options')
      return response.json()
    }
  })

  // Fetch selected AI loadout data
  const { data: loadoutData, isLoading: loadoutLoading } = useQuery({
    queryKey: ['ai-loadouts', selectedTrack, selectedDifficulty, activeSeasonId],
    queryFn: async () => {
      if (!selectedTrack || !selectedDifficulty) return { data: [] }
      const params = activeSeasonId ? `?season_id=${encodeURIComponent(activeSeasonId)}` : ''
      const response = await fetch(`/api/ai-loadouts/track/${encodeURIComponent(selectedTrack)}/${encodeURIComponent(selectedDifficulty)}${params}`)
      if (!response.ok) throw new Error('Failed to fetch loadout data')
      return response.json()
    },
    enabled: !!selectedTrack && !!selectedDifficulty
  })
  
  // Fetch user's custom drivers
  const { data: customDriversData } = useQuery({
    queryKey: ['custom-drivers', activeSeasonId],
    queryFn: async () => {
      const params = activeSeasonId ? `?season_id=${encodeURIComponent(activeSeasonId)}` : ''
      const response = await fetch(`/api/custom-drivers${params}`, {
        headers: await getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to fetch custom drivers')
      return response.json()
    },
    enabled: !!user
  })

  // Resolve pending driver IDs once custom driver data is available
  useEffect(() => {
    if (pendingDriverIds && customDriversData?.data) {
      const drivers = customDriversData.data.filter((d: UserCustomDriver) =>
        pendingDriverIds.includes(d.id)
      )
      setCustomDriversInGrid(drivers)
      setPendingDriverIds(null)
    }
  }, [pendingDriverIds, customDriversData])

  // Create custom driver mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/custom-drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders())
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create custom driver')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-drivers'] })
      addToast('Custom driver created successfully', 'success')
      closeModal()
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    }
  })
  
  // Update custom driver mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/custom-drivers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders())
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to update custom driver')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-drivers'] })
      addToast('Custom driver updated successfully', 'success')
      closeModal()
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    }
  })
  
  // Delete custom driver mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/custom-drivers?id=${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to delete custom driver')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-drivers'] })
      addToast('Custom driver deleted successfully', 'success')
      closeModal()
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    }
  })
  
  // Handle selection change - match by display_name
  const handleSelectionChange = (value: string) => {
    if (!value) {
      setSelectedTrack('')
      setSelectedDifficulty('')
      return
    }
    
    // Find the selected option to get proper track_name and difficulty
    // Match by display_name which is what the dropdown shows
    const selectedOption = loadoutOptions?.data?.find((opt: AILoadoutOption) => 
      opt.display_name === value
    )
    
    if (selectedOption) {
      setSelectedTrack(selectedOption.track_name)
      setSelectedDifficulty(selectedOption.difficulty)
    } else {
      console.warn('Could not find option for value:', value)
    }
  }
  
  // Get the display value for the select element
  const selectedDisplayValue = useMemo(() => {
    if (!selectedTrack || !selectedDifficulty) return ''
    const option = loadoutOptions?.data?.find((opt: AILoadoutOption) => 
      opt.track_name === selectedTrack && opt.difficulty === selectedDifficulty
    )
    return option?.display_name || ''
  }, [selectedTrack, selectedDifficulty, loadoutOptions?.data])
  
  // Modal handlers
  const openCreateModal = () => {
    setModalMode('create')
    setEditingDriver(null)
    setShowCustomDriverModal(true)
  }
  
  const openEditModal = (driver: UserCustomDriver) => {
    setModalMode('edit')
    setEditingDriver(driver)
    setShowCustomDriverModal(true)
  }
  
  const openViewModal = (driver: UserCustomDriver) => {
    setModalMode('view')
    setEditingDriver(driver)
    setShowCustomDriverModal(true)
  }
  
  const closeModal = () => {
    setShowCustomDriverModal(false)
    setModalMode('create')
    setEditingDriver(null)
  }
  
  // Add custom driver to grid
  const handleAddCustomDriverToGrid = (driver: UserCustomDriver) => {
    if (customDriversInGrid.some(d => d.id === driver.id)) {
      addToast('Driver already in grid', 'error')
      return
    }
    setCustomDriversInGrid(prev => [...prev, driver])
  }
  
  // Remove custom driver from grid
  const handleRemoveCustomDriverFromGrid = (driverId: string) => {
    setCustomDriversInGrid(prev => prev.filter(d => d.id !== driverId))
  }
  
  // Handle clicking on a custom driver (from the list)
  const handleCustomDriverClick = (driver: UserCustomDriver) => {
    openViewModal(driver)
  }
  
  // Handle form submit
  const handleFormSubmit = (data: any) => {
    if (modalMode === 'create') {
      createMutation.mutate({ ...data, season_id: activeSeasonId ?? null })
    } else if (modalMode === 'edit' && editingDriver) {
      updateMutation.mutate({ id: editingDriver.id, ...data })
    }
  }
  
  // Handle delete from modal
  const handleDelete = () => {
    if (editingDriver) {
      deleteMutation.mutate(editingDriver.id)
      // Also remove from grid if present
      handleRemoveCustomDriverFromGrid(editingDriver.id)
    }
  }
  
  // Combine AI loadouts with custom drivers
  const gridData = useMemo(() => {
    const aiRows = (loadoutData?.data || []) as AILoadoutRow[]
    
    // Convert custom drivers to grid format
    const customRows = customDriversInGrid.map(driver => {
      // Custom drivers store car_parts in consolidated format directly
      const cp = driver.car_parts as any
      const cpSpeed = cp?.speed || 0
      const cpCornering = cp?.cornering || 0
      const cpPowerUnit = cp?.powerUnit || 0
      const cpQualifying = cp?.qualifying || 0
      const cpPitStopTime = cp?.pitStopTime || 0
      const cpDrs = cp?.drs || 0
      
      return {
        id: `custom-${driver.id}`,
        name: driver.name,
        track_name: selectedTrack,
        difficulty: selectedDifficulty,
        team_name: 'Custom',
        driver_slot: 0,
        overtaking: driver.overtaking,
        blocking: driver.blocking,
        qualifying: driver.qualifying,
        tyre_use: driver.tyre_use,
        race_start: driver.race_start,
        car_parts: driver.car_parts,
        driver_name: driver.name,
        // Consolidated car part stats (stored directly in custom drivers)
        cp_speed: cpSpeed,
        cp_cornering: cpCornering,
        cp_powerUnit: cpPowerUnit,
        cp_qualifying: cpQualifying,
        cp_pitStopTime: cpPitStopTime,
        cp_drs: cpDrs,
        // Qualifying total (driver + parts)
        qualifying_total: driver.qualifying + cpQualifying,
        is_custom: true
      }
    })
    
    return [...aiRows, ...customRows]
  }, [loadoutData, customDriversInGrid, selectedTrack, selectedDifficulty])
  
  return (
    <ProtectedRoute>
      <div className="space-y-4">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900">AI Drivers Compare</h1>
        
        {/* Custom Drivers Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Custom Drivers</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={openCreateModal}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Driver
            </Button>
          </div>
          
          {/* Custom Drivers List */}
          {customDriversData?.data?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {customDriversData.data.map((driver: UserCustomDriver) => {
                const isInGrid = customDriversInGrid.some(d => d.id === driver.id)
                return (
                  <div
                    key={driver.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                      isInGrid ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleCustomDriverClick(driver)}
                    title="Click to view/edit"
                  >
                    <User className="w-3 h-3" />
                    <span>{driver.name}</span>
                    {isInGrid ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveCustomDriverFromGrid(driver.id)
                        }}
                        className="hover:text-red-600"
                        title="Remove from grid"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddCustomDriverToGrid(driver)
                        }}
                        className="hover:text-green-600"
                        title="Add to grid"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No custom drivers yet. Click &quot;Create Driver&quot; to add one.</p>
          )}
        </Card>
        
        {/* AI Drivers Grid Card */}
        <Card className="overflow-hidden">
          {/* Track Selector as Header */}
          <div className="bg-gray-700 px-4 py-3 flex items-center gap-4">
            <select
              className="rounded-lg border-0 bg-gray-800 text-white text-lg px-4 py-2 min-w-48 font-medium"
              value={selectedDisplayValue}
              onChange={(e) => handleSelectionChange(e.target.value)}
              disabled={optionsLoading}
            >
              <option value="">{optionsLoading ? 'Loading...' : '-- Select Track --'}</option>
              {loadoutOptions?.data?.map((option: AILoadoutOption) => (
                <option key={option.id} value={option.display_name}>
                  {option.display_name}
                </option>
              ))}
            </select>
            {selectedTrack && selectedDifficulty && (
              <span className="text-gray-300 text-sm">
                {gridData.length} drivers
              </span>
            )}
          </div>
          
          {/* Grid Content */}
          <div className="p-4">
            {selectedTrack && selectedDifficulty ? (
              loadoutLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading AI driver data...</p>
                </div>
              ) : (
                <AIDriverCompareGrid
                  data={gridData}
                  trackName={selectedTrack}
                  difficulty={selectedDifficulty}
                />
              )
            ) : (
              <div className="text-center py-12">
                <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Track</h3>
                <p className="text-gray-600">
                  Choose a track and difficulty level to view AI driver stats
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Custom Driver Modal (Create/Edit/View) */}
      {showCustomDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'create' ? 'Create Custom Driver' : modalMode === 'edit' ? 'Edit Custom Driver' : 'View Custom Driver'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {modalMode === 'view' && editingDriver ? (
              <div className="space-y-4">
                {/* View Mode */}
                <div className="text-center py-2">
                  <p className="text-xl font-semibold text-gray-900">{editingDriver.name}</p>
                </div>
                
                {/* Driver Stats */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Driver Stats</h4>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">OVT</div>
                      <div className="font-semibold">{editingDriver.overtaking}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">DEF</div>
                      <div className="font-semibold">{editingDriver.blocking}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">QLY</div>
                      <div className="font-semibold">{editingDriver.qualifying}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">TYR</div>
                      <div className="font-semibold">{editingDriver.tyre_use}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">RST</div>
                      <div className="font-semibold">{editingDriver.race_start}</div>
                    </div>
                  </div>
                </div>
                
                {/* Car Part Stats */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Car Part Stats</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {(() => {
                      const cp = editingDriver.car_parts as any
                      return (
                        <>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-xs text-gray-500">SPD</div>
                            <div className="font-semibold">{cp?.speed || 0}</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-xs text-gray-500">CRN</div>
                            <div className="font-semibold">{cp?.cornering || 0}</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-xs text-gray-500">PWR</div>
                            <div className="font-semibold">{cp?.powerUnit || 0}</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-xs text-gray-500">QLY</div>
                            <div className="font-semibold">{cp?.qualifying || 0}</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-xs text-gray-500">PIT</div>
                            <div className="font-semibold">{(cp?.pitStopTime || 0).toFixed(2)}</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-xs text-gray-500">DRS</div>
                            <div className="font-semibold">{cp?.drs || 0}</div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-between gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={closeModal}>
                      Close
                    </Button>
                    <Button onClick={() => setModalMode('edit')}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <CustomDriverForm
                onSubmit={handleFormSubmit}
                onCancel={closeModal}
                isLoading={createMutation.isPending || updateMutation.isPending}
                initialValues={editingDriver ? {
                  name: editingDriver.name,
                  overtaking: editingDriver.overtaking,
                  blocking: editingDriver.blocking,
                  qualifying: editingDriver.qualifying,
                  tyre_use: editingDriver.tyre_use,
                  race_start: editingDriver.race_start,
                  car_parts: editingDriver.car_parts as any
                } : undefined}
              />
            )}
          </Card>
        </div>
      )}
    </ProtectedRoute>
  )
}