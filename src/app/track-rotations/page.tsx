'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import {
  useCurrentTrackRotation,
  useTrackRotationSchedule,
  useUserRotationSetData,
  useUpsertRotationSeriesData,
  useUpsertRotationTrackData,
  useUserBoosts,
  useUserDrivers,
  useUserCarSetups,
  useUserCarParts,
} from '@/hooks/useApi'
import { useSeason } from '@/contexts/SeasonContext'
import { cn, getRarityBackground } from '@/lib/utils'
import type {
  RotationTrackEntryWithInfo,
  UserRotationSeriesData,
  UserRotationTrackData,
  BoostView,
  DriverView,
  UserCarSetup,
  CarPartView,
} from '@/types/database'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DriverDisplay } from '@/components/DriverDisplay'
import { DriverSelectionGrid } from '@/components/DriverSelectionGrid'
import { RotationSetupCard, RotationSetupPatch } from '@/components/RotationSetupCard'

const statDisplayNames: Record<string, string> = {
  tyreUse: 'Tyre Management',
  overtaking: 'Overtaking',
  defending: 'Defending',
  raceStart: 'Race Start',
  speed: 'Speed',
  cornering: 'Cornering',
  powerUnit: 'Power Unit',
  none: 'None',
}

// Maps track stat names to boost stat keys (same as track-guides)
const trackStatToBoostStat: Record<string, string> = {
  overtaking: 'overtake',
  overtake: 'overtake',
  defending: 'block',
  defend: 'block',
  block: 'block',
  corners: 'corners',
  cornering: 'corners',
  tyre_use: 'tyre_use',
  tyreUse: 'tyre_use',
  tyre: 'tyre_use',
  power_unit: 'power_unit',
  powerUnit: 'power_unit',
  speed: 'speed',
  pit_stop: 'pit_stop',
  pitStop: 'pit_stop',
  race_start: 'race_start',
  raceStart: 'race_start',
}

// Color coding for boost stat tier values (matching track-guides)
function getBoostValueColor(tierValue: number): string {
  return tierValue === 1 ? 'bg-blue-200' :
         tierValue === 2 ? 'bg-green-200' :
         tierValue === 3 ? 'bg-yellow-200' :
         tierValue === 4 ? 'bg-orange-200' :
         tierValue === 5 ? 'bg-red-300' : 'bg-gray-50'
}

const weatherLabel: Record<string, string> = {
  dry: 'Dry',
  wet: 'Wet',
  mixed: 'Mixed',
}

const weatherClass: Record<string, string> = {
  dry: 'text-amber-600',
  wet: 'text-blue-600',
  mixed: 'text-gray-500',
}

function formatStat(stat: string | undefined): string {
  if (!stat) return '—'
  return statDisplayNames[stat] || stat
}

// ─── RotationSeriesCard ────────────────────────────────────────────────────────

interface RotationSeriesCardProps {
  seriesNumber: number
  seriesIndex: number
  tracks: RotationTrackEntryWithInfo[]
  seriesData?: UserRotationSeriesData
  trackDataMap: Record<string, UserRotationTrackData>
  allBoosts: BoostView[]
  allDrivers: DriverView[]
  allSetups: UserCarSetup[]
  allCarParts: CarPartView[]
  onSaveSeries: (patch: Partial<Pick<UserRotationSeriesData, 'driver_1_id' | 'driver_2_id'>> | RotationSetupPatch) => void
  onSaveTrack: (position: number, patch: Partial<Pick<UserRotationTrackData, 'boost_id' | 'dry_strategy' | 'wet_strategy'>>) => void
  quickRef?: boolean
}

