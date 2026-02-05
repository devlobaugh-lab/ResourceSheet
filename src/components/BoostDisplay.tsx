import React from 'react'
import { BoostView } from '@/types/database'
import { Pencil } from 'lucide-react'
import { BoostStatsDisplay } from './BoostStatsDisplay'

interface BoostDisplayProps {
  boost: BoostView | null | undefined
  isLoading?: boolean
  placeholderText?: string
  className?: string
  onEdit?: () => void
}

export function BoostDisplay({ 
  boost, 
  isLoading = false, 
  placeholderText = "No boost selected", 
  className = "",
  onEdit
}: BoostDisplayProps) {
  return (
    <div className={`relative mb-2 p-4 pt-2 bg-gray-100 rounded-lg ${className}`}>
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
          title="Edit boost"
        >
          <Pencil className="h-4 w-4 text-gray-600" />
        </button>
      )}
      {isLoading || !boost ? (
        <div className="text-sm text-gray-700 pt-2">
          {isLoading ? "Loading..." : placeholderText}
        </div>
      ) : (
        <>
          <div className="text-lg font-bold text-gray-900 mb-2">
            {boost.boost_custom_names?.custom_name || (boost.icon ? boost.icon.replace('BoostIcon_', '') : null) || boost.name || 'Unknown Boost'}
          </div>
          <BoostStatsDisplay boostStats={boost.boost_stats} />
        </>
      )}
    </div>
  )
}
