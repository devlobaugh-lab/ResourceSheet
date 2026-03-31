'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/auth/AuthContext'
import { NavigationMenu, MobileNavigationMenu, useAdminStatus } from '@/components/NavigationMenu'
import { useSeason } from '@/contexts/SeasonContext'

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

function MobileMenuButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button 
      className="md:hidden p-2 rounded-lg hover:bg-gray-100"
      onClick={onClick}
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  )
}

export function ClientNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isAdmin = useAdminStatus()
  const { activeSeason } = useSeason()

  const isHistoricalSeason = activeSeason !== null && !activeSeason.is_active

  return (
    <header className={isHistoricalSeason ? 'bg-amber-50 shadow-sm border-b border-amber-300' : 'bg-white shadow-sm border-b border-gray-200'}>
      {/* Logo - Left aligned, outside container */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex items-baseline gap-3">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              F1 Resource Manager
            </Link>
            {isHistoricalSeason && (
              <span className="text-base font-bold text-red-600">({activeSeason.name})</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation and Auth - Centered container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mt-16">
          {/* Spacer for logo */}
          <div className="w-48"></div>

          {/* Desktop Navigation */}
          <NavigationMenu isAdmin={isAdmin} />

          {/* Dynamic Auth Section */}
          <AuthSection />

          {/* Mobile Menu Button */}
          <MobileMenuButton 
            isOpen={isMobileMenuOpen} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          />
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-4 py-3 space-y-1">
            <MobileNavigationMenu isAdmin={isAdmin} />
            <div className="pt-3 border-t border-gray-100">
              <AuthSectionMobile />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}