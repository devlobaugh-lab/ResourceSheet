'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getAuthHeaders } from '@/hooks/useApi'
import { DriverView, BoostView, UserCarSetup, CarPartView } from '@/types/database'
import { DriverSelectionGrid } from '@/components/DriverSelectionGrid'
import { DriverDisplay } from '@/components/DriverDisplay'
import { BoostDisplay } from '@/components/BoostDisplay'
import { SetupPreviewPanel } from '@/components/SetupPreviewPanel'
import { getRarityBackground, getRarityDisplay, getCollectionRarityDisplay } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'

// ─── Constants ───────────────────────────────────────────────────────────────

const GP_LEVELS = [
  { id: 0, name: 'Junior', color: 'bg-yellow-100 text-yellow-800', seriesMax: 3 },
  { id: 1, name: 'Challenger', color: 'bg-blue-100 text-blue-800', seriesMax: 6 },
  { id: 2, name: 'Contender', color: 'bg-green-100 text-green-800', seriesMax: 9 },
  { id: 3, name: 'Champion', color: 'bg-red-100 text-red-800', seriesMax: 12 },
]


const getBoostValueColor = (v: number) =>
  v === 1 ? 'bg-blue-200' : v === 2 ? 'bg-green-200' : v === 3 ? 'bg-yellow-200' :
  v === 4 ? 'bg-orange-200' : v === 5 ? 'bg-red-300' : 'bg-gray-50'

