'use client'

import { UserCarSetup, CarPartView } from '@/types/database'
import { X, Pencil, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

const ALL_PART_TYPES = [
  { key: 'front_wing', type: 4, label: 'Front Wing' },
  { key: 'brake', type: 1, label: 'Brake' },
  { key: 'suspension', type: 3, label: 'Suspension' },
  { key: 'rear_wing', type: 5, label: 'Rear Wing' },
  { key: 'gearbox', type: 0, label: 'Gearbox' },
  { key: 'engine', type: 2, label: 'Engine' },
  { key: 'battery', type: 6, label: 'Battery' },
] as const

const getStatValue = (
  part: CarPartView | undefined,
  statName: string,
  bonusPercentage: number,
): number => {
  if (!part) return 0
  const userLevel = part.level || 0
  if (userLevel === 0) return 0
  const stats = part.stats_per_level
  if (!stats || !Array.isArray(stats) || stats.length < userLevel) return 0
  let baseValue = (stats[userLevel - 1] as Record<string, number>)[statName] || 0
  if (bonusPercentage > 0) {
    if (statName === 'pitStopTime') {
      baseValue = Math.round((baseValue * (1 - bonusPercentage / 100)) * 100) / 100
    } else {
      baseValue = Math.ceil(baseValue * (1 + bonusPercentage / 100))
    }
  }
  return baseValue
}

const getOvertakeValue = (part: CarPartView | undefined, bonusPercentage: number): number => {
  if (!part) return 0
  return (
    getStatValue(part, 'powerBoostImpact', bonusPercentage) +
    getStatValue(part, 'powerBoostDuration', bonusPercentage) +
    getStatValue(part, 'powerBoostRechargeRate', bonusPercentage)
  )
}

const getRarityBg = (rarity: number): string => {
  return rarity === 0 ? 'bg-gray-300' :
         rarity === 1 ? 'bg-blue-200' :
         rarity === 2 ? 'bg-orange-200' :
         rarity === 3 ? 'bg-purple-300' :
         rarity === 4 ? 'bg-yellow-300' :
         rarity === 5 ? 'bg-red-300' : 'bg-gray-300'
}

interface SetupPreviewPanelProps {
  setup: UserCarSetup
  carParts: CarPartView[]
  onClose: () => void
  seasonNumber?: number | null
}

export function SetupPreviewPanel({ setup, carParts, onClose, seasonNumber }: SetupPreviewPanelProps) {
  const isFY26 = (seasonNumber ?? 0) >= 7
  const bonusPercentage = setup.bonus_percentage || 0
  const bonusPartIds = new Set(setup.bonus_part_ids || [])

  const partMap: Record<string, string | null> = {
    brake: setup.brake_id,
    gearbox: setup.gearbox_id,
    rear_wing: setup.rear_wing_id,
    front_wing: setup.front_wing_id,
    suspension: setup.suspension_id,
    engine: setup.engine_id,
    battery: setup.battery_id,
  }

  const partTypes = isFY26 ? ALL_PART_TYPES : ALL_PART_TYPES.filter(p => p.type !== 6)

  const getPart = (key: string) =>
    carParts.find(p => p.id === partMap[key]) ?? undefined

  const totalStats = {
    speed: 0, cornering: 0, powerUnit: 0,
    qualifying: 0, drs: 0, overtake: 0, pitStopTime: 0,
  }

  partTypes.forEach(({ key }) => {
    const part = getPart(key)
    if (part) {
      const hasBonus = bonusPartIds.has(part.id)
      const pct = hasBonus ? bonusPercentage : 0
      totalStats.speed += getStatValue(part, 'speed', pct)
      totalStats.cornering += getStatValue(part, 'cornering', pct)
      totalStats.powerUnit += getStatValue(part, 'powerUnit', pct)
      totalStats.qualifying += getStatValue(part, 'qualifying', pct)
      totalStats.drs += getStatValue(part, 'drs', pct)
      totalStats.overtake += getOvertakeValue(part, pct)
      totalStats.pitStopTime += getStatValue(part, 'pitStopTime', pct)
    }
  })

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{setup.name}</h3>
          <Link
            href={`/setups?loadA=${setup.id}`}
            className="text-gray-400 hover:text-blue-600 transition-colors shrink-0"
            aria-label="Edit setup" title="Edit setup"
          >
            <Pencil className="w-5 h-5" />
          </Link>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 shrink-0 ml-2"
          aria-label="Close preview"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Parts grid */}
      <div className={`grid ${isFY26 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 mb-4`}>
        {partTypes.map(({ key, label }) => {
          const part = getPart(key)
          const hasBonus = part ? bonusPartIds.has(part.id) : false
          return (
            <div
              key={key}
              className={`${part ? getRarityBg(part.rarity) : 'bg-white border border-gray-200'} rounded-lg p-2`}
            >
              <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
              {part ? (
                <div>
                  <div className="text-sm font-bold text-gray-900 truncate">{part.name}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    Lv.{part.level}
                    {hasBonus && (
                      <Star className="w-3 h-3 fill-blue-500 text-blue-500" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic">None</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="grid grid-cols-[3fr_1fr] gap-0">
            <div className="bg-gray-600 text-white text-sm px-2 py-1 rounded-l font-medium">Speed</div>
            <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded-r text-right font-semibold">{totalStats.speed}</div>
          </div>
          <div className="grid grid-cols-[3fr_1fr] gap-0">
            <div className="bg-gray-600 text-white text-sm px-2 py-1 rounded-l font-medium">PU</div>
            <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded-r text-right font-semibold">{totalStats.powerUnit}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid grid-cols-[3fr_1fr] gap-0">
            <div className="bg-gray-600 text-white text-sm px-2 py-1 rounded-l font-medium">Corner</div>
            <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded-r text-right font-semibold">{totalStats.cornering}</div>
          </div>
          <div className="grid grid-cols-[3fr_1fr] gap-0">
            <div className="bg-gray-600 text-white text-sm px-2 py-1 rounded-l font-medium">Qualify</div>
            <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded-r text-right font-semibold">{totalStats.qualifying}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid grid-cols-[3fr_1fr] gap-0">
            <div className="bg-gray-600 text-white text-sm px-2 py-1 rounded-l font-medium">Pit Stop</div>
            <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded-r text-right font-semibold">{totalStats.pitStopTime.toFixed(2)}s</div>
          </div>
          <div className="grid grid-cols-[3fr_1fr] gap-0">
            <div className="bg-gray-600 text-white text-sm px-2 py-1 rounded-l font-medium">{isFY26 ? 'Overtake' : 'DRS'}</div>
            <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded-r text-right font-semibold">{isFY26 ? totalStats.overtake : totalStats.drs}</div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {setup.notes && (
        <div>
          <div className="text-sm font-medium text-gray-600 mb-1">Notes</div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{setup.notes}</p>
        </div>
      )}
    </Card>
  )
}
