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
import { Track, UserTrackGuide, DriverView, BoostView, UserCarSetupWithParts } from '@/types/database'
import Link from 'next/link'

// GP level configuration
const GP_LEVELS = [
  { id: 0, name: 'Junior', color: 'bg-blue-100 text-blue-800', seriesMax: 3 },
  { id: 1, name: 'Challenger', color: 'bg-green-100 text-green-800', seriesMax: 6 },
  { id: 2, name: 'Contender', color: 'bg-yellow-100 text-yellow-800', seriesMax: 9 },
  { id: 3, name: 'Champion', color: 'bg-red-100 text-red-800', seriesMax: 12 }
]

export default function TrackGuideEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const trackId = params.id as string

  const [selectedGpLevel, setSelectedGpLevel] = useState(0)
  const [formData, setFormData] = useState<Partial<UserTrackGuide>>({})
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([])

  // Fetch track details
  const { data: track, isLoading: trackLoading } = useQuery({
    queryKey: ['track', trackId],
    queryFn: async () => {
      const response = await fetch(`/api/tracks/${trackId}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) throw new Error('Track not found')
      return response.json()
    },
    enabled: !!trackId
  })

  // Fetch existing track guide for this track and GP level
  const { data: trackGuide, isLoading: guideLoading } = useQuery({
    queryKey: ['track-guide', trackId, selectedGpLevel],
    queryFn: async () => {
      const response = await fetch(`/api/track-guides?track_id=${trackId}&gp_level=${selectedGpLevel}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return null
      const result = await response.json()
      return result.data?.[0] || null
    }
  })

  // Fetch drivers filtered by GP level for driver selection modal
  const { data: availableDrivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['drivers-for-gp', selectedGpLevel],
    queryFn: async () => {
      const gpLevel = GP_LEVELS[selectedGpLevel]
      const response = await fetch(`/api/drivers?gp_level=${selectedGpLevel}&limit=100`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return []
      const result = await response.json()
      return result.data || []
    },
    enabled: showDriverModal
  })

  // Update form data when track guide loads
  useEffect(() => {
    if (trackGuide) {
      setFormData(trackGuide)
    } else {
      // Reset form for new guide
      setFormData({
        track_id: trackId,
        gp_level: selectedGpLevel,
        suggested_drivers: [],
        suggested_boosts: [],
        dry_strategy: '',
        wet_strategy: '',
        notes: ''
      })
    }
  }, [trackGuide, trackId, selectedGpLevel])

  // Save track guide mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<UserTrackGuide>) => {
      const isUpdate = !!trackGuide
      const url = isUpdate ? `/api/track-guides/${trackGuide.id}` : '/api/track-guides'
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
        throw new Error(errorData.error?.message || 'Failed to save track guide')
      }

      return response.json()
    },
    onSuccess: () => {
      addToast('Track guide saved successfully', 'success')
      queryClient.invalidateQueries({ queryKey: ['track-guides'] })
      queryClient.invalidateQueries({ queryKey: ['track-guide', trackId, selectedGpLevel] })
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    }
  })

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      track_id: trackId,
      gp_level: selectedGpLevel,
    }
    saveMutation.mutate(dataToSave)
  }

  const isLoading = trackLoading || guideLoading

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

  if (!track) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">Track not found</div>
              <Link href="/track-guides">
                <Button variant="outline">Back to Track Guides</Button>
              </Link>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {track.name} {track.alt_name && `(${track.alt_name})`}
                </h1>
                <p className="mt-2 text-gray-600">
                  Track Stats: Driver - {track.driver_track_stat}, Car - {track.car_track_stat}
                </p>
              </div>
              <Link href="/track-guides">
                <Button variant="outline">Back to Track Guides</Button>
              </Link>
            </div>
          </div>

          {/* GP Level Tabs */}
          <Card className="p-6 mb-6">
            <div className="flex space-x-1 mb-6">
              {GP_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedGpLevel(level.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGpLevel === level.id
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-600">
              <strong>Current Level:</strong> {GP_LEVELS[selectedGpLevel].name} (Series ≤ {GP_LEVELS[selectedGpLevel].seriesMax})
            </div>
          </Card>

          {/* Track Guide Editor */}
          <div className="space-y-6">
            {/* Driver Selection Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Recommendations</h3>
              <div className="text-sm text-gray-600 mb-4">
                Select up to 4 drivers for this GP level (2 main + 2 alternates).
                Drivers are filtered by series and sorted by track performance.
              </div>
              <Button variant="outline" className="w-full">
                Select Drivers ({formData.suggested_drivers?.length || 0}/4)
              </Button>
            </Card>

            {/* Boost Recommendations Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Boost Recommendations</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free Boost Recommendation
                  </label>
                  <select className="w-full rounded-lg border-gray-300">
                    <option value="">Select a free boost...</option>
                    {/* Free boosts will be populated here */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Boost Recommendations
                  </label>
                  <Button variant="outline" className="w-full">
                    Select Boosts ({formData.suggested_boosts?.length || 0} selected)
                  </Button>
                </div>
              </div>
            </Card>

            {/* Car Setup Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Car Setup</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saved Setup (Optional)
                  </label>
                  <select className="w-full rounded-lg border-gray-300">
                    <option value="">Select a saved setup...</option>
                    {/* Saved setups will be populated here */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setup Notes
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-300"
                    rows={3}
                    placeholder="Track-specific setup changes..."
                    value={formData.setup_notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, setup_notes: e.target.value }))}
                  />
                </div>
              </div>
            </Card>

            {/* Tire Strategy Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tire Strategies</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dry Conditions Strategy
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-300"
                    rows={2}
                    placeholder="e.g., 3m3m2s (3 laps medium, 3 laps medium, 2 laps soft)"
                    value={formData.dry_strategy || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dry_strategy: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wet Conditions Strategy
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-300"
                    rows={2}
                    placeholder="e.g., 10w (all wet tires)"
                    value={formData.wet_strategy || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, wet_strategy: e.target.value }))}
                  />
                </div>
              </div>
            </Card>

            {/* Notes Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
              <textarea
                className="w-full rounded-lg border-gray-300"
                rows={4}
                placeholder="Any additional notes about this track..."
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="px-8"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Track Guide'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
