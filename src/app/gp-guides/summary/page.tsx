'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useQuery } from '@tanstack/react-query'
import { getAuthHeaders } from '@/hooks/useApi'
import { GPGuide } from '@/types/database'
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

// Helper function to format date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'No date set'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Helper function to calculate progress
const calculateProgress = (tracks: any[], totalTracks: number): number => {
  if (totalTracks === 0) return 0
  const configuredTracks = tracks.filter(track => 
    track.driver_1_id || track.driver_2_id || track.setup_notes || track.notes
  ).length
  return Math.round((configuredTracks / totalTracks) * 100)
}

export default function GPGuidesSummaryPage() {
  const [gpGuides, setGPGuides] = useState<GPGuide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGPLevel, setSelectedGPLevel] = useState<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/gp-guides', {
          headers: await getAuthHeaders(),
          credentials: 'same-origin'
        })
        const result = await response.json()
        
        if (response.ok) {
          setGPGuides(result.data || [])
        } else {
          console.error('Error fetching GP guides:', result.error)
          setGPGuides([])
        }
      } catch (error) {
        console.error('Error fetching GP guides:', error)
        setGPGuides([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Group guides by name for display
  const groupedGuides = gpGuides.reduce((groups, guide) => {
    const key = guide.name
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(guide)
    return groups
  }, {} as Record<string, GPGuide[]>)

  // Calculate summary statistics
  const totalGuides = gpGuides.length
  const totalTracks = gpGuides.reduce((acc, guide) => acc + (guide.gp_guide_tracks?.length || 0), 0)
  const totalResults = gpGuides.reduce((acc, guide) => acc + (guide.gp_guide_results?.length || 0), 0)
  const guidesWithTracks = gpGuides.filter(guide => (guide.gp_guide_tracks?.length || 0) > 0).length
  const guidesWithResults = gpGuides.filter(guide => (guide.gp_guide_results?.length || 0) > 0).length

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
        <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">GP Guides Summary</h1>
            <p className="mt-2 text-gray-600">
              Overview of all your Grand Prix guides and their progress across different GP levels.
            </p>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total GP Guides</p>
                  <p className="text-2xl font-bold text-gray-900">{totalGuides}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tracks</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTracks}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Results Recorded</p>
                  <p className="text-2xl font-bold text-gray-900">{totalResults}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalGuides > 0 ? Math.round((guidesWithTracks / totalGuides) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* GP Level Filter */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by GP Level</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedGPLevel === null ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedGPLevel(null)}
                className="text-sm"
              >
                All Levels
              </Button>
              {GP_LEVELS.map(level => (
                <Button
                  key={level.id}
                  variant={selectedGPLevel === level.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGPLevel(level.id)}
                  className="text-sm"
                >
                  {level.name}
                </Button>
              ))}
            </div>
          </Card>

          {/* GP Guides Grid */}
          <div className="space-y-6">
            {Object.entries(groupedGuides).length > 0 ? (
              Object.entries(groupedGuides).map(([name, guides]) => {
                // Filter guides by selected level
                const filteredGuides = selectedGPLevel !== null 
                  ? guides.filter(guide => guide.gp_level === selectedGPLevel)
                  : guides

                if (filteredGuides.length === 0) return null

                return (
                  <Card key={name} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                        <p className="text-gray-600">Multiple GP levels available</p>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/gp-guides/new?name=${encodeURIComponent(name)}`}>
                          <Button variant="outline" size="sm">
                            Create New Level
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredGuides.map((guide) => {
                        const levelInfo = GP_LEVELS[guide.gp_level]
                        const tracks = guide.gp_guide_tracks || []
                        const results = guide.gp_guide_results || []
                        const progress = calculateProgress(tracks, tracks.length)
                        const hasBoostedAssets = guide.boosted_assets && Object.keys(guide.boosted_assets).length > 0
                        const hasRewardBonus = guide.reward_bonus && Object.keys(guide.reward_bonus).length > 0

                        return (
                          <Link key={guide.id} href={`/gp-guides/${guide.id}`}>
                            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                              <div className="flex items-center justify-between mb-2">
                                <Badge className={levelInfo.color}>
                                  {levelInfo.name}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {formatDate(guide.start_date)}
                                </span>
                              </div>
                              
                              <div className="space-y-2 mb-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Tracks</span>
                                  <span className="text-sm font-medium">
                                    {tracks.length}
                                  </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Results</span>
                                  <span className="text-sm font-medium text-green-600">
                                    {results.length}
                                  </span>
                                </div>

                                {hasBoostedAssets && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Boosted Assets</span>
                                    <span className="text-sm font-medium text-blue-600">
                                      Configured
                                    </span>
                                  </div>
                                )}

                                {hasRewardBonus && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Rewards</span>
                                    <span className="text-sm font-medium text-green-600">
                                      Configured
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                  Last updated: {new Date(guide.updated_at).toLocaleDateString()}
                                </span>
                                <Button variant="outline" size="sm" className="text-xs">
                                  View/Edit
                                </Button>
                              </div>
                            </Card>
                          </Link>
                        )
                      })}
                    </div>
                  </Card>
                )
              })
            ) : (
              <Card className="p-8 text-center">
                <div className="text-gray-500 text-lg mb-4">
                  No GP guides found
                </div>
                <div className="text-gray-400 mb-6">
                  {selectedGPLevel !== null 
                    ? `No GP guides found for ${GP_LEVELS[selectedGPLevel].name} level.`
                    : 'Create your first GP guide to start planning your Grand Prix strategies.'
                  }
                </div>
                <Link href="/gp-guides/new">
                  <Button variant="primary" size="lg">
                    Create Your First GP Guide
                  </Button>
                </Link>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          {Object.entries(groupedGuides).length === 0 && selectedGPLevel === null && (
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Start from Scratch</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Create a new GP guide for any Grand Prix event.
                  </p>
                  <Link href="/gp-guides/new">
                    <Button variant="outline">Create New GP Guide</Button>
                  </Link>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Import from Track Guides</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Use your existing track guides as a starting point for GP planning.
                  </p>
                  <Link href="/track-guides">
                    <Button variant="outline">View Track Guides</Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}