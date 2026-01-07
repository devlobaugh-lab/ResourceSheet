'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useBoosts } from '@/hooks/useApi'
import { Boost } from '@/types/database'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { formatNumber } from '@/lib/utils'

function BoostCard({ boost }: { boost: Boost }) {
  const getRarityVariant = (rarity: number): 'destructive' | 'secondary' | 'default' | 'outline' => {
    if (rarity >= 4) return 'destructive'
    if (rarity >= 3) return 'secondary'
    if (rarity >= 2) return 'default'
    return 'outline'
  }

  const rarityLabels = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{boost.name}</h3>
          <p className="text-sm text-gray-500">{boost.boost_type}</p>
        </div>
        <Badge variant={getRarityVariant(boost.rarity)}>
          {rarityLabels[boost.rarity] || 'Unknown'}
        </Badge>
      </div>

      {boost.series && (
        <p className="text-sm text-gray-600 mb-2">Series {boost.series}</p>
      )}

      {boost.boost_stats && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <p className="font-medium text-gray-700 mb-1">Boost Stats:</p>
          {typeof boost.boost_stats === 'object' && boost.boost_stats !== null && (
            <div className="space-y-1">
              {Object.entries(boost.boost_stats).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-medium">{value as string}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default function BoostsPage() {
  const { data: boosts, isLoading, error } = useBoosts()

  const gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boosts</h1>
          <p className="text-gray-600 mt-1">
            {isLoading ? 'Loading...' : `${boosts?.length || 0} boosts available`}
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
          <div className={`grid gap-6 ${gridCols}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton width="60%" height={24} className="mb-2" />
                <Skeleton width="40%" height={16} className="mb-4" />
                <Skeleton width="100%" height={60} />
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Error loading boosts: {error.message}</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${gridCols}`}>
            {boosts?.map((boost: Boost) => (
              <BoostCard key={boost.id} boost={boost} />
            ))}
          </div>
        )}
      </ErrorBoundary>

      {boosts && boosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No boosts found</p>
        </div>
      )}
    </div>
  )
}
