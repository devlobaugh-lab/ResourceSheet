'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { CarPartView, UserCarSetup, UserRotationSeriesData } from '@/types/database'
import { CarPartSelectionGrid } from './CarPartSelectionGrid'
import { Card } from './ui/Card'
import { cn } from '@/lib/utils'

const ALL_PART_TYPES = [
  { key: 'front_wing',  dbKey: 'setup_front_wing_id', type: 4, label: 'Front Wing' },
  { key: 'brake',       dbKey: 'setup_brake_id',      type: 1, label: 'Brake' },
  { key: 'suspension',  dbKey: 'setup_suspension_id', type: 3, label: 'Suspension' },
  { key: 'rear_wing',   dbKey: 'setup_rear_wing_id',  type: 5, label: 'Rear Wing' },
  { key: 'gearbox',     dbKey: 'setup_gearbox_id',    type: 0, label: 'Gearbox' },
  { key: 'engine',      dbKey: 'setup_engine_id',     type: 2, label: 'Engine' },
  { key: 'battery',     dbKey: 'setup_battery_id',    type: 6, label: 'Battery' },
] as const

type PartKey = typeof ALL_PART_TYPES[number]['key']
type DbPartKey = typeof ALL_PART_TYPES[number]['dbKey']

const getRarityBg = (rarity: number): string =>
  rarity === 0 ? 'bg-gray-300' :
  rarity === 1 ? 'bg-blue-200' :
  rarity === 2 ? 'bg-orange-200' :
  rarity === 3 ? 'bg-purple-300' :
  rarity === 4 ? 'bg-yellow-300' :
  rarity === 5 ? 'bg-red-300' : 'bg-gray-300'

const getStatValue = (part: CarPartView | undefined, statName: string, bonusPercentage: number, hasBonus: boolean): number => {
  if (!part) return 0
  const userLevel = part.level || 0
  if (userLevel === 0) return 0
  const stats = part.stats_per_level
  if (!stats || !Array.isArray(stats) || stats.length < userLevel) return 0
  const baseValue = (stats[userLevel - 1] as Record<string, number>)[statName] || 0
  if (!hasBonus || bonusPercentage <= 0) return baseValue
  if (statName === 'pitStopTime') {
    return Math.round((baseValue * (1 - bonusPercentage / 100)) * 100) / 100
  }
  return Math.ceil(baseValue * (1 + bonusPercentage / 100))
}

export type RotationSetupPatch = {
  setup_brake_id?: string | null
  setup_gearbox_id?: string | null
  setup_rear_wing_id?: string | null
  setup_front_wing_id?: string | null
  setup_suspension_id?: string | null
  setup_engine_id?: string | null
  setup_battery_id?: string | null
  setup_bonus_percentage?: number
  setup_series_filter?: number
}

interface RotationSetupCardProps {
  seriesData?: UserRotationSeriesData
  allCarParts: CarPartView[]
  allSetups: UserCarSetup[]
  onSave: (patch: RotationSetupPatch) => void
  seasonNumber?: number | null
}

