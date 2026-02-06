'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuthHeaders } from '@/hooks/useApi'
import { useRouter, useSearchParams } from 'next/navigation'
import { GPGuide } from '@/types/database'
import Link from 'next/link'
import { AuthDebug } from '@/components/AuthDebug'

// Force dynamic rendering since this page requires authentication
export const dynamic = 'force-dynamic'

// GP level configuration
const GP_LEVELS = [
  { id: 0, name: 'Junior', color: 'bg-blue-100 text-blue-800', seriesMax: 3 },
  { id: 1, name: 'Challenger', color: 'bg-green-100 text-green-800', seriesMax: 6 },
  { id: 2, name: 'Contender', color: 'bg-yellow-100 text-yellow-800', seriesMax: 9 },
  { id: 3, name: 'Champion', color: 'bg-red-100 text-red-800', seriesMax: 12 }
]

export default function NewGPGuidePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the GP name from URL params (if coming from existing guide)
  const suggestedName = searchParams?.get('name') || ''

  const [formData, setFormData] = useState({
    name: suggestedName,
    gp_level: 0,
    start_date: '',
    boosted_assets: {},
    reward_bonus: {}
  })

  // Create GP guide mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/gp-guides', {
        method: 'POST',
        headers: {
          ...await getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create GP guide')
      }

      return response.json()
    },
    onSuccess: (result) => {
      setIsLoading(false)
      setError(null)
      
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['gp-guides'] })
      
      // Redirect to the new guide
      router.push(`/gp-guides/${result.data.id}`)
    },
    onError: (error: Error) => {
      setIsLoading(false)
      setError(error.message)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Please enter a GP guide name')
      setIsLoading(false)
      return
    }

    createMutation.mutate(formData)
  }

  const handleLevelChange = (levelId: number) => {
    setFormData(prev => ({ ...prev, gp_level: levelId }))
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New GP Guide</h1>
                <p className="mt-2 text-gray-600">
                  Set up a new Grand Prix strategy guide for a specific GP level.
                </p>
              </div>
              <Link href="/gp-guides">
                <Button variant="outline">Back to GP Guides</Button>
              </Link>
            </div>
          </div>

          {/* Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* GP Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  GP Guide Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Monaco GP, British GP, etc."
                  required
                />
              </div>

              {/* GP Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  GP Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {GP_LEVELS.map(level => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => handleLevelChange(level.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.gp_level === level.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{level.name}</span>
                        <Badge className={level.color}>
                          Series {level.seriesMax}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {level.id === 0 && 'Perfect for beginners'}
                        {level.id === 1 && 'Intermediate level'}
                        {level.id === 2 && 'Advanced strategies'}
                        {level.id === 3 && 'Expert level'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  id="start_date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Current Selection Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Current Selection</h3>
                <div className="flex items-center space-x-4">
                  <Badge className={GP_LEVELS[formData.gp_level].color}>
                    {GP_LEVELS[formData.gp_level].name}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Series {GP_LEVELS[formData.gp_level].seriesMax}
                  </span>
                  {formData.name && (
                    <span className="text-sm text-gray-600">
                      GP: {formData.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Link href="/gp-guides">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isLoading || !formData.name.trim()}
                >
                  {isLoading ? 'Creating...' : 'Create GP Guide'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Info Section */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About GP Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GP_LEVELS.map(level => (
                <div key={level.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{level.name}</span>
                    <Badge className={level.color}>
                      Series {level.seriesMax}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {level.id === 0 && 'Ideal for new players. Focus on basic strategies and fundamental setups.'}
                    {level.id === 1 && 'For players gaining experience. More complex strategies and optimized setups.'}
                    {level.id === 2 && 'Advanced level requiring deep understanding of game mechanics and optimal strategies.'}
                    {level.id === 3 && 'Expert level for seasoned players. Maximum optimization and advanced techniques.'}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}