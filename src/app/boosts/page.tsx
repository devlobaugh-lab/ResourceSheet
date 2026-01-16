'use client'

import { useState, useMemo } from 'react'
import { DataGrid } from '@/components/DataGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useBoosts } from '@/hooks/useApi'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/components/auth/AuthContext'
import Link from 'next/link'

function AuthenticatedBoostsPage() {
  const { data: boostsResponse, isLoading, error, refetch } = useBoosts({
    page: 1,
    limit: 100
  })

  const [searchTerm, setSearchTerm] = useState('')

  // Transform the boosts data to flatten custom_name from boost_custom_names
  const rawBoosts = (boostsResponse?.data || []).map((boost: any) => ({
    ...boost,
    custom_name: boost.boost_custom_names?.custom_name || null
  }))

  // Apply search filter
  const filteredBoosts = useMemo(() => {
    if (!searchTerm) return rawBoosts

    return rawBoosts.filter(boost => {
      const displayName = boost.custom_name || boost.name
      return displayName.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [rawBoosts, searchTerm])

  return (
    <div className="space-y-4">
      {/* Page Title and Filters */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Boosts</h1>

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
            onBoostNameChange={refetch}
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
