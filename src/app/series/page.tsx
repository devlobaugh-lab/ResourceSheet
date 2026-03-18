'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { useSeries } from '@/hooks/useApi'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useSeason } from '@/contexts/SeasonContext'
import type { SeriesWithTracks, SeriesTrack } from '@/types/database'

// Stat display names mapping
const statDisplayNames: Record<string, string> = {
  'tyreUse': 'Tyre Management',
  'overtaking': 'Overtaking',
  'defending': 'Defending',
  'raceStart': 'Race Start',
  'speed': 'Speed',
  'cornering': 'Cornering',
  'powerUnit': 'Power Unit',
  'none': 'None'
}

// Series collapsible component
function SeriesCard({ series }: { series: SeriesWithTracks }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Get series name - display value is index + 1 (so index 0 displays as Series 1)
  const seriesName = `Series ${series.index + 1}`

  // Get track display name
  const getTrackDisplayName = (track: SeriesTrack) => {
    return track.display_name || track.name
  }

  // Format stat for display
  const formatStat = (stat: string) => {
    return statDisplayNames[stat] || stat
  }

  return (
    <Card className="overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          {/* Expand/Collapse Icon */}
          <span className="text-gray-400 text-xl w-6 flex-shrink-0">
            {isExpanded ? '▼' : '▶'}
          </span>
          
          {/* Series Name */}
          <h2 className="text-lg font-semibold text-gray-900">{seriesName}</h2>
        </div>

        {/* Series Stats */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {series.common_track_stat && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Track Stat:</span>
              <span className="font-medium text-gray-900">{series.common_track_stat}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Coins:</span>
            <span className="font-medium text-gray-900">{series.entry_fee.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Flags:</span>
            <span className="font-medium text-gray-900">
              <span className="text-green-600">{series.win_flags}</span>
              <span className="text-gray-400">/</span>
              <span className="text-red-600">{series.loss_flags}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Unlock:</span>
            <span className="font-medium text-gray-900">{series.flags_to_unlock}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Max:</span>
            <span className="font-medium text-gray-900">{series.max_flags}</span>
          </div>
          
          {series.win_rep > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Sprint Pts:</span>
              <span className="font-medium text-gray-900">{series.win_rep}</span>
            </div>
          )}
        </div>
      </button>

      {/* Track list - visible when expanded */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Track Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Laps
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Driver Stat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Car Stat
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {series.tracks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No tracks found for this series
                  </td>
                </tr>
              ) : (
                series.tracks.map((track) => (
                  <tr key={track.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {getTrackDisplayName(track)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {track.laps}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatStat(track.driver_track_stat)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatStat(track.car_track_stat)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default function SeriesInfoPage() {
  const { activeSeasonId } = useSeason()
  const { data: seriesData, isLoading, error } = useSeries(activeSeasonId ? { season_id: activeSeasonId } : undefined)

// Show all series (0-11) - series 0 is Beginner, series 1-11 are main series
const displaySeries = seriesData?.data?.filter((s: SeriesWithTracks) => s.index >= 0 && s.index < 12) || []
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Series Info</h1>
            <p className="mt-2 text-gray-600">
              View information about each series including track stats, coins, flags, and more.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-8 text-center bg-red-50">
              <p className="text-red-600">Error loading series data. Please try again.</p>
            </Card>
          )}

          {/* Series List */}
          {seriesData && !isLoading && (
            <div className="space-y-4">
              {displaySeries.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">
                    No series data found. Upload a content_cache.json to populate series data.
                  </p>
                </Card>
              ) : (
                displaySeries.map((series: SeriesWithTracks) => (
                  <SeriesCard key={series.id} series={series} />
                ))
              )}
            </div>
          )}

          {/* Summary */}
          {displaySeries.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              {displaySeries.length} series
            </div>
          )}
        </div>
    </ProtectedRoute>
  )
}