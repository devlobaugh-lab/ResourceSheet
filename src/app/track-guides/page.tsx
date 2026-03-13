'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { getAuthHeaders } from '@/hooks/useApi'
import { useSeason } from '@/contexts/SeasonContext'
import { Track, UserTrackGuide } from '@/types/database'

// Force dynamic rendering since this page requires authentication
export const dynamic = 'force-dynamic'

// GP level names and colors
const GP_LEVELS = [
  { id: 0, name: 'Junior', color: 'bg-blue-100 text-blue-800', seriesMax: 3 },
  { id: 1, name: 'Challenger', color: 'bg-green-100 text-green-800', seriesMax: 6 },
  { id: 2, name: 'Contender', color: 'bg-yellow-100 text-yellow-800', seriesMax: 9 },
  { id: 3, name: 'Champion', color: 'bg-red-100 text-red-800', seriesMax: 12 }
]

// Helper function to capitalize stat names
const capitalizeStat = (stat: string): string => {
  // Handle camelCase stats (overtaking -> Overtaking, raceStart -> Race Start)
  return stat
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim() // Remove leading/trailing whitespace
}

export default function TrackGuidesPage() {
  const { activeSeasonId } = useSeason()
  const [tracks, setTracks] = useState<Track[]>([])
  const [trackGuides, setTrackGuides] = useState<UserTrackGuide[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch tracks filtered by active season
        const tracksUrl = activeSeasonId
          ? `/api/tracks?season_id=${encodeURIComponent(activeSeasonId)}`
          : '/api/tracks'
        const tracksResponse = await fetch(tracksUrl, {
          headers: await getAuthHeaders(),
          credentials: 'same-origin'
        })
        const tracksData = tracksResponse.ok ? await tracksResponse.json() : []

        // Fetch track guides
        const guidesResponse = await fetch('/api/track-guides', {
          headers: await getAuthHeaders(),
          credentials: 'same-origin'
        })
        const guidesData = guidesResponse.ok ? await guidesResponse.json() : { data: [] }

        setTracks(tracksData || [])
        setTrackGuides(guidesData.data || [])
      } catch (error) {
        console.error('Error fetching track guides data:', error)
        setTracks([])
        setTrackGuides([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [activeSeasonId])

  // Create a lookup map for track guides by track_id and gp_level
  const guideMap = new Map<string, UserTrackGuide>()
  trackGuides.forEach((guide: UserTrackGuide) => {
    const key = `${guide.track_id}-${guide.gp_level}`
    guideMap.set(key, guide)
  })

  // Check if a track guide has minimum required fields for usefulness
  // A guide is considered "useful" if it has: driver1, boost1, dry strategy for driver1
  // AND driver2, boost2, dry strategy for driver2
  const isGuideUseful = (guide: UserTrackGuide): boolean => {
    // Driver 1 must have: driver, boost, and dry tyre strategy
    const driver1Complete = 
      !!guide.driver_1_id && 
      !!guide.driver_1_boost_id && 
      !!guide.driver_1_dry_strategy
    
    // Driver 2 must have: driver, boost, and dry tyre strategy
    const driver2Complete = 
      !!guide.driver_2_id && 
      !!guide.driver_2_boost_id && 
      !!guide.driver_2_dry_strategy
    
    return driver1Complete && driver2Complete
  }

  // Get completion status for a track and GP level
  const getCompletionStatus = (trackId: string, gpLevel: number) => {
    const key = `${trackId}-${gpLevel}`
    const guide = guideMap.get(key)
    if (!guide) return 'empty'
    return isGuideUseful(guide) ? 'complete' : 'partial'
  }

  // Get display name with alias if available
  const getDisplayName = (track: any) => {
    if (track.display_name) {
      return `${track.display_name} (${track.name})`
    }
    return track.name
  }

  // Get sort key for a track (alias name || name)
  const getSortKey = (track: any) => track.display_name || track.name

  // Sort tracks by display name
  const sortedTracks = [...tracks].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)))

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Track Guides</h1>
            <p className="mt-2 text-gray-600">
              Create and manage racing strategies for each track at different GP levels.
              Track guides are included in your collection backups.
            </p>
          </div>

          {/* GP Level Legend */}
          {/* <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">GP Levels</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {GP_LEVELS.map(level => (
                <div key={level.id} className="flex items-center space-x-2">
                  <Badge className={level.color}>
                    {level.name}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Series ≤ {level.seriesMax}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-600">
              <strong>Legend & SE drivers:</strong> Assigned based on min_gp_tier parameter (0=Junior, 1=Challenger, 2=Contender, 3=Champion)
            </p>
          </Card> */}

          {/* Track Guides Grid */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-100 bg-gray-800 uppercase tracking-wider">
                      Track
                    </th>
                    <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-100 bg-gray-800 uppercase tracking-wider">
                      Stats
                    </th>
                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-100 bg-gray-800 uppercase tracking-wider">
                      Junior
                    </th>
                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-100 bg-gray-800 uppercase tracking-wider">
                      Challenger
                    </th>
                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-100 bg-gray-800 uppercase tracking-wider">
                      Contender
                    </th>
                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-100 bg-gray-800 uppercase tracking-wider">
                      Champion
                    </th>
                    <th scope="col" className="px-6 pl-10 text-left text-xs font-medium text-gray-100 bg-gray-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTracks.map((track: Track) => (
                    <tr key={track.id} className="hover:bg-gray-50">
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getDisplayName(track)}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex flex-col space-y-1">
                          <span>{capitalizeStat(track.driver_track_stat)} / {capitalizeStat(track.car_track_stat)}</span>
                        </div>
                      </td>
                      {GP_LEVELS.map(level => {
                        const status = getCompletionStatus(track.id, level.id)
                        return (
                          <td key={level.id} className="px-6 py-2 whitespace-nowrap text-center">
                            <div className="flex justify-center">
                              <Link
                                href={`/track-guides/${track.id}?level=${level.id}`}
                                title={`${level.name} guide for ${getDisplayName(track)}`}
                              >
                                <div className={`w-8 h-8 rounded-full hover:opacity-50 transition-opacity cursor-pointer ${status === 'complete' ? 'bg-green-600' : 'border bg-gray-400'}`} />
                              </Link>
                            </div>
                          </td>
                        )
                      })}
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        <Link href={`/track-guides/${track.id}`}>
                          <Button variant="outline" size="sm">
                            View/Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {tracks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No tracks found</div>
                <div className="text-gray-400 text-sm">
                  Tracks will appear here once loaded from the database.
                </div>
              </div>
            )}

            {tracks.length > 0 && trackGuides.length === 0 && (
              <div className="text-center py-8 border-t border-gray-200">
                <div className="text-gray-500 text-lg mb-2">Ready to create your first track guide!</div>
                <div className="text-gray-400 text-sm mb-4">
                  Click &quot;View/Edit&quot; on any track above to start creating racing strategies for different GP levels.
                </div>
              </div>
            )}
          </Card>
        </div>
    </ProtectedRoute>
  )
}
