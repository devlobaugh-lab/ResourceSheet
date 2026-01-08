'use client'

import { useState } from 'react'
import { DataGrid } from '@/components/DataGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { useCatalogItems } from '@/hooks/useApi'
import { CatalogItem } from '@/types/database'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function PartsPage() {
  const { data: catalogResponse, isLoading, error } = useCatalogItems({
    card_type: 0, // Filter for car parts only
    page: 1,
    limit: 100
  })
  const catalogItems = catalogResponse?.data || []

  // Filter to only car parts (card_type === 0) - though API should already filter
  const parts = catalogItems?.filter((item: CatalogItem) => item.card_type === 0) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Car Parts</h1>
          <p className="text-gray-600 mt-1">
            {isLoading ? 'Loading...' : `${parts.length} car parts available`}
          </p>
        </div>
      </div>

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
            items={parts}
            title="All Car Parts"
            gridType="parts"
            showFilters={true}
            showSearch={true}
            showCompareButton={true}
          />
        )}
      </ErrorBoundary>
    </div>
  )
}
