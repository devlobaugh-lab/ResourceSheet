'use client'

import { useState } from 'react'
import { DataGrid } from '@/components/DataGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { useCarParts } from '@/hooks/useApi'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function PartsPage() {
  const { data: carPartsResponse, isLoading, error } = useCarParts({
    page: 1,
    limit: 100
  })
  const carParts = carPartsResponse?.data || []

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Car Parts</h1>
        <p className="text-gray-600 mt-1">
          {isLoading ? 'Loading...' : `${carParts.length} car parts available`}
        </p>
        </div>
      </div> */}

      <ErrorBoundary
        fallback={
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Failed to load car parts. Please try again.</p>
          </div>
        }
      >
        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Error loading car parts: {error.message}</p>
          </div>
        ) : (
          <DataGrid
            items={carParts}
            title="Car Parts"
            gridType="car-parts"
            showFilters={true}
            showSearch={true}
            showCompareButton={true}
          />
        )}
      </ErrorBoundary>
    </div>
  )
}
