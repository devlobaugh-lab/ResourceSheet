'use client'

import React, { useState, useRef, useEffect, ReactNode } from 'react'
import Link from 'next/link'

export interface MenuItem {
  label: string
  href?: string
  disabled?: boolean
  disabledReason?: string
}

interface DropdownMenuProps {
  label: string
  items: MenuItem[]
  className?: string
}

export function DropdownMenu({ label, items, className = '' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    // Small delay to prevent flickering when moving to dropdown
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div
      ref={dropdownRef}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleToggle}
        className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-fade-in">
          {items.map((item, index) => {
            if (item.disabled) {
              return (
                <div
                  key={index}
                  className="px-4 py-2 text-gray-400 cursor-not-allowed flex items-center justify-between"
                  title={item.disabledReason || 'Coming soon'}
                >
                  <span>{item.label}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Soon</span>
                </div>
              )
            }

            return (
              <Link
                key={index}
                href={item.href || '#'}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Mobile accordion-style dropdown
interface MobileDropdownProps {
  label: string
  items: MenuItem[]
  isOpen: boolean
  onToggle: () => void
}

export function MobileDropdown({ label, items, isOpen, onToggle }: MobileDropdownProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-between"
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 animate-fade-in">
          {items.map((item, index) => {
            if (item.disabled) {
              return (
                <div
                  key={index}
                  className="block px-4 py-2 rounded-lg text-gray-400 cursor-not-allowed flex items-center justify-between"
                  title={item.disabledReason || 'Coming soon'}
                >
                  <span>{item.label}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Soon</span>
                </div>
              )
            }

            return (
              <Link
                key={index}
                href={item.href || '#'}
                className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}