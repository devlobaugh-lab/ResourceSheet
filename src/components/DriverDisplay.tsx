import React from 'react'
import { DriverView } from '@/types/database'
import { getRarityBackground, getRarityDisplay } from '@/lib/utils'

interface DriverDisplayProps {
  driver: DriverView | null | undefined
  isLoading?: boolean
  placeholderText?: string
  className?: string
}

export function DriverDisplay({ 
  driver, 
  isLoading = false, 
  placeholderText = "No driver selected", 
  className = "" 
}: DriverDisplayProps) {
  if (isLoading || !driver) {
    return (
      <div className={`px-3 pt-1 rounded-lg bg-gray-200 ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-black">
            {isLoading ? "Loading..." : placeholderText}
          </span>
          <div>
            <span className="text-sm text-black">
              Lvl {isLoading ? "0" : driver?.level || "0"}
            </span>
            <span className="text-sm text-black ml-2">
              {isLoading ? "Unknown" : getRarityDisplay(driver?.rarity || 0)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`px-3 pt-1 rounded-lg ${getRarityBackground(driver.rarity)} ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold text-black">
          {driver.name}
        </span>
      </div>
      <div>
        <span className="text-sm text-black">
          Lvl {driver.level}
        </span>
        <span className="text-sm text-black ml-2">
          {getRarityDisplay(driver.rarity)}
        </span>
      </div>
    </div>
  )
}