export function RotationSetupCard({
  seriesData,
  allCarParts,
  allSetups,
  onSave,
  seasonNumber,
}: RotationSetupCardProps) {
  const isFY26 = (seasonNumber ?? 0) >= 7
  const PART_TYPES = isFY26 ? ALL_PART_TYPES : ALL_PART_TYPES.filter(p => p.type !== 6)
  const [partModal, setPartModal] = useState<{ partKey: PartKey; partType: number } | null>(null)
  const [bonusInput, setBonusInput] = useState<string>(() => String(seriesData?.setup_bonus_percentage ?? 0))
  const [seriesFilterInput, setSeriesFilterInput] = useState<string>(() => String(seriesData?.setup_series_filter ?? 12))
  const [bonusCheckedItems, setBonusCheckedItems] = useState<Set<string>>(() => {
    if (!seriesData?.id) return new Set()
    try {
      const raw = localStorage.getItem(`rotation-bonus-parts:${seriesData.id}`)
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    if (!seriesData?.id) return
    try {
      localStorage.setItem(`rotation-bonus-parts:${seriesData.id}`, JSON.stringify(Array.from(bonusCheckedItems)))
    } catch { /* ignore */ }
  }, [bonusCheckedItems, seriesData?.id])

  // Sync inputs when seriesData changes (e.g. after load-from-setup)
  const prevSeriesData = React.useRef(seriesData)
  if (prevSeriesData.current !== seriesData) {
    prevSeriesData.current = seriesData
    const newBonus = String(seriesData?.setup_bonus_percentage ?? 0)
    const newFilter = String(seriesData?.setup_series_filter ?? 12)
    if (newBonus !== bonusInput) setBonusInput(newBonus)
    if (newFilter !== seriesFilterInput) setSeriesFilterInput(newFilter)
  }

  const getPartId = (key: PartKey): string | null => {
    const pt = ALL_PART_TYPES.find(p => p.key === key)!
    return (seriesData?.[pt.dbKey as keyof UserRotationSeriesData] as string | null) ?? null
  }

  const getPart = (key: PartKey): CarPartView | undefined =>
    allCarParts.find(p => p.id === getPartId(key))

  const bonusPercentage = seriesData?.setup_bonus_percentage ?? 0

  const totalStats = useMemo(() => {
    const bonusPct = bonusPercentage
    const s = { speed: 0, cornering: 0, powerUnit: 0, qualifying: 0, drs: 0, overtake: 0, pitStopTime: 0 }
    for (const { key } of PART_TYPES) {
      const part = getPart(key)
      if (part) {
        const hasBonus = bonusCheckedItems.has(part.id)
        s.speed       += getStatValue(part, 'speed', bonusPct, hasBonus)
        s.cornering   += getStatValue(part, 'cornering', bonusPct, hasBonus)
        s.powerUnit   += getStatValue(part, 'powerUnit', bonusPct, hasBonus)
        s.qualifying  += getStatValue(part, 'qualifying', bonusPct, hasBonus)
        s.drs         += getStatValue(part, 'drs', bonusPct, hasBonus)
        s.overtake    += getStatValue(part, 'powerBoostImpact', bonusPct, hasBonus) +
                         getStatValue(part, 'powerBoostDuration', bonusPct, hasBonus) +
                         getStatValue(part, 'powerBoostRechargeRate', bonusPct, hasBonus)
        s.pitStopTime += getStatValue(part, 'pitStopTime', bonusPct, hasBonus)
      }
    }
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesData, allCarParts, bonusCheckedItems, bonusInput, isFY26])

  function handlePartSelect(partKey: PartKey, partId: string) {
    const pt = PART_TYPES.find(p => p.key === partKey)!
    const currentId = getPartId(partKey)
    const newId = currentId === partId ? null : partId
    onSave({ [pt.dbKey]: newId } as RotationSetupPatch)
  }

  function handleLoadFromSetup(setupId: string) {
    if (!setupId) return
    const setup = allSetups.find(s => s.id === setupId)
    if (!setup) return
    onSave({
      setup_brake_id:      setup.brake_id,
      setup_gearbox_id:    setup.gearbox_id,
      setup_rear_wing_id:  setup.rear_wing_id,
      setup_front_wing_id: setup.front_wing_id,
      setup_suspension_id: setup.suspension_id,
      setup_engine_id:     setup.engine_id,
      setup_battery_id:    setup.battery_id,
      setup_bonus_percentage: setup.bonus_percentage ?? 0,
      setup_series_filter:    setup.series_filter ?? 12,
    })
  }

  function handleBonusBlur() {
    const val = parseInt(bonusInput, 10)
    if (!isNaN(val) && val >= 0 && val <= 100) {
      onSave({ setup_bonus_percentage: val })
    } else {
      setBonusInput(String(bonusPercentage))
    }
  }

  function handleSeriesFilterBlur() {
    const val = parseInt(seriesFilterInput, 10)
    if (!isNaN(val) && val >= 1) {
      onSave({ setup_series_filter: val })
    } else {
      setSeriesFilterInput(String(seriesData?.setup_series_filter ?? 12))
    }
  }

  const currentSeriesFilter = seriesData?.setup_series_filter ?? 12

  return (
    <Card className="p-4 space-y-3">
      {/* Header row: label + load dropdown */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-semibold text-gray-900">Car Setup</span>
        {allSetups.length > 0 && (
          <select
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[160px]"
            defaultValue=""
            onChange={(e) => { handleLoadFromSetup(e.target.value); e.target.value = '' }}
          >
            <option value="" disabled>Load from saved…</option>
            {allSetups.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Series filter + Bonus % row */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <label className="flex items-center gap-1">
          Max Series
          <input
            type="number"
            min={1}
            value={seriesFilterInput}
            onChange={(e) => setSeriesFilterInput(e.target.value)}
            onBlur={handleSeriesFilterBlur}
            className="w-12 border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-900"
          />
        </label>
        <label className="flex items-center gap-1">
          Bonus %
          <input
            type="number"
            min={0}
            max={100}
            value={bonusInput}
            onChange={(e) => setBonusInput(e.target.value)}
            onBlur={handleBonusBlur}
            className="w-14 border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-900"
          />
        </label>
      </div>

      {/* Parts grid */}
      <div className={`grid ${isFY26 ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
        {PART_TYPES.map(({ key, label }) => {
          const part = getPart(key)
          const hasBonus = part ? bonusCheckedItems.has(part.id) : false
          return (
            <button
              key={key}
              onClick={() => setPartModal({ partKey: key, partType: PART_TYPES.find(p => p.key === key)!.type })}
              className={cn(
                'rounded-lg p-2 text-left hover:opacity-80 transition-opacity',
                part ? getRarityBg(part.rarity) : 'bg-white border border-dashed border-gray-300 hover:border-gray-400'
              )}
            >
              <div className="text-xs font-medium text-gray-700 mb-0.5">{label}</div>
              {part ? (
                <div>
                  <div className="text-xs font-bold text-gray-900 truncate">{part.name}</div>
                  <div className="text-xs text-gray-700">Lv.{part.level}</div>
                  {hasBonus && (
                    <div className="text-xs text-blue-600 font-medium">★ Bonus</div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">+ Select</div>
              )}
            </button>
          )
        })}
      </div>

      {/* Stats */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <StatRow label="Speed" value={totalStats.speed} />
          <StatRow label="PU" value={totalStats.powerUnit} />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <StatRow label="Corner" value={totalStats.cornering} />
          <StatRow label="Qualify" value={totalStats.qualifying} />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <StatRow label="Pit Stop" value={`${totalStats.pitStopTime.toFixed(2)}s`} />
          <StatRow label={isFY26 ? 'Overtake' : 'DRS'} value={isFY26 ? totalStats.overtake : totalStats.drs} />
        </div>
      </div>

      {/* Part selection modal */}
      {partModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setPartModal(null)}
        >
          <div
            className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Select {PART_TYPES.find(p => p.key === partModal.partKey)?.label}
              </h3>
              <button
                onClick={() => setPartModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <CarPartSelectionGrid
                parts={allCarParts}
                partType={partModal.partType}
                selectedPartId={getPartId(partModal.partKey) ?? ''}
                onPartSelect={(id) => handlePartSelect(partModal.partKey, id)}
                bonusCheckedItems={bonusCheckedItems}
                onBonusToggle={(id) => setBonusCheckedItems(prev => {
                  const next = new Set(prev)
                  next.has(id) ? next.delete(id) : next.add(id)
                  return next
                })}
                bonusPercentage={bonusInput}
                initialMaxSeries={currentSeriesFilter}
                seasonNumber={seasonNumber}
              />
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setPartModal(null)}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="grid grid-cols-[3fr_1fr] gap-0">
      <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded-l font-medium">{label}</div>
      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-r text-right font-semibold">{value}</div>
    </div>
  )
}
