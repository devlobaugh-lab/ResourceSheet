'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { getAuthHeaders } from '@/hooks/useApi'
import { GPGuide, GPGuideTrack } from '@/types/database'
import { AuthDebug } from '@/components/AuthDebug'

// Force dynamic rendering since this page requires authentication
export const dynamic = 'force-dynamic'

// GP level names and colors
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

export default function GPGuidesPage() {
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

  // Filter GP guides by selected level
  const filteredGuides = selectedGPLevel !== null 
    ? gpGuides.filter(guide => guide.gp_level === selectedGPLevel)
    : gpGuides

  // Group guides by name for display
  const groupedGuides = filteredGuides.reduce((groups, guide) => {
    const key = guide.name
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(guide)
    return groups
  }, {} as Record<string, GPGuide[]>)

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
            <h1 className="text-3xl font-bold text-gray-900">GP Guides</h1>
            <p className="mt-2 text-gray-600">
              Create and manage Grand Prix strategies for specific events and GP levels.
              Plan your drivers, boosts, and strategies for each race.
            </p>
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
              Object.entries(groupedGuides).map(([name, guides]) => (
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
                    {guides.map((guide) => {
                      const levelInfo = GP_LEVELS[guide.gp_level]
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
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Tracks</span>
                                <span className="text-sm font-medium">
                                  {guide.gp_guide_tracks?.length || 0}
                                </span>
                              </div>
                              
                              {guide.boosted_assets && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Boosted Assets</span>
                                  <span className="text-sm font-medium text-blue-600">
                                    Configured
                                  </span>
                                </div>
                              )}
                              
                              {guide.reward_bonus && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Rewards</span>
                                  <span className="text-sm font-medium text-green-600">
                                    Configured
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4 flex items-center justify-between">
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
              ))
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

          {/* Create New GP Guide */}
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