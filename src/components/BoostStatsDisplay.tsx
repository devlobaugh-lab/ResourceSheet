'use client'

import React from 'react'
import { IoShieldHalfSharp } from 'react-icons/io5'
import { TbArrowCurveLeft } from 'react-icons/tb'
import { PiTrafficSignalFill } from 'react-icons/pi'
import { GiCarWheel } from 'react-icons/gi'
import { PiSpeedometerBold } from 'react-icons/pi'
import { PiArrowArcRightBold } from 'react-icons/pi'
import { BsLightningChargeFill } from 'react-icons/bs'
import { BsStopwatch } from 'react-icons/bs'

// Get boost value background color based on tier (1=blue, 2=green, 3=yellow, 4=orange, 5=red)
const getBoostValueColor = (tierValue: number): string => {
  return tierValue === 1 ? "bg-blue-200" :
         tierValue === 2 ? "bg-green-200" :
         tierValue === 3 ? "bg-yellow-200" :
         tierValue === 4 ? "bg-orange-200" :
         tierValue === 5 ? "bg-red-300" : "bg-gray-50";
}

interface BoostStatsDisplayProps {
  boostStats: any
  className?: string
}

// Map stat keys to React Icons
const statIcons: Record<string, React.ComponentType<any>> = {
  block: IoShieldHalfSharp,
  overtake: TbArrowCurveLeft,
  race_start: PiTrafficSignalFill,
  tyre_use: GiCarWheel,
  speed: PiSpeedometerBold,
  corners: PiArrowArcRightBold,
  power_unit: BsLightningChargeFill,
  pit_stop: BsStopwatch
}

export function BoostStatsDisplay({ boostStats, className = '' }: BoostStatsDisplayProps) {
  if (!boostStats) return null

  const stats = [
    { key: 'block', label: 'Defend' },
    { key: 'overtake', label: 'Overtake' },
    { key: 'corners', label: 'Corners' },
    { key: 'tyre_use', label: 'Tyre Use' },
    { key: 'power_unit', label: 'Power Unit' },
    { key: 'speed', label: 'Speed' },
    { key: 'pit_stop', label: 'Pit Stop' },
    { key: 'race_start', label: 'Race Start' }
  ]

  const displayStats = stats
    .filter(stat => boostStats[stat.key] && boostStats[stat.key] > 0)
    .map(stat => {
      const value = boostStats[stat.key] * 5 // Convert tier to actual value
      const IconComponent = statIcons[stat.key]
      const colorClass = getBoostValueColor(boostStats[stat.key])
      return (
        <span key={stat.key} className={`flex items-center gap-1 ${colorClass} px-3 py-2 rounded`}>
          {IconComponent && <IconComponent className="w-6 h-6" />}
          <span className="text-lg font-bold">+{value}</span>
        </span>
      )
    })

  if (displayStats.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayStats}
    </div>
  )
}
