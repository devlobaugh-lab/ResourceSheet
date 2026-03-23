'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUserCarParts, useUserCarSetups, useCreateSetup, useUpdateSetup, useDeleteSetup } from '@/hooks/useApi'
import { useSeason } from '@/contexts/SeasonContext'
import { useAuth } from '@/components/auth/AuthContext'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CarPartView, UserCarSetup } from '@/types/database'
import { cn, calculateHighestLevel, getRarityBackground, getRarityDisplay, getCollectionRarityDisplay } from '@/lib/utils'
import { CarPartSelectionGrid } from '@/components/CarPartSelectionGrid'
import { Pencil, Copy } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

// Part type definitions
const PART_TYPES = [
  { key: 'brake', type: 1, name: 'Brake', label: 'Brake' },
  { key: 'gearbox', type: 0, name: 'Gearbox', label: 'Gearbox' },
  { key: 'rear_wing', type: 5, name: 'Rear Wing', label: 'Rear Wing' },
  { key: 'front_wing', type: 4, name: 'Front Wing', label: 'Front Wing' },
  { key: 'suspension', type: 3, name: 'Suspension', label: 'Suspension' },
  { key: 'engine', type: 2, name: 'Engine', label: 'Engine' }
] as const

// Setup types for suggested setups
const SETUP_TYPES = [
  { value: 'speed', label: 'Speed' },
  { value: 'cornering', label: 'Cornering' },
  { value: 'powerUnit', label: 'Power Unit' },
  { value: 'speed_quali', label: 'Speed + Quali' },
  { value: 'cornering_quali', label: 'Cornering + Quali' },
  { value: 'pu_quali', label: 'PU + Quali' },
  { value: 'speed_cornering', label: 'Speed + Cornering' },
  { value: 'speed_cornering_quali', label: 'Speed + Cornering + Quali' },
]

