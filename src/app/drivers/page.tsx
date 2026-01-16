'use client'

import { useState, useMemo } from 'react'
import { DataGrid } from '@/components/DataGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUserDrivers, useDrivers } from '@/hooks/useApi'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/components/auth/AuthContext'
import Link from 'next/link'

function AuthenticatedDriversPage() {
  const { data: driversResponse, isLoading, error } = useUserDrivers({
    page: 1,
    limit: 100
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [maxSeries, setMaxSeries] = useState(12)

  // Apply filters to the data
  const filteredDrivers = useMemo(() => {
    if (!driversResponse?.data) return []

    return driversResponse.data.filter(driver => {
      const matchesSearch = !searchTerm ||
        driver.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMaxSeries = driver.series <= maxSeries

      return matchesSearch && matchesMaxSeries
    })
  }, [driversResponse?.data, searchTerm, maxSeries])

  return (
    <div className="space-y-4">
      {/* Page Title and Filters */}
      <div className="flex items-center gap-6">
        <h1 className="text-3xl font-bold text-gray-900 mr-4">Drivers</h1>

        {/* Search and Max Series Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="maxSeries" className="text-sm font-medium text-gray-700">
              Max Series:
            </label>
            <select
              id="maxSeries"
              className="rounded-lg border-gray-300 text-sm px-3 py-2 pr-8 bg-white bg-no-repeat bg-right appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' class=\'w-4 h-4\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }}
              value={maxSeries}
              onChange={(e) => setMaxSeries(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={12 - i} value={12 - i}>
                  {12 - i}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ErrorBoundary
        fallback={
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Failed to load drivers. Please try again.</p>
          </div>
        }
      >
        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Error loading drivers: {error.message}</p>
          </div>
        ) : (
          <DataGrid
            drivers={filteredDrivers}
            title=""
            gridType="drivers"
            showFilters={false}
            showSearch={false}
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
          Please sign in to view and manage your driver collection.
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

export default function DriversPage() {
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

  // Show authenticated drivers page if user is logged in
  return <AuthenticatedDriversPage />
}
