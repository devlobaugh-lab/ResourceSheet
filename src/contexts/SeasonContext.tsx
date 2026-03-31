'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/AuthContext'
import { getAuthHeaders } from '@/hooks/useApi'
import type { Season } from '@/types/database'

const LAST_SEEN_ACTIVATED_AT_KEY = 'lastSeenActivatedAt'

interface SeasonContextValue {
  activeSeasonId: string | null
  activeSeason: Season | null
  seasons: Season[]
  pendingSeason: Season | null
  isLoading: boolean
  showNewSeasonModal: boolean
  setActiveSeason: (id: string | null) => Promise<void>
  dismissNewSeasonModal: () => void
}

const SeasonContext = createContext<SeasonContextValue>({
  activeSeasonId: null,
  activeSeason: null,
  seasons: [],
  pendingSeason: null,
  isLoading: true,
  showNewSeasonModal: false,
  setActiveSeason: async () => {},
  dismissNewSeasonModal: () => {},
})

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showNewSeasonModal, setShowNewSeasonModal] = useState(false)
  // Track the last activated_at we've shown the modal for (to avoid re-showing on every focus)
  const suppressedActivatedAt = useRef<string | null>(null)

  const load = useCallback(async (cancelled: { value: boolean }) => {
    try {
      // Fetch seasons with auth headers so admins receive pending seasons too
      const headers = user ? await getAuthHeaders() : {}
      const seasonsRes = await fetch('/api/seasons', { headers })
      const seasonsData = seasonsRes.ok ? await seasonsRes.json() : { data: [] }
      const allSeasons: Season[] = seasonsData.data ?? seasonsData ?? []

      if (cancelled.value) return
      setSeasons(allSeasons)

      // Determine active season id
      let resolvedSeasonId: string | null = null

      if (user) {
        const profileRes = await fetch(`/api/profiles/${user.id}`, {
          headers,
          credentials: 'same-origin',
        })
        if (!cancelled.value && profileRes.ok) {
          const profile = await profileRes.json()
          const storedSeasonId: string | null = profile.active_season_id ?? null
          if (storedSeasonId && allSeasons.some(s => s.id === storedSeasonId)) {
            resolvedSeasonId = storedSeasonId
          }
        }
      }

      if (!resolvedSeasonId) {
        const activeSeason = allSeasons.find(s => s.is_active) ?? null
        resolvedSeasonId = activeSeason?.id ?? null
      }

      if (!cancelled.value) {
        setActiveSeasonId(resolvedSeasonId)
      }

      // New season popup detection: compare active season's activated_at to what we've last seen.
      // Only show the modal if this is not the first ever visit (key must exist in localStorage).
      const globalActiveSeason = allSeasons.find(s => s.is_active) ?? null
      if (globalActiveSeason?.activated_at && typeof window !== 'undefined') {
        const lastSeen = localStorage.getItem(LAST_SEEN_ACTIVATED_AT_KEY)
        if (lastSeen === null) {
          // First visit — store silently without showing the modal
          localStorage.setItem(LAST_SEEN_ACTIVATED_AT_KEY, globalActiveSeason.activated_at)
        } else if (
          lastSeen !== globalActiveSeason.activated_at &&
          suppressedActivatedAt.current !== globalActiveSeason.activated_at
        ) {
          if (!cancelled.value) setShowNewSeasonModal(true)
        }
      }
    } catch {
      // Non-fatal
    } finally {
      if (!cancelled.value) setIsLoading(false)
    }
  }, [user])

  // Load on mount and when user changes
  useEffect(() => {
    const cancelled = { value: false }
    setIsLoading(true)
    load(cancelled)
    return () => { cancelled.value = true }
  }, [load])

  // Re-check on window focus (to catch season changes in other tabs/sessions)
  useEffect(() => {
    const handleFocus = () => {
      const cancelled = { value: false }
      load(cancelled)
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [load])

  const setActiveSeason = useCallback(async (id: string | null) => {
    setActiveSeasonId(id)
    queryClient.invalidateQueries()

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
      // Non-fatal
    }
  }, [user, queryClient])

  const dismissNewSeasonModal = useCallback(() => {
    setShowNewSeasonModal(false)
    const globalActiveSeason = seasons.find(s => s.is_active) ?? null
    if (globalActiveSeason?.activated_at && typeof window !== 'undefined') {
      localStorage.setItem(LAST_SEEN_ACTIVATED_AT_KEY, globalActiveSeason.activated_at)
      suppressedActivatedAt.current = globalActiveSeason.activated_at
    }
  }, [seasons])

  const activeSeason = seasons.find(s => s.id === activeSeasonId) ?? null
  // A pending season has no activated_at (never been made active)
  const pendingSeason = seasons.find(s => s.activated_at === null) ?? null

  return (
    <SeasonContext.Provider value={{
      activeSeasonId,
      activeSeason,
      seasons,
      pendingSeason,
      isLoading,
      showNewSeasonModal,
      setActiveSeason,
      dismissNewSeasonModal,
    }}>
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason() {
  return useContext(SeasonContext)
}
