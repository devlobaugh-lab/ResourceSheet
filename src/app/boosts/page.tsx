'use client'

import { useState, useMemo, useEffect } from 'react'
import { DataGrid } from '@/components/DataGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUserBoosts, useBoosts } from '@/hooks/useApi'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/components/auth/AuthContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { BoostWithCustomName } from '@/types/database'

// Custom hook to fetch boost custom names
function useBoostCustomNames() {
  return useQuery<{ [boostId: string]: string }>({
    queryKey: ['boost-custom-names'],
    queryFn: async (): Promise<{ [boostId: string]: string }> => {
      const { getAuthHeaders } = await import('@/hooks/useApi');
      const response = await fetch('/api/boosts/custom-names', {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch boost custom names');
      }

      return response.json();
    },
    staleTime: 0, // Disable caching to ensure fresh data
  });
}

function AuthenticatedBoostsPage() {
  const queryClient = useQueryClient()
  const { data: boostsResponse, isLoading: boostsLoading, error: boostsError, refetch: refetchBoosts } = useBoosts({
    page: 1,
    limit: 100
  })
  const { data: userBoostsResponse, isLoading: userBoostsLoading, error: userBoostsError, refetch: refetchUserBoosts } = useUserBoosts({
    page: 1,
    limit: 100
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [mergedBoosts, setMergedBoosts] = useState<any[]>([])

  // Merge catalog boosts with user ownership data when data changes
  // Custom names are already merged server-side by /api/boosts
  useEffect(() => {
    if (boostsResponse?.data && userBoostsResponse?.data) {
      const merged = (boostsResponse.data || []).map((boost: any) => {
        // Find user's ownership data for this boost
        const userData = (userBoostsResponse.data || []).find((userBoost: any) => userBoost.id === boost.id);
        const cardCount = userData?.card_count || 0;

        // Custom name is already merged by the API: boost.boost_custom_names?.custom_name
        const customName = boost.boost_custom_names?.custom_name || null;

        return {
          ...boost,
          custom_name: customName,
          card_count: cardCount
        };
      });
      setMergedBoosts(merged);
    }
  }, [boostsResponse?.data, userBoostsResponse?.data]);

  // Update merged boosts when custom name changes
  const handleBoostNameChange = (boostId: string, newName: string | null) => {
    setMergedBoosts(prev => prev.map(boost =>
      boost.id === boostId
        ? { ...boost, custom_name: newName }
        : boost
    ));
    // Also refetch to ensure data consistency
    refetchBoosts();
    refetchUserBoosts();
  }

  const isLoading = boostsLoading || userBoostsLoading
  const error = boostsError || userBoostsError
  const refetch = () => {
    refetchBoosts()
    refetchUserBoosts()
  }

  // Apply search filter
  const filteredBoosts = useMemo(() => {
    if (!searchTerm) return mergedBoosts

    return mergedBoosts.filter((boost: BoostWithCustomName) => {
      const displayName = boost.custom_name || boost.name
      return displayName.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [mergedBoosts, searchTerm])

  return (
    <div className="space-y-4">
      {/* Page Title and Filters */}
      <div className="flex items-center gap-6">
        <h1 className="text-3xl font-bold text-gray-900 mr-4">Boosts</h1>

        {/* Search Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search boosts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <ErrorBoundary
        fallback={
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Failed to load boosts. Please try again.</p>
          </div>
        }
      >
        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Error loading boosts: {error.message}</p>
          </div>
        ) : (
          <DataGrid
            boosts={filteredBoosts}
            title=""
            gridType="boosts"
            showFilters={false}
            showSearch={false}
            showCompareButton={true}
            onBoostNameChange={handleBoostNameChange}
          />
        )}
      </ErrorBoundary>

    </div>
  )
}

function LoginPrompt() {
  return (
    <div className="text-center py-12">
      <Card className="p-8 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign in Required</h2>
        <p className="text-gray-600 mb-6">
          Please sign in to view and manage your boosts collection.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/auth/login">
            <Button variant="primary">Sign In</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline">Create Account</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default function BoostsPage() {
  const { user, loading: authLoading } = useAuth()

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="space-y-6">
        <SkeletonGrid count={8} />
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return <LoginPrompt />
  }

  // Show authenticated boosts page if user is logged in
  return <AuthenticatedBoostsPage />
}
