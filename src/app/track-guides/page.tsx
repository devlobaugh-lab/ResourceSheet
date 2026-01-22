import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getAuthHeaders } from '@/hooks/useApi'
import { Track, UserTrackGuide } from '@/types/database'

// GP level names and colors
const GP_LEVELS = [
  { id: 0, name: 'Junior', color: 'bg-blue-100 text-blue-800', seriesMax: 3 },
  { id: 1, name: 'Challenger', color: 'bg-green-100 text-green-800', seriesMax: 6 },
  { id: 2, name: 'Contender', color: 'bg-yellow-100 text-yellow-800', seriesMax: 9 },
  { id: 3, name: 'Champion', color: 'bg-red-100 text-red-800', seriesMax: 12 }
]

export default function TrackGuidesPage() {
  // Fetch all tracks
  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const response = await fetch('/api/tracks', {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return []
      return response.json()
    }
  })

  // Fetch user's track guides
  const { data: trackGuides = [], isLoading: guidesLoading } = useQuery({
    queryKey: ['track-guides'],
    queryFn: async () => {
      const response = await fetch('/api/track-guides', {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return []
      const result = await response.json()
      return result.data || []
    }
  })

  const isLoading = tracksLoading || guidesLoading

  // Create a lookup map for track guides by track_id and gp_level
  const guideMap = new Map<string, UserTrackGuide>()
  trackGuides.forEach((guide: UserTrackGuide) => {
    const key = `${guide.track_id}-${guide.gp_level}`
    guideMap.set(key, guide)
  })

  // Get completion status for a track and GP level
  const getCompletionStatus = (trackId: string, gpLevel: number) => {
    const key = `${trackId}-${gpLevel}`
    const guide = guideMap.get(key)
    return guide ? 'complete' : 'empty'
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Track Guides</h1>
            <p className="mt-2 text-gray-600">
              Create and manage racing strategies for each track at different GP levels.
              Track guides are included in your collection backups.
            </p>
          </div>

          {/* GP Level Legend */}
          <Card className="p-6 mb-6">
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
          </Card>

          {/* Track Guides Grid */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Track
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Junior
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Challenger
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contender
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Champion
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tracks.map((track: Track) => (
                    <tr key={track.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {track.name}
                            </div>
                            {track.alt_name && (
                              <div className="text-sm text-gray-500">
                                {track.alt_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col space-y-1">
                          <span>D: {track.driver_track_stat}</span>
                          <span>C: {track.car_track_stat}</span>
                        </div>
                      </td>
                      {GP_LEVELS.map(level => {
                        const status = getCompletionStatus(track.id, level.id)
                        return (
                          <td key={level.id} className="px-6 py-4 whitespace-nowrap text-center">
                            {status === 'complete' ? (
                              <div className="flex justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                              </div>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
