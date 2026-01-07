'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AssetGrid } from '@/components/AssetGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { useCatalogItems } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { CatalogItem } from '@/types/database'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function ComparePage() {
  const { user } = useAuth()
  const { data: items, isLoading } = useCatalogItems()
  const [compareItems, setCompareItems] = useState<CatalogItem[]>([])
  const [showSelector, setShowSelector] = useState(false)

  const handleCompareSingle = (item: CatalogItem) => {
    if (compareItems.some(i => i.id === item.id)) {
      setCompareItems(compareItems.filter(i => i.id !== item.id))
    } else if (compareItems.length < 4) {
      setCompareItems([...compareItems, item])
    }
  }

  const clearCompare = () => {
    setCompareItems([])
    setShowSelector(false)
  }

  // Group by rarity for the comparison view
  const getRarityLabel = (rarity: number): string => {
    const labels = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
    return labels[rarity] || 'Unknown'
  }

  const getRarityColor = (rarity: number): string => {
    if (rarity >= 4) return 'bg-red-100 text-red-800'
    if (rarity >= 3) return 'bg-purple-100 text-purple-800'
    if (rarity >= 2) return 'bg-blue-100 text-blue-800'
    if (rarity >= 1) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">Failed to load comparison. Please try again.</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compare Items</h1>
            <p className="text-gray-600 mt-1">
              Select up to 4 items to compare side by side
            </p>
          </div>
          {compareItems.length > 0 && (
            <Button variant="outline" onClick={clearCompare}>
              Clear All ({compareItems.length})
            </Button>
          )}
        </div>

        {/* Comparison Grid */}
        {compareItems.length > 0 ? (
          <div className="grid gap-6" style={{ 
            gridTemplateColumns: `repeat(${Math.min(compareItems.length, 4)}, minmax(0, 1fr))` 
          }}>
            {compareItems.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Series {item.series} • {item.card_type === 1 ? 'Driver' : 'Car Part'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCompareSingle(item)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rarity</span>
                    <Badge className={getRarityColor(item.rarity)}>
                      {getRarityLabel(item.rarity)}
                    </Badge>
                  </div>

                  {item.cc_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price</span>
                      <span className="font-medium">{item.cc_price.toLocaleString()} CC</span>
                    </div>
                  )}

                  {item.car_part_type !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type</span>
                      <span className="font-medium">
                        {item.car_part_type === 0 ? 'Engine' :
                         item.car_part_type === 1 ? 'Transmission' :
                         item.car_part_type === 2 ? 'Suspension' :
                         item.car_part_type === 3 ? 'Aerodynamics' : 'Unknown'}
                      </span>
                    </div>
                  )}

                  {item.tag_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tag</span>
                      <span className="font-medium">{item.tag_name}</span>
                    </div>
                  )}

                  {item.stats_per_level && typeof item.stats_per_level === 'object' && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">Stats per Level</p>
                      <div className="space-y-1">
                        {Object.entries(item.stats_per_level).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-medium">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Selected</h3>
            <p className="text-gray-600 mb-6">
              Select items from the catalog below to compare their stats
            </p>
            <Button variant="primary" onClick={() => setShowSelector(true)}>
              Select Items
            </Button>
          </Card>
        )}

        {/* Item Selector */}
        {(showSelector || compareItems.length === 0) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Select Items to Compare</h2>
              {isLoading && <span className="text-gray-500">Loading...</span>}
            </div>

            {isLoading ? (
              <SkeletonGrid count={8} />
            ) : items ? (
              <AssetGrid
                items={items as CatalogItem[]}
                title="All Items"
                variant="compact"
                showFilters={false}
                showSearch={true}
                showCompareButton={true}
                compareItems={compareItems}
                onCompareSingle={handleCompareSingle}
              />
            ) : null}
          </div>
        )}

        {/* Help Text */}
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            <strong>Tip:</strong> Click the &quot;Compare&quot; button on any item to add it to your comparison. 
            You can compare up to 4 items at once. Use the filters to narrow down your search.
          </p>
        </Card>
      </div>
    </ErrorBoundary>
  )
}
