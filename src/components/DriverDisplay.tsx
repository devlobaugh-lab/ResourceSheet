import React from 'react'
import { DriverView } from '@/types/database'
import { getRarityBackground, getRarityDisplay } from '@/lib/utils'
import { Pencil } from 'lucide-react'

interface DriverDisplayProps {
  driver: DriverView | null | undefined
  isLoading?: boolean
  placeholderText?: string
  className?: string
  onEdit?: () => void
  onBoostEdit?: () => void
}

export function DriverDisplay({ 
  driver, 
  isLoading = false, 
  placeholderText = "No driver selected", 
  className = "",
  onEdit,
  onBoostEdit
}: DriverDisplayProps) {
  return (
    <div className={`relative rounded-lg ${isLoading || !driver ? 'p-4 pt-2 mt-2 bg-gray-100' : getRarityBackground(driver.rarity) + 'px-3 pt-1'} ${className}`}>
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
          title="Edit driver"
        >
          <Pencil className="h-4 w-4 text-gray-600" />
        </button>
      )}
      {isLoading || !driver ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 pt-2">
            {isLoading ? "Loading..." : placeholderText}
          </span>
          {/* <div>
            <span className="text-sm text-black">
              Lvl {isLoading ? "0" : driver?.level || "0"}
            </span>
            <span className="text-sm text-black ml-2">
              {isLoading ? "Unknown" : getRarityDisplay(driver?.rarity || 0)}
            </span>
          </div> */}
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}