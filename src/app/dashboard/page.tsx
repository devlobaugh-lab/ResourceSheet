'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonProfile } from '@/components/ui/Skeleton'
import { useUserAssets, useUserItems, useCatalogItems } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { UserItem, CatalogItem } from '@/types/database'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { data: catalogItems } = useCatalogItems()
  const { data: userItems } = useUserItems()
  const { data: userAssets } = useUserAssets()
  
  // Calculate stats
  const totalCatalog = catalogItems?.length || 0
  const ownedItems = userItems?.length || 0
  const totalDrivers = catalogItems?.filter((i: CatalogItem) => i.card_type === 1).length || 0
  const totalParts = catalogItems?.filter((i: CatalogItem) => i.card_type === 0).length || 0
  
  const ownedDrivers = userItems?.filter((ui: UserItem) => {
    const item = catalogItems?.find((c: CatalogItem) => c.id === ui.catalog_item_id)
    return item?.card_type === 1
  }).length || 0
  
  const ownedParts = userItems?.filter((ui: UserItem) => {
    const item = catalogItems?.find((c: CatalogItem) => c.id === ui.catalog_item_id)
    return item?.card_type === 0
  }).length || 0

  if (authLoading) {
    return (
      <div className="space-y-6">
        <SkeletonProfile />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Card className="p-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign in Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your dashboard and track your collection.
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

  const stats = [
    {
      label: 'Total Items',
      value: ownedItems,
      total: totalCatalog,
      color: 'blue',
    },
    {
      label: 'Drivers',
      value: ownedDrivers,
      total: totalDrivers,
      color: 'green',
    },
    {
      label: 'Car Parts',
      value: ownedParts,
      total: totalParts,
      color: 'purple',
    },
    {
      label: 'Completion',
      value: totalCatalog > 0 ? Math.round((ownedItems / totalCatalog) * 100) : 0,
      suffix: '%',
      color: 'orange',
    },
  ]

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">Failed to load dashboard. Please try again.</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.email}</p>
          </div>
          <Link href="/assets/add">
            <Button variant="primary">Add Items</Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className={`rounded-lg p-3 ${colorClasses[stat.color]} mb-3`}>
                <p className="text-sm font-medium">{stat.label}</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}{stat.suffix || ''}
                {stat.total !== undefined && (
                  <span className="text-lg text-gray-500"> / {stat.total}</span>
                )}
              </p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/assets/add">
              <Button variant="outline" className="w-full h-auto py-4 flex-col">
                <span className="text-lg mb-1">+</span>
                <span>Add Items</span>
              </Button>
            </Link>
            <Link href="/drivers">
              <Button variant="outline" className="w-full h-auto py-4 flex-col">
                <span className="text-lg mb-1">🏎️</span>
                <span>Browse Drivers</span>
              </Button>
            </Link>
            <Link href="/parts">
              <Button variant="outline" className="w-full h-auto py-4 flex-col">
                <span className="text-lg mb-1">⚙️</span>
                <span>Browse Parts</span>
              </Button>
            </Link>
            <Link href="/compare">
              <Button variant="outline" className="w-full h-auto py-4 flex-col">
                <span className="text-lg mb-1">📊</span>
                <span>Compare</span>
              </Button>
            </Link>
          </div>
        </Card>

        {/* Collection Summary */}
        {userItems && userItems.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Items</h2>
            <div className="space-y-3">
              {userItems.slice(0, 5).map((item: UserItem) => {
                const catalogItem = catalogItems?.find((c: CatalogItem) => c.id === item.catalog_item_id)
                return (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {catalogItem?.card_type === 1 ? '🏎️' : '⚙️'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{catalogItem?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">
                          Level {item.level} • {item.card_count} cards
                        </p>
                      </div>
                    </div>
                    <Badge variant={item.level >= 5 ? 'destructive' : item.level >= 3 ? 'secondary' : 'outline'}>
                      Lv {item.level}
                    </Badge>
                  </div>
                )
              })}
            </div>
            {userItems.length > 5 && (
              <div className="mt-4 text-center">
                <Link href="/profile" className="text-blue-600 hover:text-blue-700 text-sm">
                  View all {userItems.length} items →
                </Link>
              </div>
            )}
          </Card>
        )}
      </div>
    </ErrorBoundary>
  )
}
