'use client'

import { useState } from 'react'
import { DataGrid } from '@/components/DataGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { useBoosts } from '@/hooks/useApi'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function BoostsPage() {
  const { data: boostsResponse, isLoading, error } = useBoosts({
    page: 1,
    limit: 100
  })
  const boosts = boostsResponse?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boosts</h1>
          <p className="text-gray-600 mt-1">
            {isLoading ? 'Loading...' : `${boosts.length} boosts available`}
          </p>
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
            boosts={boosts}
            title="All Boosts"
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
