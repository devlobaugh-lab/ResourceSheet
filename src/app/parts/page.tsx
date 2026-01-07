'use client'

import { useState } from 'react'
import { AssetGrid } from '@/components/AssetGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { useCatalogItems } from '@/hooks/useApi'
import { CatalogItem } from '@/types/database'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function PartsPage() {
  const { data: items, isLoading, error } = useCatalogItems()
  
  // Filter to only car parts (card_type === 0)
  const parts = items?.filter((item: CatalogItem) => item.card_type === 0) || []

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
          <AssetGrid
            items={parts as CatalogItem[]}
            title="All Car Parts"
            variant="default"
            showFilters={true}
            showSearch={true}
            showCompareButton={true}
          />
        )}
      </ErrorBoundary>
    </div>
  )
}
