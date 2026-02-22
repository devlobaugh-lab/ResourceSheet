'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getAuthHeaders } from '@/hooks/useApi'
import { DropdownMenu, MobileDropdown, MenuItem } from '@/components/ui/DropdownMenu'

// Menu configuration - easy to maintain and extend
const menuConfig = {
  standalone: [
    { label: 'Data Input', href: '/data-input' },
  ],
  dropdowns: [
    {
      label: 'Assets',
      items: [
        { label: 'Drivers', href: '/drivers' },
        { label: 'Car Parts', href: '/parts' },
        { label: 'Boosts', href: '/boosts' },
      ] as MenuItem[],
    },
    {
      label: 'Research',
      items: [
        { label: 'Car Setups', href: '/setups' },
        { label: 'Track Guides', href: '/track-guides' },
        { label: 'GP Guides', href: '/gp-guides' },
        { label: 'Driver Compare', href: '/compare/drivers' },
        { label: 'AI Drivers Compare', href: '/compare/ai' },
      ] as MenuItem[],
    },
    {
      label: 'Reference',
      items: [
        { label: 'Tracks', href: '/tracks' },
        { label: 'Series Info', href: '/series' },
        { label: 'Series Max Loadouts', href: '/series-max-loadouts' },
      ] as MenuItem[],
    },
  ],
  admin: { label: 'Admin', href: '/admin' },
}

interface NavigationMenuProps {
  isAdmin: boolean
}

export function NavigationMenu({ isAdmin }: NavigationMenuProps) {
  return (
    <nav className="hidden md:flex items-center space-x-1">
      {/* Standalone links */}
      {menuConfig.standalone.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          {item.label}
        </Link>
      ))}

      {/* Dropdown menus */}
      {menuConfig.dropdowns.map((dropdown) => (
        <DropdownMenu
          key={dropdown.label}
          label={dropdown.label}
          items={dropdown.items}
        />
      ))}

      {/* Admin link - only visible to admins */}
      {isAdmin && (
        <Link
          href={menuConfig.admin.href}
          className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          {menuConfig.admin.label}
        </Link>
      )}
    </nav>
  )
}

interface MobileNavigationMenuProps {
  isAdmin: boolean
}

export function MobileNavigationMenu({ isAdmin }: MobileNavigationMenuProps) {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  return (
    <div className="space-y-1">
      {/* Standalone links */}
      {menuConfig.standalone.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          {item.label}
        </Link>
      ))}

      {/* Dropdown menus */}
      {menuConfig.dropdowns.map((dropdown) => (
        <MobileDropdown
          key={dropdown.label}
          label={dropdown.label}
          items={dropdown.items}
          isOpen={openDropdowns[dropdown.label] || false}
          onToggle={() => toggleDropdown(dropdown.label)}
        />
      ))}

      {/* Admin link - only visible to admins */}
      {isAdmin && (
        <Link
          href={menuConfig.admin.href}
          className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          {menuConfig.admin.label}
        </Link>
      )}
    </div>
  )
}

// Hook to get admin status for navigation
export function useAdminStatus() {
  const { user } = useAuth()

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const response = await fetch(`/api/profiles/${user.id}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })
      if (!response.ok) return null
      return response.json()
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Check both is_admin and user_type for backward compatibility
  return profile?.is_admin === true || profile?.user_type === 'admin'
}