function RotationSeriesCard({
  seriesNumber,
  seriesIndex,
  tracks,
  seriesData,
  trackDataMap,
  allBoosts,
  allDrivers,
  allSetups,
  allCarParts,
  onSaveSeries,
  onSaveTrack,
  quickRef = false,
}: RotationSeriesCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showDriverSetup, setShowDriverSetup] = useState(false)
  const [boostModal, setBoostModal] = useState<{ open: boolean; position: number }>({ open: false, position: 0 })
  const [driverModal, setDriverModal] = useState<{ open: boolean; slot: 'driver_1_id' | 'driver_2_id' } | null>(null)

  const [bonusCheckedDrivers, setBonusCheckedDrivers] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('track-rotation-bonus-drivers')
        if (stored) return new Set(JSON.parse(stored))
      } catch {}
    }
    return new Set()
  })

  const handleBonusToggle = useCallback((driverId: string) => {
    setBonusCheckedDrivers(prev => {
      const next = new Set(prev)
      if (next.has(driverId)) { next.delete(driverId) } else { next.add(driverId) }
      try { localStorage.setItem('track-rotation-bonus-drivers', JSON.stringify(Array.from(next))) } catch {}
      return next
    })
  }, [])

  const driver1 = useMemo(() => allDrivers.find((d) => d.id === seriesData?.driver_1_id), [allDrivers, seriesData?.driver_1_id])
  const driver2 = useMemo(() => allDrivers.find((d) => d.id === seriesData?.driver_2_id), [allDrivers, seriesData?.driver_2_id])

  // Most prevalent driver_track_stat across the 4 tracks
  const dominantDriverStat = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tracks) {
      if (t.driver_track_stat) {
        counts[t.driver_track_stat] = (counts[t.driver_track_stat] ?? 0) + 1
      }
    }
    let best = 'overtaking'
    let bestCount = 0
    for (const [stat, count] of Object.entries(counts)) {
      if (count > bestCount) { best = stat; bestCount = count }
    }
    return best
  }, [tracks])

  const showContent = quickRef || isExpanded

  return (
    <Card className="overflow-hidden">
      {quickRef ? (
        <div className="px-6 py-3">
          <h2 className="text-lg font-semibold text-gray-900">Series {seriesNumber}</h2>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-xl w-6 flex-shrink-0">
              {isExpanded ? '▼' : '▶'}
            </span>
            <h2 className="text-lg font-semibold text-gray-900">Series {seriesNumber}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Tracks:</span>
              <span className="font-medium text-gray-900">
                {tracks.map((t) => t.track).join(', ')}
              </span>
            </div>
          </div>
        </button>
      )}

      {showContent && (
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Track
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Driver Stat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Car Stat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Weather
                </th>
                {!quickRef && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                    Laps
                  </th>
                )}
                {!quickRef && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                    Boost
                  </th>
                )}
                {!quickRef && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                    Strategy
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tracks.map((entry, i) => {
                const trackKey = `${seriesIndex}_${i}`
                const td = trackDataMap[trackKey]
                const boost = allBoosts.find((b) => b.id === td?.boost_id) ?? null

                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.track}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                      {formatStat(entry.driver_track_stat)}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                      {formatStat(entry.car_track_stat)}
                    </td>
                    <td className={cn('px-6 py-2 whitespace-nowrap text-sm', weatherClass[entry.weather])}>
                      {weatherLabel[entry.weather] ?? entry.weather}
                    </td>
                    {!quickRef && (
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {entry.laps ?? '—'}
                      </td>
                    )}
                    {!quickRef && (
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        {boost ? (
                          <button
                            onClick={() => setBoostModal({ open: true, position: i })}
                            className="text-left text-xs font-medium text-gray-800 hover:text-blue-600 underline-offset-2 hover:underline truncate max-w-[120px]"
                            title="Change boost"
                          >
                            {boost.boost_custom_names?.custom_name ||
                              (boost.icon ? boost.icon.replace('BoostIcon_', '') : null) ||
                              boost.name}
                          </button>
                        ) : (
                          <button
                            onClick={() => setBoostModal({ open: true, position: i })}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            + Boost
                          </button>
                        )}
                      </td>
                    )}
                    {!quickRef && (
                      <td className="px-6 py-2 text-sm">
                        <StrategyCell
                          value={td?.dry_strategy ?? ''}
                          onBlur={(v) => onSaveTrack(i, { dry_strategy: v || null })}
                        />
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Below-table: Drivers (stacked) | Car Setup */}
          {!quickRef && (
            <div className="border-t border-gray-100">
              <button
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={() => setShowDriverSetup(v => !v)}
              >
                <span>Drivers &amp; Setup</span>
                <svg
                  className={cn('w-4 h-4 transition-transform', showDriverSetup ? 'rotate-180' : '')}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
          {!quickRef && showDriverSetup && (
            <div className="border-t border-gray-100 bg-gray-400 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Drivers column */}
              <div className="flex flex-col gap-4">
                <Card className="p-4">
                  <p className="text-base font-semibold text-gray-900 mb-4">Driver 1</p>
                  <div className={cn('rounded-lg p-4', driver1 ? getRarityBackground(driver1.rarity) : 'bg-gray-100')}>
                    <DriverDisplay
                      driver={driver1}
                      placeholderText="+ Select Driver 1"
                      onEdit={() => setDriverModal({ open: true, slot: 'driver_1_id' })}
                    />
                  </div>
                </Card>
                <Card className="p-4">
                  <p className="text-base font-semibold text-gray-900 mb-4">Driver 2</p>
                  <div className={cn('rounded-lg p-4', driver2 ? getRarityBackground(driver2.rarity) : 'bg-gray-100')}>
                    <DriverDisplay
                      driver={driver2}
                      placeholderText="+ Select Driver 2"
                      onEdit={() => setDriverModal({ open: true, slot: 'driver_2_id' })}
                    />
                  </div>
                </Card>
              </div>

              {/* Car Setup column */}
              <div>
                <RotationSetupCard
                  seriesData={seriesData}
                  allCarParts={allCarParts}
                  allSetups={allSetups}
                  onSave={(patch) => onSaveSeries(patch)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Boost picker modal */}
      {boostModal.open && (() => {
        const currentTrack = tracks[boostModal.position]

        // Count all driver + car stat references across all 4 tracks
        const statCounts: Record<string, number> = {}
        for (const t of tracks) {
          if (t.driver_track_stat) {
            const k = trackStatToBoostStat[t.driver_track_stat] ?? t.driver_track_stat
            statCounts[k] = (statCounts[k] ?? 0) + 1
          }
          if (t.car_track_stat) {
            const k = trackStatToBoostStat[t.car_track_stat] ?? t.car_track_stat
            statCounts[k] = (statCounts[k] ?? 0) + 1
          }
        }
        const rankedStats = Object.entries(statCounts).sort((a, b) => b[1] - a[1]).map(([s]) => s)
        const primaryBoostStat = rankedStats[0] ?? 'overtake'
        const secondaryBoostStat = rankedStats[1] ?? primaryBoostStat

        const sortedBoosts = [...allBoosts].sort((a, b) => {
          const aStats = a.boost_stats ?? {}
          const bStats = b.boost_stats ?? {}
          const aPri = aStats[primaryBoostStat] ?? 0
          const bPri = bStats[primaryBoostStat] ?? 0
          if (aPri !== bPri) return bPri - aPri
          const aSec = aStats[secondaryBoostStat] ?? 0
          const bSec = bStats[secondaryBoostStat] ?? 0
          if (aSec !== bSec) return bSec - aSec
          const aName = a.boost_custom_names?.custom_name || (a.icon ? a.icon.replace('BoostIcon_', '') : null) || a.name
          const bName = b.boost_custom_names?.custom_name || (b.icon ? b.icon.replace('BoostIcon_', '') : null) || b.name
          return aName.localeCompare(bName)
        })

        return (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setBoostModal({ open: false, position: 0 })}>
            <div className="bg-white rounded-lg w-full max-w-5xl mx-4 max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Select Boost — {currentTrack?.track}</h3>
                <button onClick={() => setBoostModal({ open: false, position: 0 })} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>
              <div className="overflow-auto flex-1 p-4">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-700 sticky top-0 z-10">
                    <tr>
                      {['Name', 'Amount', 'Overtake', 'Defend', 'Race Start', 'Tyre Use', 'Speed', 'Corners', 'Power Unit', 'Pit Stop'].map((col) => (
                        <th key={col} scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        onSaveTrack(boostModal.position, { boost_id: null })
                        setBoostModal({ open: false, position: 0 })
                      }}
                    >
                      <td className="px-3 py-1 text-sm text-gray-400 italic" colSpan={10}>— No boost</td>
                    </tr>
                    {sortedBoosts.map((b) => {
                      const s = b.boost_stats ?? {}
                      const isSelected = trackDataMap[`${seriesIndex}_${boostModal.position}`]?.boost_id === b.id
                      return (
                        <tr
                          key={b.id}
                          className={cn('hover:bg-gray-50 cursor-pointer transition-colors', isSelected && 'bg-blue-50')}
                          onClick={() => {
                            onSaveTrack(boostModal.position, { boost_id: b.id })
                            setBoostModal({ open: false, position: 0 })
                          }}
                        >
                          <td className="px-3 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                            {b.boost_custom_names?.custom_name || (b.icon ? b.icon.replace('BoostIcon_', '') : null) || b.name}
                          </td>
                          <td className="px-3 py-1 whitespace-nowrap text-sm text-center text-gray-900">{b.card_count || 0}</td>
                          <td className={cn('px-3 py-1 whitespace-nowrap text-sm text-center font-medium', s.overtake > 0 && getBoostValueColor(s.overtake))}>{s.overtake ? s.overtake * 5 : ''}</td>
                          <td className={cn('px-3 py-1 whitespace-nowrap text-sm text-center font-medium', s.block > 0 && getBoostValueColor(s.block))}>{s.block ? s.block * 5 : ''}</td>
                          <td className={cn('px-3 py-1 whitespace-nowrap text-sm text-center font-medium', s.race_start > 0 && getBoostValueColor(s.race_start))}>{s.race_start ? s.race_start * 5 : ''}</td>
                          <td className={cn('px-3 py-1 whitespace-nowrap text-sm text-center font-medium', s.tyre_use > 0 && getBoostValueColor(s.tyre_use))}>{s.tyre_use ? s.tyre_use * 5 : ''}</td>
                          <td className={cn('px-3 py-1 whitespace-nowrap text-sm text-center font-medium', s.speed > 0 && getBoostValueColor(s.speed))}>{s.speed ? s.speed * 5 : ''}</td>
                          <td className={cn('px-3 py-1 whitespace-nowrap text-sm text-center font-medium', s.corners > 0 && getBoostValueColor(s.corners))}>{s.corners ? s.corners * 5 : ''}</td>
                          <td className={cn('px-3 py-1 whitespace-nowrap text-sm text-center font-medium', s.power_unit > 0 && getBoostValueColor(s.power_unit))}>{s.power_unit ? s.power_unit * 5 : ''}</td>
                          <td className={cn('px-3 py-1 whitespace-nowrap text-sm text-center font-medium', s.pit_stop > 0 && getBoostValueColor(s.pit_stop))}>{s.pit_stop ? s.pit_stop * 5 : ''}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Driver picker modal */}
      {driverModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDriverModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {driverModal.slot === 'driver_1_id' ? 'Select Driver 1' : 'Select Driver 2'}
              </h3>
              <button onClick={() => setDriverModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="overflow-auto flex-1 p-4">
            <DriverSelectionGrid
              drivers={allDrivers}
              selectedDriverIds={
                driverModal.slot === 'driver_1_id'
                  ? seriesData?.driver_1_id ? [seriesData.driver_1_id] : []
                  : seriesData?.driver_2_id ? [seriesData.driver_2_id] : []
              }
              onDriverSelectionChange={(ids) => {
                onSaveSeries({ [driverModal.slot]: ids[0] ?? null })
                setDriverModal(null)
              }}
              singleSelect
              driver1Id={seriesData?.driver_1_id ?? undefined}
              driver2Id={seriesData?.driver_2_id ?? undefined}
              trackStat={dominantDriverStat}
              bonusCheckedItems={bonusCheckedDrivers}
              onBonusToggle={handleBonusToggle}
            />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── StrategyCell ──────────────────────────────────────────────────────────────

function StrategyCell({
  value,
  onBlur,
}: {
  value: string
  onBlur: (v: string) => void
}) {
  const [strategy, setStrategy] = useState(value)

  const prev = useRef(value)
  if (prev.current !== value) { prev.current = value; setStrategy(value) }

  return (
    <input
      value={strategy}
      onChange={(e) => setStrategy(e.target.value)}
      onBlur={(e) => onBlur(e.target.value)}
      placeholder="—"
      className="w-full min-w-[120px] text-xs border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
    />
  )
}

// ─── Date helpers ──────────────────────────────────────────────────────────────

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const startStr = start.toLocaleDateString('en-US', opts)
  const endStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })
  return `${startStr} – ${endStr}`
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  return date >= startDate && date <= endDate
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TrackRotationsPage() {
  const today = getTodayDate()
  const [viewDate, setViewDate] = useState(today)
  const [quickRef, setQuickRef] = useState(false)

  const { activeSeasonId } = useSeason()

  // Reset to today when the active season changes so we re-derive the best rotation
  useEffect(() => {
    setViewDate(getTodayDate())
  }, [activeSeasonId])

  const { data: scheduleData, isLoading: scheduleLoading } = useTrackRotationSchedule(activeSeasonId ?? undefined)
  const schedule = useMemo(() => scheduleData?.data ?? [], [scheduleData])

  const currentIndex = useMemo(() => {
    if (schedule.length === 0) return -1
    // Try exact date match first
    const matches = schedule
      .map((entry, idx) => ({ entry, idx }))
      .filter(({ entry }) => isDateInRange(viewDate, entry.start_date, entry.end_date))
    if (matches.length > 0) {
      return matches.reduce((best, curr) =>
        curr.entry.start_date > best.entry.start_date ? curr : best
      ).idx
    }
    // Date is outside the season's range — fall back to first or last entry
    if (viewDate < schedule[0].start_date) return 0
    return schedule.length - 1
  }, [schedule, viewDate])

  const currentEntry = currentIndex >= 0 ? schedule[currentIndex] : null
  const queryDate = currentEntry?.start_date ?? viewDate

  const { data: rotationView, isLoading: rotationLoading } = useCurrentTrackRotation(queryDate, activeSeasonId ?? undefined)

  const rotationSetId = rotationView?.rotation_set?.id

  // User data for this rotation set
  const { data: userRotationData } = useUserRotationSetData(rotationSetId)
  const upsertSeries = useUpsertRotationSeriesData()
  const upsertTrack = useUpsertRotationTrackData()

  // Supporting data (all fetched once at page level)
  const { data: boostsData } = useUserBoosts({ limit: 200 })
  const { data: driversData } = useUserDrivers({ limit: 1000 })
  const { data: setupsData } = useUserCarSetups()
  const { data: carPartsData } = useUserCarParts({ limit: 1000 })

  const allBoosts = useMemo(() => boostsData?.data ?? [], [boostsData])
  const allDrivers = useMemo(() => driversData?.data ?? [], [driversData])
  const allSetups = useMemo(() => setupsData?.data ?? [], [setupsData])
  const allCarParts = useMemo(() => carPartsData?.data ?? [], [carPartsData])

  // Lookup maps
  const seriesMap = useMemo(() => {
    const map: Record<number, UserRotationSeriesData> = {}
    for (const row of userRotationData?.series_data ?? []) {
      map[row.series_index] = row
    }
    return map
  }, [userRotationData])

  const trackMap = useMemo(() => {
    const map: Record<string, UserRotationTrackData> = {}
    for (const row of userRotationData?.track_data ?? []) {
      map[`${row.series_index}_${row.track_position}`] = row
    }
    return map
  }, [userRotationData])

  // Callbacks
  function handleSaveSeries(
    seriesIndex: number,
    patch: Partial<Pick<UserRotationSeriesData, 'driver_1_id' | 'driver_2_id'>> | RotationSetupPatch
  ) {
    if (!rotationSetId) return
    const existing = seriesMap[seriesIndex]
    upsertSeries.mutate({
      rotation_set_id: rotationSetId,
      series_index: seriesIndex,
      driver_1_id: existing?.driver_1_id ?? null,
      driver_2_id: existing?.driver_2_id ?? null,
      setup_brake_id: existing?.setup_brake_id ?? null,
      setup_gearbox_id: existing?.setup_gearbox_id ?? null,
      setup_rear_wing_id: existing?.setup_rear_wing_id ?? null,
      setup_front_wing_id: existing?.setup_front_wing_id ?? null,
      setup_suspension_id: existing?.setup_suspension_id ?? null,
      setup_engine_id: existing?.setup_engine_id ?? null,
      setup_bonus_percentage: existing?.setup_bonus_percentage ?? 0,
      setup_series_filter: existing?.setup_series_filter ?? 12,
      ...patch,
    })
  }

  function handleSaveTrack(
    seriesIndex: number,
    position: number,
    patch: Partial<Pick<UserRotationTrackData, 'boost_id' | 'dry_strategy' | 'wet_strategy'>>
  ) {
    if (!rotationSetId) return
    const existing = trackMap[`${seriesIndex}_${position}`]
    upsertTrack.mutate({
      rotation_set_id: rotationSetId,
      series_index: seriesIndex,
      track_position: position,
      boost_id: existing?.boost_id ?? null,
      dry_strategy: existing?.dry_strategy ?? null,
      wet_strategy: existing?.wet_strategy ?? null,
      ...patch,
    })
  }

  const isCurrentRotation = useMemo(() => {
    if (!currentEntry) return false
    return isDateInRange(today, currentEntry.start_date, currentEntry.end_date)
  }, [currentEntry, today])

  const todayIndex = useMemo(() => {
    const matches = schedule
      .map((entry, idx) => ({ entry, idx }))
      .filter(({ entry }) => isDateInRange(today, entry.start_date, entry.end_date))
    if (matches.length === 0) return -1
    return matches.reduce((best, curr) =>
      curr.entry.start_date > best.entry.start_date ? curr : best
    ).idx
  }, [schedule, today])

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < schedule.length - 1
  const rotationNumber = currentIndex + 1

  function goToPrev() {
    if (!canGoPrev) return
    setViewDate(schedule[currentIndex - 1].start_date)
  }

  function goToNext() {
    if (!canGoNext) return
    setViewDate(schedule[currentIndex + 1].start_date)
  }

  const isLoading = scheduleLoading || rotationLoading

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Track Rotations</h1>
            <p className="mt-2 text-gray-600">
              Series 10–12 rotate tracks every two weeks on Wednesdays.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickRef((v) => !v)}
            className={quickRef ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800' : ''}
          >
            Quick Ref
          </Button>
        </div>

        {/* Navigator */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrev}
            disabled={!canGoPrev || isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            {currentEntry ? (
              <>
                <p className="font-semibold text-gray-900">Rotation {rotationNumber}</p>
                <p className="text-sm text-gray-500">
                  {formatDateRange(currentEntry.start_date, currentEntry.end_date)}
                </p>
              </>
            ) : isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <p className="text-gray-500">No rotation found</p>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={!canGoNext || isLoading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Not-current rotation banner */}
        {!isCurrentRotation && currentEntry && (
          <div className="mb-4 px-4 py-3 rounded-lg border bg-amber-50 border-amber-200 text-amber-800 text-sm">
            Viewing rotation {rotationNumber} — not the current rotation.{' '}
            {todayIndex >= 0 && (
              <button
                onClick={() => setViewDate(today)}
                className="underline hover:text-amber-900 font-medium"
              >
                Go to current rotation
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : rotationView ? (
          <div className={quickRef ? 'flex justify-center' : undefined}>
            <div className={quickRef ? 'w-1/2 space-y-4' : 'space-y-4'}>
              {[...rotationView.series].reverse().map((s) => (
                <RotationSeriesCard
                  key={s.series_index}
                  seriesNumber={s.series_number}
                  seriesIndex={s.series_index}
                  tracks={s.tracks}
                  seriesData={seriesMap[s.series_index]}
                  trackDataMap={trackMap}
                  allBoosts={allBoosts}
                  allDrivers={allDrivers}
                  allSetups={allSetups}
                  allCarParts={allCarParts}
                  onSaveSeries={(patch) => handleSaveSeries(s.series_index, patch)}
                  onSaveTrack={(pos, patch) => handleSaveTrack(s.series_index, pos, patch)}
                  quickRef={quickRef}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center text-gray-500">
            No rotation data available.
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