// Helper function to calculate stat value with bonus
const getStatValue = (part: CarPartView | undefined, statName: string, bonusPercentage: number, hasBonus: boolean, useHighestLevel: boolean): number => {
  if (!part) return 0

  let userLevel = part.level || 0
  if (userLevel === 0) return 0

  if (useHighestLevel) {
    userLevel = calculateHighestLevel(userLevel, part.card_count || 0, part.rarity)
  }

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

// Interface for a setup slot (A or B)
interface SetupSlot {
  id: string | null // existing setup id if editing
  name: string
  notes: string
  selectedParts: Record<string, string>
  bonusParts: Set<string>
  seriesFilter: number
  bonusPercentage: string
}

const createEmptySlot = (): SetupSlot => ({
  id: null,
  name: '',
  notes: '',
  selectedParts: {
    brake: '',
    gearbox: '',
    rear_wing: '',
    front_wing: '',
    suspension: '',
    engine: ''
  },
  bonusParts: new Set(),
  seriesFilter: 12,
  bonusPercentage: ''
})

function AuthenticatedSetupsPage() {
  const { addToast } = useToast()
  const { activeSeasonId } = useSeason()

  const { data: carPartsResponse, isLoading: partsLoading, error: partsError } = useUserCarParts({
    page: 1,
    limit: 1000,
    ...(activeSeasonId ? { season_id: activeSeasonId } : {}),
  })

  const { data: setupsResponse, isLoading: setupsLoading, error: setupsError } = useUserCarSetups(
    activeSeasonId ? { season_id: activeSeasonId } : undefined
  )
  const createSetup = useCreateSetup()
  const updateSetup = useUpdateSetup()
  const deleteSetup = useDeleteSetup()

  // Two setup slots for side-by-side editing
  const [slotA, setSlotA] = useState<SetupSlot>(createEmptySlot())
  const [slotB, setSlotB] = useState<SetupSlot>(createEmptySlot())

  // Modal state
  const [showPartModal, setShowPartModal] = useState(false)
  const [modalPartType, setModalPartType] = useState<number>(0)
  const [modalSlotKey, setModalSlotKey] = useState<'A' | 'B'>('A')

  // Suggested setup state
  const [showSuggestModal, setShowSuggestModal] = useState(false)
  const [suggestSeriesFilter, setSuggestSeriesFilter] = useState(12)
  const [suggestBonusPercentage, setSuggestBonusPercentage] = useState('')
  const [suggestUseHighestLevel, setSuggestUseHighestLevel] = useState(false)
  const [suggestSetupType, setSuggestSetupType] = useState('speed')
  const [suggestTargetSlot, setSuggestTargetSlot] = useState<'A' | 'B'>('A')

  // Global filters (shared with modals)
  const [globalSeriesFilter, setGlobalSeriesFilter] = useState(12)
  const [globalBonusPercentage, setGlobalBonusPercentage] = useState('')

  // Auto-load a setup into slot A from URL param (e.g. ?loadA=<id>)
  const searchParams = useSearchParams()
  useEffect(() => {
    const loadAId = searchParams.get('loadA')
    if (!loadAId || !setupsResponse?.data) return
    const setup = setupsResponse.data.find(s => s.id === loadAId)
    if (setup) handleLoadSetup(setup, 'A')
  // Only run once when setups first load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupsResponse?.data])

  // Filter parts by series
  const filteredParts = useMemo(() => {
    if (!carPartsResponse?.data) return []
    return carPartsResponse.data.filter(part => part.series <= globalSeriesFilter)
  }, [carPartsResponse?.data, globalSeriesFilter])

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

  // Calculate total stats for a slot
  const calculateTotalStats = useCallback((slot: SetupSlot) => {
    const stats = {
      speed: 0,
      cornering: 0,
      powerUnit: 0,
      qualifying: 0,
      drs: 0,
      pitStopTime: 0
    }

    const bonusPct = parseFloat(slot.bonusPercentage) || 0

    PART_TYPES.forEach(({ key, type }) => {
      const partId = slot.selectedParts[key]
      const part = carPartsResponse?.data?.find(p => p.id === partId)
      const hasBonus = slot.bonusParts.has(partId)

      if (part) {
        stats.speed += getStatValue(part, 'speed', bonusPct, hasBonus, false)
        stats.cornering += getStatValue(part, 'cornering', bonusPct, hasBonus, false)
        stats.powerUnit += getStatValue(part, 'powerUnit', bonusPct, hasBonus, false)
        stats.qualifying += getStatValue(part, 'qualifying', bonusPct, hasBonus, false)
        stats.drs += getStatValue(part, 'drs', bonusPct, hasBonus, false)
        stats.pitStopTime += getStatValue(part, 'pitStopTime', bonusPct, hasBonus, false)
      }
    })

    return stats
  }, [carPartsResponse?.data])

  // Open part selection modal
  const openPartModal = (partType: number, slotKey: 'A' | 'B') => {
    setModalPartType(partType)
    setModalSlotKey(slotKey)
    setShowPartModal(true)
  }

  // Handle part selection from modal
  const handlePartSelect = (partId: string) => {
    const slot = modalSlotKey === 'A' ? slotA : slotB
    const setSlot = modalSlotKey === 'A' ? setSlotA : setSlotB

    const partTypeKey = PART_TYPES.find(p => p.type === modalPartType)?.key
    if (!partTypeKey) return

    // If deselecting (clicking same part), clear it
    const newPartId = slot.selectedParts[partTypeKey] === partId ? '' : partId

    setSlot(prev => ({
      ...prev,
      selectedParts: {
        ...prev.selectedParts,
        [partTypeKey]: newPartId
      }
    }))
  }

  // Handle bonus toggle from modal
  const handleBonusToggle = (partId: string) => {
    const slot = modalSlotKey === 'A' ? slotA : slotB
    const setSlot = modalSlotKey === 'A' ? setSlotA : setSlotB

    setSlot(prev => {
      const newSet = new Set(prev.bonusParts)
      if (newSet.has(partId)) {
        newSet.delete(partId)
      } else {
        newSet.add(partId)
      }
      return { ...prev, bonusParts: newSet }
    })
  }

  // Handle save setup
  const handleSaveSetup = async (slotKey: 'A' | 'B') => {
    const slot = slotKey === 'A' ? slotA : slotB
    const setSlot = slotKey === 'A' ? setSlotA : setSlotB

    if (!slot.name.trim()) {
      addToast('Please enter a setup name', 'error')
      return
    }

    // Check for duplicate names
    const existingSetup = setupsResponse?.data?.find(
      setup => setup.name.toLowerCase() === slot.name.trim().toLowerCase() && setup.id !== slot.id
    )
    if (existingSetup) {
      addToast('A setup with this name already exists. Please choose a different name.', 'error')
      return
    }

    // Check if all parts are selected
    const missingParts = PART_TYPES.filter(({ key }) => !slot.selectedParts[key])
    if (missingParts.length > 0) {
      addToast(`Please select: ${missingParts.map(p => p.label).join(', ')}`, 'error')
      return
    }

    try {
      if (slot.id) {
        // Update existing setup
        await updateSetup.mutateAsync({
          id: slot.id,
          data: {
            name: slot.name.trim(),
            notes: slot.notes.trim() || null,
            brake_id: slot.selectedParts.brake || null,
            gearbox_id: slot.selectedParts.gearbox || null,
            rear_wing_id: slot.selectedParts.rear_wing || null,
            front_wing_id: slot.selectedParts.front_wing || null,
            suspension_id: slot.selectedParts.suspension || null,
            engine_id: slot.selectedParts.engine || null,
            series_filter: slot.seriesFilter,
            bonus_percentage: parseFloat(slot.bonusPercentage) || 0
          }
        })
        addToast('Setup updated successfully!', 'success')
      } else {
        // Create new setup
        const result = await createSetup.mutateAsync({
          name: slot.name.trim(),
          notes: slot.notes.trim() || null,
          brake_id: slot.selectedParts.brake || null,
          gearbox_id: slot.selectedParts.gearbox || null,
          rear_wing_id: slot.selectedParts.rear_wing || null,
          front_wing_id: slot.selectedParts.front_wing || null,
          suspension_id: slot.selectedParts.suspension || null,
          engine_id: slot.selectedParts.engine || null,
          series_filter: slot.seriesFilter,
          bonus_percentage: parseFloat(slot.bonusPercentage) || 0,
          season_id: activeSeasonId ?? null,
        })
        // Update slot with new id
        setSlot(prev => ({ ...prev, id: result.data.id }))
        addToast('Setup saved successfully!', 'success')
      }
    } catch (error) {
      console.error('Failed to save setup:', error)
      addToast('Failed to save setup', 'error')
    }
  }

  // Handle load setup into a slot
  const handleLoadSetup = (setup: UserCarSetup, slotKey: 'A' | 'B') => {
    const setSlot = slotKey === 'A' ? setSlotA : setSlotB
    setSlot({
      id: setup.id,
      name: setup.name || '',
      notes: setup.notes || '',
      selectedParts: {
        brake: setup.brake_id || '',
        gearbox: setup.gearbox_id || '',
        rear_wing: setup.rear_wing_id || '',
        front_wing: setup.front_wing_id || '',
        suspension: setup.suspension_id || '',
        engine: setup.engine_id || ''
      },
      bonusParts: new Set(),
      seriesFilter: setup.series_filter || 12,
      bonusPercentage: setup.bonus_percentage?.toString() || ''
    })
  }

  // Handle copy slot to the other slot
  const handleCopySlot = (sourceKey: 'A' | 'B') => {
    const source = sourceKey === 'A' ? slotA : slotB
    const setTarget = sourceKey === 'A' ? setSlotB : setSlotA
    setTarget({
      ...source,
      id: null,
      name: source.name ? `${source.name} Copy` : 'Copy',
      bonusParts: new Set(source.bonusParts),
    })
  }

  // Handle clear slot
  const handleClearSlot = (slotKey: 'A' | 'B') => {
    const setSlot = slotKey === 'A' ? setSlotA : setSlotB
    setSlot(createEmptySlot())
  }

  // Handle delete setup
  const handleDeleteSetup = async (setupId: string) => {
    if (!confirm('Are you sure you want to delete this setup?')) return

    try {
      await deleteSetup.mutateAsync(setupId)
      // Clear slots if they had this setup loaded
      if (slotA.id === setupId) setSlotA(createEmptySlot())
      if (slotB.id === setupId) setSlotB(createEmptySlot())
      addToast('Setup deleted successfully!', 'success')
    } catch (error) {
      console.error('Failed to delete setup:', error)
      addToast('Failed to delete setup', 'error')
    }
  }

  // Suggested setup algorithm
  const generateSuggestedSetup = () => {
    const bonusPct = parseFloat(suggestBonusPercentage) || 0

    // For each part type, find the best part based on setup type
    const suggestedParts: Record<string, string> = {}

    PART_TYPES.forEach(({ key, type }) => {
      const partsOfType = (partsByType[type] || []).filter(p => p.series <= suggestSeriesFilter && (p.level || 0) > 0)
      
      if (partsOfType.length === 0) {
        suggestedParts[key] = ''
        return
      }

      // Score each part
      const scoredParts = partsOfType.map(part => {
        let score = 0
        const hasBonus = false // For suggestions, we assume no bonus initially; user can add after

        const speed = getStatValue(part, 'speed', bonusPct, hasBonus, suggestUseHighestLevel)
        const cornering = getStatValue(part, 'cornering', bonusPct, hasBonus, suggestUseHighestLevel)
        const powerUnit = getStatValue(part, 'powerUnit', bonusPct, hasBonus, suggestUseHighestLevel)
        const qualifying = getStatValue(part, 'qualifying', bonusPct, hasBonus, suggestUseHighestLevel)

        switch (suggestSetupType) {
          case 'speed':
            score = speed
            break
          case 'cornering':
            score = cornering
            break
          case 'powerUnit':
            score = powerUnit
            break
          case 'speed_quali':
            // Qualifying worth 0.8 to encourage trade-offs
            score = speed + (qualifying * 0.8)
            break
          case 'cornering_quali':
            score = cornering + (qualifying * 0.8)
            break
          case 'pu_quali':
            score = powerUnit + (qualifying * 0.8)
            break
          case 'speed_cornering':
            // Equal weight balanced
            score = speed + cornering
            break
          case 'speed_cornering_quali':
            score = speed + cornering + (qualifying * 0.8)
            break
          default:
            score = speed
        }

        return { part, score }
      })

      // Sort by score descending and pick the best
      scoredParts.sort((a, b) => b.score - a.score)
      suggestedParts[key] = scoredParts[0]?.part.id || ''
    })

    // Load into target slot - clear previous setup and load new suggested parts
    const setSlot = suggestTargetSlot === 'A' ? setSlotA : setSlotB
    setSlot({
      id: null, // Clear any existing setup ID
      name: `Suggested ${SETUP_TYPES.find(t => t.value === suggestSetupType)?.label || 'Setup'}`,
      notes: '', // Clear notes
      selectedParts: suggestedParts,
      bonusParts: new Set(), // Clear bonus selections
      seriesFilter: suggestSeriesFilter,
      bonusPercentage: suggestBonusPercentage
    })

    setShowSuggestModal(false)
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
  const getRarityBg = (rarity: number): string => {
    return rarity === 0 ? "bg-gray-300" :
           rarity === 1 ? "bg-blue-200" :
           rarity === 2 ? "bg-orange-200" :
           rarity === 3 ? "bg-purple-300" :
           rarity === 4 ? "bg-yellow-300" :
           rarity === 5 ? "bg-red-300" : "bg-gray-300";
  }

  // Render a setup card
  const renderSetupCard = (slot: SetupSlot, slotKey: 'A' | 'B', setSlot: React.Dispatch<React.SetStateAction<SetupSlot>>) => {
    const totalStats = calculateTotalStats(slot)

    return (
      <Card className="p-4 w-full max-w-md">
        {/* Setup Name - Inline Editable */}
        <div className="mb-4">
          <input
            type="text"
            className="w-full text-xl font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-0 py-1"
            placeholder="Setup Name..."
            value={slot.name}
            onChange={(e) => setSlot(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        {/* Series Filter and Bonus % */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">Series:</label>
            <select
              className="rounded border-gray-300 text-sm px-2 py-1 pr-6 bg-no-repeat bg-right appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' class=\'w-4 h-4\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundSize: '1rem', backgroundPosition: 'right 0.25rem center' }}
              value={slot.seriesFilter}
              onChange={(e) => setSlot(prev => ({ ...prev, seriesFilter: Number(e.target.value) }))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={12 - i} value={12 - i}>{12 - i}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">Bonus %:</label>
            <input
              type="text"
              className="rounded border-gray-300 text-sm px-2 py-1 w-12"
              value={slot.bonusPercentage}
              onChange={(e) => setSlot(prev => ({ ...prev, bonusPercentage: e.target.value }))}
              placeholder="0"
            />
          </div>
        </div>

        {/* Parts Display - 3 columns of 2 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {PART_TYPES.map(({ key, type, label }) => {
            const partId = slot.selectedParts[key]
            const part = carPartsResponse?.data?.find(p => p.id === partId)
            const hasBonus = slot.bonusParts.has(partId)

            return (
              <div
                key={key}
                className={`${part ? getRarityBg(part.rarity) : 'bg-white border border-gray-200'} rounded-lg p-2 cursor-pointer hover:ring-2 hover:ring-blue-400 relative group`}
                onClick={() => openPartModal(type, slotKey)}
              >
                {/* Pencil icon */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="w-3 h-3 text-gray-600" />
                </div>
                <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
                {part ? (
                  <div>
                    <div className="text-sm font-bold text-gray-900 truncate">{part.name}</div>
                    <div className="text-xs text-gray-700">Lv.{part.level}</div>
                    {hasBonus && (
                      <div className="text-xs text-blue-600 font-medium">★ Bonus</div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">Click to select</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Stats Display - 3 rows with 2 columns */}
        <div className="space-y-2 mb-4">
          {/* Row 1: Speed + Power Unit */}
          <div className="grid grid-cols-2 gap-2">
            <div className="grid grid-cols-[3fr_1fr] gap-0">
              <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded-l text-left font-medium">Speed</div>
              <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded-r text-right font-semibold">{totalStats.speed}</div>
            </div>
            <div className="grid grid-cols-[3fr_1fr] gap-0">
              <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded-l text-left font-medium">Power Unit</div>
              <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded-r text-right font-semibold">{totalStats.powerUnit}</div>
            </div>
          </div>
          {/* Row 2: Cornering + Qualifying */}
          <div className="grid grid-cols-2 gap-2">
            <div className="grid grid-cols-[3fr_1fr] gap-0">
              <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded-l text-left font-medium">Cornering</div>
              <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded-r text-right font-semibold">{totalStats.cornering}</div>
            </div>
            <div className="grid grid-cols-[3fr_1fr] gap-0">
              <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded-l text-left font-medium">Qualifying</div>
              <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded-r text-right font-semibold">{totalStats.qualifying}</div>
            </div>
          </div>
          {/* Row 3: Avg Pit Stop + DRS */}
          <div className="grid grid-cols-2 gap-2">
            <div className="grid grid-cols-[3fr_1fr] gap-0">
              <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded-l text-left font-medium">Avg Pit Stop</div>
              <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded-r text-right font-semibold">{totalStats.pitStopTime.toFixed(2)}s</div>
            </div>
            <div className="grid grid-cols-[3fr_1fr] gap-0">
              <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded-l text-left font-medium">DRS</div>
              <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded-r text-right font-semibold">{totalStats.drs}</div>
            </div>
          </div>
        </div>

        {/* Notes - 2 rows */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            className="w-full rounded-lg border-gray-300 text-sm px-2 py-1 resize-none"
            rows={2}
            placeholder="Add notes about this setup..."
            value={slot.notes}
            onChange={(e) => setSlot(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleSaveSetup(slotKey)}
            disabled={createSetup.isPending || updateSetup.isPending}
            className="flex-1"
          >
            {(createSetup.isPending || updateSetup.isPending) ? 'Saving...' : slot.id ? 'Update Setup' : 'Save Setup'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleCopySlot(slotKey)}
            className="px-3"
            title={`Copy to Slot ${slotKey === 'A' ? 'B' : 'A'}`}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => handleClearSlot(slotKey)}
            className="px-3"
          >
            Clear
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Title and Global Filters */}
      <div className="mb-8 flex items-center gap-6">
        <h1 className="text-3xl font-bold text-gray-900 mr-4">Car Setups</h1>

        {/* Global Series Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="globalSeriesFilter" className="text-sm font-medium text-gray-700">
            Max Series:
          </label>
          <select
            id="globalSeriesFilter"
            className="rounded-lg border-gray-300 text-sm px-3 py-2 pr-8 bg-white"
            value={globalSeriesFilter}
            onChange={(e) => setGlobalSeriesFilter(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={12 - i} value={12 - i}>
                {12 - i}
              </option>
            ))}
          </select>
        </div>

        {/* Global Bonus % */}
        <div className="flex items-center space-x-2">
          <label htmlFor="globalBonusPercentage" className="text-sm font-medium text-gray-700">
            Bonus %:
          </label>
          <input
            id="globalBonusPercentage"
            type="text"
            className="rounded-lg border-gray-300 text-sm px-2 py-2 w-12"
            value={globalBonusPercentage}
            onChange={(e) => setGlobalBonusPercentage(e.target.value)}
            placeholder="0"
          />
        </div>

        {/* Suggest Setup Button */}
        <Button
          variant="outline"
          onClick={() => setShowSuggestModal(true)}
          className="ml-4"
        >
          Suggest Setup
        </Button>
      </div>

      {/* Setup Cards - Side by Side */}
      <div className="flex flex-wrap gap-6">
        {renderSetupCard(slotA, 'A', setSlotA)}
        {renderSetupCard(slotB, 'B', setSlotB)}
      </div>

      {/* Saved Setups - Compact list, same width as 2 cards */}
      <div className="w-full max-w-[calc(2*(28rem+1.5rem))]">
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Saved Setups</h2>

          {setupsResponse?.data?.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm">No setups saved yet</p>
          ) : (
            <div className="space-y-1">
              {setupsResponse?.data?.map(setup => (
                <div key={setup.id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded">
                  <span className="font-medium text-gray-900 text-sm">{setup.name}</span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLoadSetup(setup, 'A')}
                      className="text-xs px-2 py-1"
                    >
                      A
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLoadSetup(setup, 'B')}
                      className="text-xs px-2 py-1"
                    >
                      B
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSetup(setup.id)}
                      disabled={deleteSetup.isPending}
                      className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Part Selection Modal */}
      {showPartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Select {PART_TYPES.find(p => p.type === modalPartType)?.label || 'Part'} - Slot {modalSlotKey}
                </h2>
                <button
                  onClick={() => setShowPartModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <CarPartSelectionGrid
                parts={carPartsResponse?.data || []}
                partType={modalPartType}
                selectedPartId={modalSlotKey === 'A' ? slotA.selectedParts[PART_TYPES.find(p => p.type === modalPartType)?.key || 'brake'] : slotB.selectedParts[PART_TYPES.find(p => p.type === modalPartType)?.key || 'brake']}
                onPartSelect={handlePartSelect}
                bonusCheckedItems={modalSlotKey === 'A' ? slotA.bonusParts : slotB.bonusParts}
                onBonusToggle={handleBonusToggle}
                bonusPercentage={modalSlotKey === 'A' ? slotA.bonusPercentage : slotB.bonusPercentage}
                initialMaxSeries={modalSlotKey === 'A' ? slotA.seriesFilter : slotB.seriesFilter}
              />
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <Button onClick={() => setShowPartModal(false)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Setup Modal */}
      {showSuggestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Suggest a Setup</h2>

            <div className="space-y-4">
              {/* Target Slot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Load into Slot</label>
                <select
                  className="w-full rounded-lg border-gray-300"
                  value={suggestTargetSlot}
                  onChange={(e) => setSuggestTargetSlot(e.target.value as 'A' | 'B')}
                >
                  <option value="A">Slot A</option>
                  <option value="B">Slot B</option>
                </select>
              </div>

              {/* Max Series */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Series</label>
                <select
                  className="w-full rounded-lg border-gray-300"
                  value={suggestSeriesFilter}
                  onChange={(e) => setSuggestSeriesFilter(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={12 - i} value={12 - i}>{12 - i}</option>
                  ))}
                </select>
              </div>

              {/* Setup Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Setup Type</label>
                <select
                  className="w-full rounded-lg border-gray-300"
                  value={suggestSetupType}
                  onChange={(e) => setSuggestSetupType(e.target.value)}
                >
                  {SETUP_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Level Mode */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="suggestHighestLevel"
                  checked={suggestUseHighestLevel}
                  onChange={(e) => setSuggestUseHighestLevel(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="suggestHighestLevel" className="text-sm font-medium text-gray-700">
                  Use Highest Level (based on card count)
                </label>
              </div>

              {/* Bonus % */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bonus %</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300"
                  value={suggestBonusPercentage}
                  onChange={(e) => setSuggestBonusPercentage(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={generateSuggestedSetup} className="flex-1">
                Generate
              </Button>
              <Button variant="outline" onClick={() => setShowSuggestModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
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
  return (
    <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
      <AuthenticatedSetupsPage />
    </div>
  )
}
