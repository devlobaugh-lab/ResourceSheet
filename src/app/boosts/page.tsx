'use client'

import { useState } from 'react'
import { DataGrid } from '@/components/DataGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useBoosts } from '@/hooks/useApi'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/components/auth/AuthContext'
import Link from 'next/link'

function AuthenticatedBoostsPage() {
  const { data: boostsResponse, isLoading, error } = useBoosts({
    page: 1,
    limit: 100
  })
  const boosts = boostsResponse?.data || []

  return (
    <div className="space-y-6">
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
            boosts={boosts}
            title="Boosts"
            gridType="boosts"
            showFilters={true}
            showSearch={true}
            showCompareButton={true}
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