const STAT_MAP: Record<string, string> = {
  overtaking: 'overtake', overtake: 'overtake',
  defending: 'block', defend: 'block', block: 'block',
  corners: 'corners', cornering: 'corners',
  tyre_use: 'tyre_use', tyreUse: 'tyre_use', tyre: 'tyre_use', tire: 'tyre_use',
  power_unit: 'power_unit', powerUnit: 'power_unit',
  speed: 'speed',
  pit_stop: 'pit_stop', pitStop: 'pit_stop',
  race_start: 'race_start', raceStart: 'race_start',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrackInfo {
  id: string; name: string; display_name: string | null
  laps: number; driver_track_stat: string; car_track_stat: string
}
interface TrackSlot {
  id: string; race_number: number; race_type: 'qualifying' | 'opening' | 'final'
  track_id: string | null; is_wet: boolean; is_ready: boolean
  driver_1_id: string | null; driver_2_id: string | null
  driver_1_boost_id: string | null; driver_2_boost_id: string | null
  alt_driver_ids: string[]; alt_boost_ids: string[]
  saved_setup_id: string | null; setup_notes: string | null
  driver_1_tire_strategy: string | null; driver_2_tire_strategy: string | null
  strategy_notes: string | null
}

interface ResultEntry {
  id?: string; gp_guide_id: string; track_id: string
  results_notes: string | null; track?: { id: string; name: string }
}

interface GpGuide {
  id: string; name: string; start_date: string | null; gp_level: number
  notes: string | null; weekend_strategy_same: boolean
  tracks: TrackSlot[]; results: ResultEntry[]
}

const capitalizeStat = (s: string) =>
  s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()

const boostDisplayName = (b: BoostView | null | undefined) => {
  if (!b) return ''
  const icon = b.icon ? b.icon.replace(/^BoostIcon_/i, '') : null
  return (b as any).boost_custom_names?.custom_name || icon || b.name
}

// ─── Boost Selection Modal ─────────────────────────────────────────────────

function BoostSelectModal({
  title, allBoosts, selectedId, trackDriverStat, trackCarStat,
  onSelect, onClose,
}: {
  title: string; allBoosts: BoostView[]; selectedId: string | null
  trackDriverStat: string; trackCarStat: string
  onSelect: (id: string | null) => void; onClose: () => void
}) {
  const sorted = [...allBoosts].sort((a: any, b: any) => {
    const as = a.boost_stats || {}; const bs = b.boost_stats || {}
    const ds = STAT_MAP[trackDriverStat] || trackDriverStat
    const cs = STAT_MAP[trackCarStat] || trackCarStat
    if ((bs[ds] || 0) !== (as[ds] || 0)) return (bs[ds] || 0) - (as[ds] || 0)
    if ((bs[cs] || 0) !== (as[cs] || 0)) return (bs[cs] || 0) - (as[cs] || 0)
    return boostDisplayName(a).localeCompare(boostDisplayName(b))
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="overflow-auto flex-1 p-4">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-700 sticky top-0 z-10">
              <tr>
                {['Name','Amt','Overtake','Defend','Race Start','Tyre','Speed','Corners','Power Unit','Pit Stop'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sorted.map((boost: any) => {
                const bs = boost.boost_stats || {}
                const isSelected = selectedId === boost.id
                return (
                  <tr key={boost.id}
                    className={cn('cursor-pointer hover:bg-gray-50', isSelected && 'bg-blue-50')}
                    onClick={() => onSelect(isSelected ? null : boost.id)}
                  >
                    <td className="px-3 py-1 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <input type="radio" readOnly checked={isSelected} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">{boostDisplayName(boost)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-1 text-sm text-center">{boost.card_count || 0}</td>
                    {['overtake','block','race_start','tyre_use','speed','corners','power_unit','pit_stop'].map(k => (
                      <td key={k} className={cn('px-3 py-1 text-sm text-center', bs[k] > 0 && getBoostValueColor(bs[k]))}>
                        {bs[k] ? bs[k] * 5 : ''}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => onSelect(null)} disabled={!selectedId}>Clear</Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  )
}

// ─── TrackSlotCard ────────────────────────────────────────────────────────────

function TrackSlotCard({
  slot, guideId, gpLevel, allTracks, allDrivers, allBoosts, allSetups, carParts,
  onUpdate, onImport, importingSlotId,
}: {
  slot: TrackSlot; guideId: string; gpLevel: number
  allTracks: TrackInfo[]; allDrivers: DriverView[]; allBoosts: BoostView[]
  allSetups: UserCarSetup[]; carParts: CarPartView[]
  onUpdate: (slotId: string, patch: Partial<TrackSlot>) => void
  onImport: (slotId: string, trackId: string, isWet: boolean) => void
  importingSlotId: string | null
}) {
  const [expanded, setExpanded] = useState(false)
  const [showSetupPreview, setShowSetupPreview] = useState(false)
  const [driverModal, setDriverModal] = useState<null | 'driver1' | 'driver2'>(null)
  const [boostModal, setBoostModal] = useState<null | 'driver1' | 'driver2'>(null)
  
  // Bonus state for driver selection modal
  const [bonusPercentage, setBonusPercentage] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return parseInt(localStorage.getItem('gp-guide-bonus-percentage') || '0', 10) || 0
      } catch { return 0 }
    }
    return 0
  })
  const [bonusCheckedDrivers, setBonusCheckedDrivers] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('gp-guide-bonus-drivers')
        if (stored) return new Set(JSON.parse(stored))
      } catch {}
    }
    return new Set()
  })
  
  const handleBonusToggle = useCallback((driverId: string) => {
    setBonusCheckedDrivers(prev => {
      const next = new Set(prev)
      if (next.has(driverId)) {
        next.delete(driverId)
      } else {
        next.add(driverId)
      }
      // Persist to localStorage
      try {
        localStorage.setItem('gp-guide-bonus-drivers', JSON.stringify(Array.from(next)))
      } catch {}
      return next
    })
  }, [])

  const track = allTracks.find(t => t.id === slot.track_id) || null
  const driver1 = allDrivers.find(d => d.id === slot.driver_1_id) || null
  const driver2 = allDrivers.find(d => d.id === slot.driver_2_id) || null
  const boost1 = allBoosts.find(b => b.id === slot.driver_1_boost_id) || null
  const boost2 = allBoosts.find(b => b.id === slot.driver_2_boost_id) || null
  const setup = allSetups.find(s => s.id === slot.saved_setup_id) || null

  const gpLevelConfig = GP_LEVELS[gpLevel] || GP_LEVELS[3]

  // Use user-controlled is_ready flag (with fallback to calculated for display)
  const hasTrack = !!slot.track_id
  // Calculate completion for display purposes only
  const completedFields = [
    !!slot.track_id,
    !!slot.driver_1_id,
    !!slot.driver_2_id,
    !!slot.driver_1_boost_id,
    !!slot.driver_2_boost_id,
    !!slot.driver_1_tire_strategy,
    !!slot.driver_2_tire_strategy,
  ]
  const filledCount = completedFields.filter(Boolean).length
  const totalFields = completedFields.length
  const isComplete = filledCount === totalFields
  // Use the user-controlled is_ready flag for the visual state
  const isReady = slot.is_ready ?? false
  const slotBg = isReady
    ? 'bg-green-50 border-green-300'
    : hasTrack
    ? 'bg-amber-50 border-amber-200'
    : 'bg-white border-gray-200'

  const save = useCallback(async (patch: Partial<TrackSlot>) => {
    onUpdate(slot.id, patch)
    try {
      const headers = await getAuthHeaders()
      await fetch(`/api/gp-guides/${guideId}/tracks/${slot.id}`, {
        method: 'PUT', headers, credentials: 'same-origin',
        body: JSON.stringify(patch),
      })
    } catch { /* silent */ }
  }, [guideId, slot.id, onUpdate])

  const handleTrackChange = (trackId: string) => {
    save({ track_id: trackId || null })
  }

  return (
    <div className={`border rounded-lg mb-2 transition-colors ${slotBg}`}>
      {/* Slot Header Row - entire row clickable to expand/collapse */}
      <div 
        className="flex flex-wrap items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-xs font-bold text-gray-500 w-16 shrink-0">Race {slot.race_number}</span>
        <select
          value={slot.track_id || ''}
          onChange={e => { e.stopPropagation(); handleTrackChange(e.target.value); }}
          onClick={e => e.stopPropagation()}
          className="flex-1 min-w-[180px] px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">— Select Track —</option>
          {[...allTracks]
            .sort((a, b) => (a.display_name || a.name).localeCompare(b.display_name || b.name))
            .map(t => (
              <option key={t.id} value={t.id}>{t.display_name || t.name}</option>
            ))}
        </select>
        {track && (
          <span className="text-xs text-gray-500 hidden sm:inline">
            {track.laps} laps · {capitalizeStat(track.driver_track_stat)} / {capitalizeStat(track.car_track_stat)}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); save({ is_wet: !slot.is_wet }); }}
          title={slot.is_wet ? 'Wet conditions' : 'Dry conditions'}
          className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
            slot.is_wet ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-yellow-50 border-yellow-300 text-yellow-700'
          }`}
        >
          {slot.is_wet ? '🌧️ Wet' : '☀️ Dry'}
        </button>
        {slot.track_id && (
          <Button variant="outline" size="sm" disabled={importingSlotId === slot.id}
            onClick={e => { e.stopPropagation(); onImport(slot.id, slot.track_id!, slot.is_wet); }} className="text-xs">
            {importingSlotId === slot.id ? 'Importing…' : '↓ Import Track Guide'}
          </Button>
        )}
        {/* User-controlled Ready toggle */}
        <button
          onClick={e => { e.stopPropagation(); save({ is_ready: !isReady }); }}
          title={isReady ? 'Mark as not ready' : 'Mark as ready'}
          className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
            isReady 
              ? 'bg-green-100 border-green-300 text-green-700' 
              : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-green-50'
          }`}
        >
          {isReady ? '✓ Ready' : '○ Ready'}
        </button>
        {/* Completion progress badge */}
        {hasTrack && !isReady && (
          <span className="mr-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{filledCount}/{totalFields}</span>
        )}
        <span className={isComplete || hasTrack ? 'text-gray-400 text-sm' : 'ml-auto text-gray-400 text-sm'}
          title={expanded ? 'Click to collapse' : 'Click to expand strategy'}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded Strategy */}
      {expanded && (
        <div className="border-t border-gray-100 px-3 py-3 bg-gray-50 rounded-b-lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* ── Driver 1 ── */}
            <Card className="p-3" backgroundColor={getRarityBackground(driver1?.rarity || 0)}>
              <h4 className="text-sm font-bold text-gray-700 mb-2">Driver 1</h4>
              <DriverDisplay
                driver={driver1}
                placeholderText="No driver selected"
                onEdit={() => setDriverModal('driver1')}
              />
              <BoostDisplay
                boost={boost1}
                placeholderText="No boost selected"
                onEdit={() => setBoostModal('driver1')}
              />
              <div className="p-2 rounded border border-gray-200 bg-white/70 mt-1">
                <div className="text-xs font-semibold text-gray-600 mb-1">Tyre Strategy</div>
                <input
                  type="text"
                  placeholder="e.g. SS→M→H"
                  value={slot.driver_1_tire_strategy || ''}
                  onChange={e => onUpdate(slot.id, { driver_1_tire_strategy: e.target.value || null })}
                  onBlur={e => save({ driver_1_tire_strategy: e.target.value || null })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </Card>

            {/* ── Driver 2 ── */}
            <Card className="p-3" backgroundColor={getRarityBackground(driver2?.rarity || 0)}>
              <h4 className="text-sm font-bold text-gray-700 mb-2">Driver 2</h4>
              <DriverDisplay
                driver={driver2}
                placeholderText="No driver selected"
                onEdit={() => setDriverModal('driver2')}
              />
              <BoostDisplay
                boost={boost2}
                placeholderText="No boost selected"
                onEdit={() => setBoostModal('driver2')}
              />
              <div className="p-2 rounded border border-gray-200 bg-white/70 mt-1">
                <div className="text-xs font-semibold text-gray-600 mb-1">Tyre Strategy</div>
                <input
                  type="text"
                  placeholder="e.g. SS→M→H"
                  value={slot.driver_2_tire_strategy || ''}
                  onChange={e => onUpdate(slot.id, { driver_2_tire_strategy: e.target.value || null })}
                  onBlur={e => save({ driver_2_tire_strategy: e.target.value || null })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </Card>

            {/* ── Setup + Strategy Notes ── */}
            <div className="flex flex-col gap-4">
              <Card className="p-3">
                <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  Car Setup
                  {slot.saved_setup_id && (
                    <button
                      onClick={() => setShowSetupPreview(v => !v)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      aria-label="Toggle setup preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </h4>
                <select
                  value={slot.saved_setup_id || ''}
                  onChange={e => {
                    const value = e.target.value
                    if (!value) setShowSetupPreview(false)
                    save({ saved_setup_id: value || null })
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                >
                  <option value="">— No Setup —</option>
                  {allSetups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div className="text-xs font-semibold text-gray-600 mb-1">Setup Notes</div>
                <textarea
                  placeholder="Setup-specific changes…"
                  value={slot.setup_notes || ''}
                  onChange={e => onUpdate(slot.id, { setup_notes: e.target.value || null })}
                  onBlur={e => save({ setup_notes: e.target.value || null })}
                  rows={3}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none mb-2"
                />
                <div className="text-xs font-semibold text-gray-600 mb-1">Strategy Notes</div>
                <textarea
                  placeholder="Any strategy notes…"
                  value={slot.strategy_notes || ''}
                  onChange={e => onUpdate(slot.id, { strategy_notes: e.target.value || null })}
                  onBlur={e => save({ strategy_notes: e.target.value || null })}
                  rows={3}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </Card>

              {showSetupPreview && (() => {
                const selectedSetup = allSetups.find(s => s.id === slot.saved_setup_id)
                return selectedSetup ? (
                  <SetupPreviewPanel
                    setup={selectedSetup}
                    carParts={carParts}
                    onClose={() => setShowSetupPreview(false)}
                  />
                ) : null
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── Driver Selection Modal ── */}
      {driverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Select {driverModal === 'driver1' ? 'Driver 1' : 'Driver 2'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {gpLevelConfig.name} GP · sorted by {track ? capitalizeStat(track.driver_track_stat) : 'stat'}
                </p>
              </div>
              <button onClick={() => setDriverModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <DriverSelectionGrid
                drivers={allDrivers}
                selectedDriverIds={driverModal === 'driver1'
                  ? (slot.driver_1_id ? [slot.driver_1_id] : [])
                  : (slot.driver_2_id ? [slot.driver_2_id] : [])}
                onDriverSelectionChange={(ids) => {
                  const picked = ids[0] || null
                  if (driverModal === 'driver1') {
                    save({ driver_1_id: picked })
                  } else {
                    save({ driver_2_id: picked })
                  }
                }}
                trackStat={track?.driver_track_stat || 'overtaking'}
                maxSeries={gpLevelConfig.seriesMax}
                initialShowHighestLevel={false}
                maxSelectable={1}
                singleSelect={true}
                driver1Id={slot.driver_1_id || undefined}
                driver2Id={slot.driver_2_id || undefined}
                bonusPercentage={bonusPercentage}
                bonusCheckedItems={bonusCheckedDrivers}
                onBonusToggle={handleBonusToggle}
              />
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => {
                save({ [driverModal === 'driver1' ? 'driver_1_id' : 'driver_2_id']: null })
              }}>Clear</Button>
              <Button onClick={() => setDriverModal(null)}>Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Boost Selection Modal ── */}
      {boostModal && (
        <BoostSelectModal
          title={`Select ${boostModal === 'driver1' ? 'Driver 1' : 'Driver 2'} Boost`}
          allBoosts={allBoosts}
          selectedId={boostModal === 'driver1' ? slot.driver_1_boost_id : slot.driver_2_boost_id}
          trackDriverStat={track?.driver_track_stat || 'overtaking'}
          trackCarStat={track?.car_track_stat || 'speed'}
          onSelect={(id) => {
            save({ [boostModal === 'driver1' ? 'driver_1_boost_id' : 'driver_2_boost_id']: id })
          }}
          onClose={() => setBoostModal(null)}
        />
      )}
    </div>
  )
}

// ─── Main Editor Page ─────────────────────────────────────────────────────────

export default function GpGuideEditorPage() {
  const params = useParams()
  const router = useRouter()
  const guideId = params.id as string

  const [guide, setGuide] = useState<GpGuide | null>(null)
  const [allTracks, setAllTracks] = useState<TrackInfo[]>([])
  const [allDrivers, setAllDrivers] = useState<DriverView[]>([])
  const [allBoosts, setAllBoosts] = useState<any[]>([])
  const [allSetups, setAllSetups] = useState<UserCarSetup[]>([])
  const [allCarParts, setAllCarParts] = useState<CarPartView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [importingSlotId, setImportingSlotId] = useState<string | null>(null)
  const [bulkImporting, setBulkImporting] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [showCondensed, setShowCondensed] = useState(false)

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  useEffect(() => {
    async function load() {
      const headers = await getAuthHeaders()
      const opts = { headers, credentials: 'same-origin' as const }
      const [guideRes, tracksRes, driversRes, boostsRes, setupsRes, carPartsRes] = await Promise.all([
        fetch(`/api/gp-guides/${guideId}`, opts),
        fetch('/api/tracks', opts),
        fetch('/api/drivers/user?limit=500', opts),
        fetch('/api/user-boosts?limit=200', opts),  // Use user-boosts to get card_count
        fetch('/api/setups', opts),
        fetch('/api/car-parts/user?limit=1000', opts),
      ])
      if (!guideRes.ok) { router.push('/gp-guides'); return }
      const guideData = await guideRes.json()
      const tracksData = tracksRes.ok ? await tracksRes.json() : []
      const driversData = driversRes.ok ? await driversRes.json() : { data: [] }
      const boostsData = boostsRes.ok ? await boostsRes.json() : { data: [] }
      const setupsData = setupsRes.ok ? await setupsRes.json() : { data: [] }
      const carPartsData = carPartsRes.ok ? await carPartsRes.json() : { data: [] }
      setGuide(guideData.data)
      setAllTracks(Array.isArray(tracksData) ? tracksData : (tracksData.data || []))
      setAllDrivers(driversData.data || [])
      setAllBoosts(boostsData.data || [])
      setAllSetups(setupsData.data || [])
      setAllCarParts(carPartsData.data || [])
      setIsLoading(false)
    }
    load()
  }, [guideId, router])

  const saveHeader = useCallback(async (patch: Partial<GpGuide>) => {
    if (!guide) return
    setGuide(prev => prev ? { ...prev, ...patch } : prev)
    try {
      const headers = await getAuthHeaders()
      console.log('Sending PATCH request with data:', patch)
      const response = await fetch(`/api/gp-guides/${guideId}`, {
        method: 'PUT', headers, credentials: 'same-origin', body: JSON.stringify(patch),
      })
      console.log('Response status:', response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
      }
      return response
      if ('weekend_strategy_same' in patch) {
        const res = await fetch(`/api/gp-guides/${guideId}`, { headers, credentials: 'same-origin' })
        if (res.ok) { const d = await res.json(); setGuide(d.data) }
      }
    } catch { /* silent */ }
  }, [guide, guideId])

  const handleSlotUpdate = useCallback((slotId: string, patch: Partial<TrackSlot>) => {
    setGuide(prev => {
      if (!prev) return prev
      return { ...prev, tracks: prev.tracks.map(t => t.id === slotId ? { ...t, ...patch } : t) }
    })
  }, [])

  const handleImport = useCallback(async (slotId: string, trackId: string, isWet: boolean) => {
    setImportingSlotId(slotId)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/gp-guides/${guideId}/import/${trackId}?is_wet=${isWet}`, { headers, credentials: 'same-origin' })
      if (!res.ok) { showToast('Failed to import track guide', 'error'); return }
      const json = await res.json()
      // Check if track guide was found
      if (!json.found || !json.data) {
        showToast(json.message || 'No track guide found for this track', 'error')
        return
      }
      const saveRes = await fetch(`/api/gp-guides/${guideId}/tracks/${slotId}`, {
        method: 'PUT', headers, credentials: 'same-origin', body: JSON.stringify(json.data),
      })
      if (saveRes.ok) {
        const saved = await saveRes.json()
        setGuide(prev => prev ? { ...prev, tracks: prev.tracks.map(t => t.id === slotId ? { ...t, ...saved.data } : t) } : prev)
        showToast('Track guide imported ✓')
      }
    } catch { showToast('Failed to import track guide', 'error') }
    finally { setImportingSlotId(null) }
  }, [guideId, showToast])

  const handleBulkImport = useCallback(async (raceType: 'qualifying' | 'opening' | 'final') => {
    if (!guide) return
    setBulkImporting(raceType)
    const slots = guide.tracks.filter(t => t.race_type === raceType && t.track_id)
    let imported = 0, skipped = 0
    const headers = await getAuthHeaders()
    for (const slot of slots) {
      try {
        const res = await fetch(`/api/gp-guides/${guideId}/import/${slot.track_id}?is_wet=${slot.is_wet}`, { headers, credentials: 'same-origin' })
        if (!res.ok) { skipped++; continue }
        const json = await res.json()
        // Check if track guide was found
        if (!json.found || !json.data) { skipped++; continue }
        const saveRes = await fetch(`/api/gp-guides/${guideId}/tracks/${slot.id}`, {
          method: 'PUT', headers, credentials: 'same-origin', body: JSON.stringify(json.data),
        })
        if (saveRes.ok) {
          const saved = await saveRes.json()
          setGuide(prev => prev ? { ...prev, tracks: prev.tracks.map(t => t.id === slot.id ? { ...t, ...saved.data } : t) } : prev)
          imported++
        } else { skipped++ }
      } catch { skipped++ }
    }
    setBulkImporting(null)
    showToast(skipped === 0 ? `Imported ${imported} ✓` : `Imported ${imported}, skipped ${skipped}`, skipped > 0 && imported === 0 ? 'error' : 'success')
  }, [guide, guideId, showToast])

  const saveResults = useCallback(async (trackId: string, notes: string) => {
    try {
      const headers = await getAuthHeaders()
      console.log('Sending race results PUT request with data:', { results_notes: notes || null })
      console.log('trackId:', trackId)
      const response = await fetch(`/api/gp-guides/${guideId}/results/${trackId}`, {
        method: 'PUT', headers, credentials: 'same-origin', body: JSON.stringify({ results_notes: notes || null }),
      })
      console.log('Race results response status:', response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Race results response error:', errorText)
      }
    } catch { /* silent */ }
  }, [guideId])

  const handleResultsChange = useCallback((trackId: string, notes: string) => {
    setGuide(prev => {
      if (!prev) return prev
      const existing = prev.results.find(r => r.track_id === trackId)
      if (existing) return { ...prev, results: prev.results.map(r => r.track_id === trackId ? { ...r, results_notes: notes } : r) }
      return { ...prev, results: [...prev.results, { gp_guide_id: guideId, track_id: trackId, results_notes: notes }] }
    })
  }, [guideId])

  const uniqueTracksForResults = useCallback(() => {
    if (!guide) return []
    const seen = new Set<string>()
    const result: { id: string; name: string; display_name: string | null }[] = []
    guide.tracks.forEach(slot => {
      if (slot.track_id && !seen.has(slot.track_id)) {
        seen.add(slot.track_id)
        const t = allTracks.find(tr => tr.id === slot.track_id)
        if (t) result.push({ id: t.id, name: t.name, display_name: t.display_name })
      }
    })
    return result
  }, [guide, allTracks])

  const qualifying = guide?.tracks.filter(t => t.race_type === 'qualifying').sort((a, b) => a.race_number - b.race_number) || []
  const opening = guide?.tracks.filter(t => t.race_type === 'opening').sort((a, b) => a.race_number - b.race_number) || []
  const final = guide?.tracks.filter(t => t.race_type === 'final').sort((a, b) => a.race_number - b.race_number) || []

  const gpLevel = guide ? (GP_LEVELS[guide.gp_level] || GP_LEVELS[3]) : GP_LEVELS[3]

  if (isLoading || !guide) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </ProtectedRoute>
    )
  }

  const sharedSlotProps = {
    guideId, gpLevel: guide.gp_level, allTracks, allDrivers, allBoosts, allSetups, carParts: allCarParts,
    onUpdate: handleSlotUpdate, onImport: handleImport, importingSlotId,
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-0 px-4 sm:px-6 lg:px-8">
          {toast && (
            <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
              {toast.msg}
            </div>
          )}

          {/* Header — matches Track Guide style */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{guide.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                      {guide.start_date && (
                        <span className="text-lg text-gray-600">
                          {guide.start_date.split('T')[0]}
                        </span>
                      )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium ${gpLevel.color}`}>
                    {gpLevel.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCondensed(v => !v)}>
                  {showCondensed ? '✏️ Edit Mode' : '📋 Condensed View'}
                </Button>
                {showCondensed && (
                  <Button variant="outline" size="sm" onClick={() => window.print()}>🖨️ Print</Button>
                )}
                <Link href="/gp-guides">
                  <Button variant="outline">Back to Guides</Button>
                </Link>
              </div>
            </div>
          </div>

          {showCondensed ? (
            <CondensedView guide={guide} allTracks={allTracks} allDrivers={allDrivers} allBoosts={allBoosts} allSetups={allSetups} />
          ) : (
            <>
              <Card className="p-4 mb-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-4 items-start">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">GP Name</label>
                      <input type="text" defaultValue={guide.name}
                        onBlur={e => { if (e.target.value !== guide.name) saveHeader({ name: e.target.value }) }}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="min-w-[140px]">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Date</label>
                      <input type="date" defaultValue={guide.start_date ? guide.start_date.split('T')[0] : ''}
                        onChange={e => saveHeader({ start_date: e.target.value ? e.target.value : null })}
                        onBlur={e => saveHeader({ start_date: e.target.value ? e.target.value : null })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="min-w-[160px]">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">GP Level</label>
                      <select value={guide.gp_level} onChange={e => saveHeader({ gp_level: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {GP_LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      Notes (Boosted Assets, Bonus Requirements &amp; Rewards)
                    </label>
                    <textarea defaultValue={guide.notes || ''}
                      onBlur={e => saveHeader({ notes: e.target.value || null })}
                      placeholder="e.g. Norris Rare lvl3+ → +5 Race Points; Verstappen Epic boosted +10%…"
                      rows={3}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                </div>
              </Card>

              <SectionHeader title="Qualifying Round" subtitle="4 qualification races" raceType="qualifying" onBulkImport={handleBulkImport} bulkImporting={bulkImporting} />
              <div className="mb-4">{qualifying.map(slot => <TrackSlotCard key={slot.id} slot={slot} {...sharedSlotProps} />)}</div>

              <Card className="p-3 mb-3 flex items-center gap-3 bg-gray-50 border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div onClick={() => saveHeader({ weekend_strategy_same: !guide.weekend_strategy_same })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${guide.weekend_strategy_same ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${guide.weekend_strategy_same ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Opening &amp; Final rounds use the <strong>same strategy</strong>
                  </span>
                </label>
                {!guide.weekend_strategy_same && <span className="text-xs text-amber-600">Showing separate strategies for Opening and Final rounds</span>}
              </Card>

              <SectionHeader title="Opening Round (Saturday)" subtitle="8 weekend races" raceType="opening" onBulkImport={handleBulkImport} bulkImporting={bulkImporting} />
              <div className="mb-4">{opening.map(slot => <TrackSlotCard key={slot.id} slot={slot} {...sharedSlotProps} />)}</div>

              {!guide.weekend_strategy_same && (
                <>
                  <SectionHeader title="Final Round (Sunday)" subtitle="8 weekend races — separate strategy" raceType="final" onBulkImport={handleBulkImport} bulkImporting={bulkImporting} />
                  <div className="mb-4">{final.map(slot => <TrackSlotCard key={slot.id} slot={slot} {...sharedSlotProps} />)}</div>
                </>
              )}

              <Card className="p-4 mt-6">
                <h2 className="text-base font-semibold text-gray-900 mb-1">Race Results Notes</h2>
                <p className="text-xs text-gray-500 mb-3">Notes per track — record Quali position, PvP/bot, boosts used, final result, safety car, etc.</p>
                {uniqueTracksForResults().length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No tracks assigned yet.</p>
                ) : (
                  <div className="space-y-3">
                    {uniqueTracksForResults().map(t => {
                      const result = guide.results.find(r => r.track_id === t.id)
                      return (
                        <div key={t.id}>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">{t.display_name || t.name}</label>
                          <textarea value={result?.results_notes || ''}
                            onChange={e => handleResultsChange(t.id, e.target.value)}
                            onBlur={e => saveResults(t.id, e.target.value)}
                            placeholder="Quali pos, PvP or bot, boosts used, final result…"
                            rows={2}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
    </ProtectedRoute>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, raceType, onBulkImport, bulkImporting }: {
  title: string; subtitle: string; raceType: 'qualifying' | 'opening' | 'final'
  onBulkImport: (rt: 'qualifying' | 'opening' | 'final') => void; bulkImporting: string | null
}) {
  return (
    <div className="flex items-center justify-between mb-2 mt-2">
      <div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <Button variant="outline" size="sm" disabled={bulkImporting === raceType}
        onClick={() => onBulkImport(raceType)} className="text-xs">
        {bulkImporting === raceType ? 'Importing…' : '↓ Import All Track Guides'}
      </Button>
    </div>
  )
}

// ─── Condensed View ───────────────────────────────────────────────────────────

function CondensedView({ guide, allTracks, allDrivers, allBoosts, allSetups }: {
  guide: GpGuide; allTracks: TrackInfo[]; allDrivers: DriverView[]; allBoosts: BoostView[]; allSetups: UserCarSetup[]
}) {
  const [showNotes, setShowNotes] = useState(true)
  const gpLevel = GP_LEVELS[guide.gp_level] || GP_LEVELS[3]
  const qualifying = guide.tracks.filter(t => t.race_type === 'qualifying').sort((a, b) => a.race_number - b.race_number)
  const opening = guide.tracks.filter(t => t.race_type === 'opening').sort((a, b) => a.race_number - b.race_number)
  const final = guide.tracks.filter(t => t.race_type === 'final').sort((a, b) => a.race_number - b.race_number)

  const renderSlots = (slots: TrackSlot[]) => slots.map((slot, i) => {
    const track = allTracks.find(t => t.id === slot.track_id) || null
    if (!track && !slot.track_id) return <div key={slot.id} className="py-1 text-gray-400 text-base">{i + 1}. <em>Track not assigned</em></div>
    const d1 = allDrivers.find(d => d.id === slot.driver_1_id) || null
    const d2 = allDrivers.find(d => d.id === slot.driver_2_id) || null
    const b1 = allBoosts.find(b => b.id === slot.driver_1_boost_id) || null
    const b2 = allBoosts.find(b => b.id === slot.driver_2_boost_id) || null
    const setup = allSetups.find(s => s.id === slot.saved_setup_id) || null
    const d1RarityLabel = d1 ? (d1.rarity === 5 ? getCollectionRarityDisplay(d1.collection_theme ?? null, d1.collection_sub_name ?? null) : getRarityDisplay(d1.rarity)) : ''
    const d2RarityLabel = d2 ? (d2.rarity === 5 ? getCollectionRarityDisplay(d2.collection_theme ?? null, d2.collection_sub_name ?? null) : getRarityDisplay(d2.rarity)) : ''
    return (
      <div key={slot.id} className="mb-4 print:mb-2 border-b border-gray-100 pb-2 last:border-0">
        <div className="font-semibold text-lg print:text-base text-gray-900">
          {i + 1}. {track ? (track.display_name || track.name) : '?'} — {track?.laps || '?'} Laps
          {track ? ` · ${capitalizeStat(track.driver_track_stat)} / ${capitalizeStat(track.car_track_stat)}` : ''}
          {' '}{slot.is_wet ? '🌧️' : '☀️'}
        </div>
        {setup && <div className="ml-4 text-base print:text-sm text-gray-600"><strong>Setup:</strong> {setup.name}{slot.setup_notes ? ` — ${slot.setup_notes}` : ''}</div>}
        {d1 && (
          <div className="ml-4 text-base print:text-sm text-gray-700">
            <strong>D1:</strong>{' '}
            <span className={`inline-block rounded px-1.5 py-0.5 ${getRarityBackground(d1.rarity)} text-black font-medium`}>
              {d1.name} · {d1RarityLabel}
            </span>
            {b1 ? ` — ${boostDisplayName(b1)}` : ''}
            {slot.driver_1_tire_strategy ? ` — ${slot.driver_1_tire_strategy}` : ''}
          </div>
        )}
        {d2 && (
          <div className="ml-4 text-base print:text-sm text-gray-700">
            <strong>D2:</strong>{' '}
            <span className={`inline-block rounded px-1.5 py-0.5 ${getRarityBackground(d2.rarity)} text-black font-medium`}>
              {d2.name} · {d2RarityLabel}
            </span>
            {b2 ? ` — ${boostDisplayName(b2)}` : ''}
            {slot.driver_2_tire_strategy ? ` — ${slot.driver_2_tire_strategy}` : ''}
          </div>
        )}
        {slot.strategy_notes && <div className="ml-4 text-base print:text-sm text-gray-500 italic">{slot.strategy_notes}</div>}
      </div>
    )
  })

  return (
    <div className="print:text-sm">
      {guide.notes && (
        <div className="mb-4">
          <label className="flex items-center gap-1 text-xs text-gray-500 mb-2 cursor-pointer select-none">
            <input type="checkbox" checked={showNotes} onChange={e => setShowNotes(e.target.checked)} />
            Show notes
          </label>
          {showNotes && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-base text-gray-800 whitespace-pre-line">
              <strong>Notes:</strong> {guide.notes}
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {qualifying.length > 0 && <div className="mb-4"><h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">Qualifying Round</h2>{renderSlots(qualifying)}</div>}
        {opening.length > 0 && <div className="mb-4"><h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">Opening Round (Saturday)</h2>{renderSlots(opening)}</div>}
        {!guide.weekend_strategy_same && final.length > 0 && <div className="mb-4 col-start-1"><h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">Final Round (Sunday)</h2>{renderSlots(final)}</div>}
        {guide.weekend_strategy_same && opening.length > 0 && <div className="mb-4 col-start-1"><h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">Final Round (Sunday) — Same as Opening</h2><p className="text-xs text-gray-500 italic">Uses the same strategy as Opening Round above.</p></div>}
      </div>
      {guide.results.filter(r => r.results_notes).length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-300">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Race Results</h2>
          {guide.results.filter(r => r.results_notes).map(r => {
            const t = allTracks.find(tr => tr.id === r.track_id)
            return <div key={r.track_id} className="mb-2"><span className="text-sm font-semibold text-gray-700">{t?.name || r.track_id}:</span>{' '}<span className="text-sm text-gray-600 whitespace-pre-line">{r.results_notes}</span></div>
          })}
        </div>
      )}
    </div>
  )
}
