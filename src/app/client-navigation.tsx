'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/auth/AuthContext'

function AuthSection() {
  const { user } = useAuth()

  if (user) {
    // Logged in: Show Profile button
    return (
      <div className="flex items-center space-x-3">
        <Link href="/profile" className="hidden sm:block">
          <Button variant="outline" size="sm">
            Profile
          </Button>
        </Link>
      </div>
    )
  } else {
    // Not logged in: Show Sign In and Sign Up buttons
    return (
      <div className="flex items-center space-x-3">
        <Link href="/auth/login" className="hidden sm:block">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/register" className="hidden sm:block">
          <Button variant="primary" size="sm">
            Sign Up
          </Button>
        </Link>
      </div>
    )
  }
}

function AuthSectionMobile() {
  const { user } = useAuth()

  if (user) {
    // Logged in: Show Profile button
    return (
      <Link href="/profile" className="block">
        <Button variant="outline" size="sm" className="w-full">
          Profile
        </Button>
      </Link>
    )
  } else {
    // Not logged in: Show Sign In and Sign Up buttons
    return (
      <div className="flex space-x-2">
        <Link href="/auth/login" className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/register" className="flex-1">
          <Button variant="primary" size="sm" className="w-full">
            Sign Up
          </Button>
        </Link>
      </div>
    )
  }
}

export function ClientNavigation() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* Logo - Left aligned, outside container */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex items-center">
            <Link href="/drivers" className="text-xl font-bold text-gray-900">
              F1 Resource Manager
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation and Auth - Centered container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mt-16">
          {/* Spacer for logo */}
          <div className="w-48"></div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/drivers"
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Drivers
            </Link>
            <Link
              href="/parts"
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Car Parts
            </Link>
            <Link
              href="/boosts"
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Boosts
            </Link>
            <Link
              href="/data-input"
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Data Input
            </Link>
            <Link
              href="/setups"
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Setups
            </Link>
            <Link
              href="/compare/drivers"
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Compare
            </Link>
          </nav>

          {/* Dynamic Auth Section */}
          <AuthSection />

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-100">
        <div className="px-4 py-3 space-y-1">
          <Link
            href="/drivers"
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Drivers
          </Link>
          <Link
            href="/parts"
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Car Parts
          </Link>
          <Link
            href="/boosts"
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Boosts
          </Link>
          <Link
            href="/data-input"
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Data Input
          </Link>
          <Link
            href="/setups"
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Setups
          </Link>
          <Link
            href="/compare/drivers"
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Compare
          </Link>
          <div className="pt-3 border-t border-gray-100">
            <AuthSectionMobile />
          </div>
        </div>
      </div>
    </header>
  )
}
