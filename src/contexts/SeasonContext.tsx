'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthContext'
import { getAuthHeaders } from '@/hooks/useApi'
import type { Season } from '@/types/database'

interface SeasonContextValue {
  activeSeasonId: string | null
  activeSeason: Season | null
  seasons: Season[]
  isLoading: boolean
  setActiveSeason: (id: string | null) => Promise<void>
}

const SeasonContext = createContext<SeasonContextValue>({
  activeSeasonId: null,
  activeSeason: null,
  seasons: [],
  isLoading: true,
  setActiveSeason: async () => {},
})

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all seasons and user profile on mount / user change
  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        // Fetch all seasons (no auth needed)
        const seasonsRes = await fetch('/api/seasons')
        const seasonsData = seasonsRes.ok ? await seasonsRes.json() : { data: [] }
        const allSeasons: Season[] = seasonsData.data ?? seasonsData ?? []

        if (cancelled) return
        setSeasons(allSeasons)

        if (user) {
          // Fetch user profile to get their stored preference
          const headers = await getAuthHeaders()
          const profileRes = await fetch(`/api/profiles/${user.id}`, {
            headers,
            credentials: 'same-origin',
          })
          if (!cancelled && profileRes.ok) {
            const profile = await profileRes.json()
            const storedSeasonId: string | null = profile.active_season_id ?? null

            // Validate stored preference still exists
            if (storedSeasonId && allSeasons.some(s => s.id === storedSeasonId)) {
              setActiveSeasonId(storedSeasonId)
            } else {
              // Fall back to globally active season
              const activeSeason = allSeasons.find(s => s.is_active) ?? null
              setActiveSeasonId(activeSeason?.id ?? null)
            }
          }
        } else {
          // No user: use globally active season
          const activeSeason = allSeasons.find(s => s.is_active) ?? null
          setActiveSeasonId(activeSeason?.id ?? null)
        }
      } catch {
        // On error, leave state unchanged
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [user])

  const setActiveSeason = useCallback(async (id: string | null) => {
    // Optimistically update local state
    setActiveSeasonId(id)

    if (!user) return

    try {
      const headers = await getAuthHeaders()
      await fetch(`/api/profiles/${user.id}`, {
        method: 'PUT',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify({ active_season_id: id }),
      })
    } catch {
      // Non-fatal — local state still reflects the choice
    }
  }, [user])

  const activeSeason = seasons.find(s => s.id === activeSeasonId) ?? null

  return (
    <SeasonContext.Provider value={{ activeSeasonId, activeSeason, seasons, isLoading, setActiveSeason }}>
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason() {
  return useContext(SeasonContext)
}
