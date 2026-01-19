'use client'

import { DriverCompareGrid } from '@/components/DriverCompareGrid'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/auth/AuthContext'
import Link from 'next/link'

function AuthenticatedCompareDriversPage() {
  return (
    <div className="pt-2 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compare Drivers</h1>
        </div>
      </div>

      {/* Driver Compare Grid */}
      <DriverCompareGrid />
    </div>
  )
}

function LoginPrompt() {
  return (
    <div className="text-center py-12">
      <Card className="p-8 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign in Required</h2>
        <p className="text-gray-600 mb-6">
          Please sign in to compare drivers and analyze scenarios.
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

export default function CompareDriversPage() {
  const { user, loading: authLoading } = useAuth()

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return <LoginPrompt />
  }

  // Show authenticated compare drivers page if user is logged in
  return <AuthenticatedCompareDriversPage />
}
