'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuthHeaders } from '@/hooks/useApi'
import { useToast } from '@/components/ui/Toast'
import { GPGuide, GPGuideResult } from '@/types/database'
import Link from 'next/link'

// Force dynamic rendering since this page requires authentication
export const dynamic = 'force-dynamic'

// GP level configuration
const GP_LEVELS = [
  { id: 0, name: 'Junior', color: 'bg-blue-100 text-blue-800', seriesMax: 3 },
  { id: 1, name: 'Challenger', color: 'bg-green-100 text-green-800', seriesMax: 6 },
  { id: 2, name: 'Contender', color: 'bg-yellow-100 text-yellow-800', seriesMax: 9 },
  { id: 3, name: 'Champion', color: 'bg-red-100 text-red-800', seriesMax: 12 }
]

// Helper function to capitalize stat names
const capitalizeStat = (stat: string): string => {
  return stat
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

export default function GPResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const guideId = params.id as string

  const [results, setResults] = useState<GPGuideResult[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [editingResultId, setEditingResultId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<GPGuideResult>>({})

  // Fetch GP guide data
  const { data: gpGuide, isLoading: guideLoading } = useQuery({
    queryKey: ['gp-guide', guideId],
    queryFn: async () => {
      const response = await fetch(`/api/gp-guides/${guideId}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) throw new Error('GP guide not found')
      return response.json()
    },
    enabled: !!guideId
  })

  // Fetch results data
  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ['gp-guide-results', guideId],
    queryFn: async () => {
      const response = await fetch(`/api/gp-guides/${guideId}/results`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) throw new Error('Failed to fetch results')
      return response.json()
    },
    enabled: !!guideId
  })

  // Update results when data loads
  useEffect(() => {
    if (resultsData) {
      setResults(resultsData.data || [])
    }
  }, [resultsData])

  // Save result mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<GPGuideResult>) => {
      const isUpdate = !!data.id
      const url = isUpdate 
        ? `/api/gp-guides/${guideId}/results/${data.id}`
        : `/api/gp-guides/${guideId}/results`
      const method = isUpdate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          ...await getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to save result')
      }

      return response.json()
    },
    onSuccess: () => {
      addToast('Result saved successfully', 'success')
      queryClient.invalidateQueries({ queryKey: ['gp-guide', guideId] })
      queryClient.invalidateQueries({ queryKey: ['gp-guide-results', guideId] })
      setEditingResultId(null)
      setEditFormData({})
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    }
  })

  const handleEditResult = (result: GPGuideResult) => {
    setEditingResultId(result.id)
    setEditFormData({
      id: result.id,
      gp_guide_id: result.gp_guide_id,
      track_id: result.track_id,
      race_number: result.race_number,
      race_type: result.race_type,
      result_notes: result.result_notes,
    })
  }

  const handleSaveResult = () => {
    saveMutation.mutate(editFormData)
  }

  const handleCancelEdit = () => {
    setEditingResultId(null)
    setEditFormData({})
  }

  const handleDeleteResult = async (resultId: string) => {
    try {
      const response = await fetch(`/api/gp-guides/${guideId}/results/${resultId}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to delete result')
      }

      addToast('Result deleted successfully', 'success')
      queryClient.invalidateQueries({ queryKey: ['gp-guide', guideId] })
      queryClient.invalidateQueries({ queryKey: ['gp-guide-results', guideId] })
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to delete result', 'error')
    }
  }

  if (guideLoading || resultsLoading) {
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

  if (!gpGuide) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">GP guide not found</div>
              <Link href="/gp-guides">
                <Button variant="outline">Back to GP Guides</Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const currentGPLevel = gpGuide.gp_level || 0

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-0 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {gpGuide.name} - Results
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={GP_LEVELS[currentGPLevel].color}>
                    {GP_LEVELS[currentGPLevel].name}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {results.length} results recorded
                  </span>
                </div>
              </div>
              
              {/* Back Button */}
              <Link href={`/gp-guides/${guideId}`}>
                <Button variant="outline">Back to GP Guide</Button>
              </Link>
            </div>
          </div>

          {/* Results Section */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Race Results</h3>
              <span className="text-sm text-gray-600">
                Track your performance and results for each race
              </span>
            </div>

            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Track
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Race
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {result.tracks?.name || 'Unknown Track'}
                            </div>
                            {result.tracks?.alt_name && (
                              <div className="text-sm text-gray-500">
                                {result.tracks.alt_name}
                              </div>
                            )}
                            {result.tracks && (
                              <div className="text-xs text-gray-400">
                                {result.tracks.laps} laps • {capitalizeStat(result.tracks.driver_track_stat)} / {capitalizeStat(result.tracks.car_track_stat)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-gray-100 text-gray-800">
                            Race {result.race_number || 'N/A'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {result.race_type || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {editingResultId === result.id ? (
                            <div className="space-y-2">
                              <textarea
                                className="w-full rounded-lg border-gray-300"
                                rows={3}
                                value={editFormData.result_notes || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, result_notes: e.target.value || null }))}
                                placeholder="Enter your result notes..."
                              />
                              <div className="flex space-x-2">
                                <Button
                                  onClick={handleSaveResult}
                                  disabled={saveMutation.isPending}
                                  size="sm"
                                >
                                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-sm text-gray-900">
                                {result.result_notes || 'No notes'}
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditResult(result)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteResult(result.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditResult(result)}
                            >
                              Edit Notes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteResult(result.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">No results recorded yet</div>
                <div className="text-gray-400 mb-4">
                  Add results for your races to track your performance and progress.
                </div>
                <Link href={`/gp-guides/${guideId}`}>
                  <Button variant="outline">Go to GP Guide</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Summary Section */}
          {results.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Total Races</h4>
                  <p className="text-2xl font-bold text-blue-900">{results.length}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Races with Notes</h4>
                  <p className="text-2xl font-bold text-green-900">
                    {results.filter(r => r.result_notes && r.result_notes.trim()).length}
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">Average Notes Length</h4>
                  <p className="text-2xl font-bold text-purple-900">
                    {Math.round(results.reduce((acc, r) => acc + (r.result_notes?.length || 0), 0) / results.length)} chars
                  </p>
                </div>
              </div>

              {/* Race Types Breakdown */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Race Types</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Array.from(new Set(results.map(r => r.race_type).filter(Boolean))).map(raceType => (
                    <div key={raceType} className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{raceType}</span>
                      <span className="ml-2 text-sm text-gray-600">
                        ({results.filter(r => r.race_type === raceType).length} races)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}