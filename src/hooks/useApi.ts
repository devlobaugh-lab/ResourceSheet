import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Boost, Season, DriverView, CarPartView, BoostView, UserCarSetup, Track, CatalogItem, SeriesWithTracks } from '@/types/database'
import type { PaginationMeta } from '@/types/api'

// API base URL
const API_BASE = '/api'

// Helper function to get auth headers
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Try to get JWT from localStorage (for client-side authentication)
  if (typeof window !== 'undefined') {
    try {
      // Try to get JWT token from Supabase's session storage
      // Supabase stores session in localStorage with a key like 'sb-[project-ref]-auth-token'
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') && key.includes('-auth-token')
      )
      
      for (const key of supabaseKeys) {
        const sessionData = localStorage.getItem(key)
        if (sessionData) {
          const session = JSON.parse(sessionData)
          const accessToken = session?.access_token
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`
            break // Use the first valid token found
          }
        }
      }

      // Also try the direct supabase.auth.token key as fallback
      if (!headers['Authorization']) {
        const fallbackSession = localStorage.getItem('supabase.auth.token')
        if (fallbackSession) {
          const parsedSession = JSON.parse(fallbackSession)
          const accessToken = parsedSession?.access_token
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`
          }
        }
      }

      // Try the hardcoded key as another fallback (for backward compatibility)
      if (!headers['Authorization']) {
        const token = localStorage.getItem('sb-ndqzqjvqzjxjxqzjxjxj-auth-token')
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      }
    } catch (error) {
      console.warn('Failed to get auth token from localStorage:', error)
    }
  }

  return headers
}

// Fetch drivers
export function useDrivers(filters?: {
  season_id?: string
  rarity?: number
  series?: number
  search?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['drivers', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${API_BASE}/drivers?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch drivers')
      }

      return response.json()
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

// Fetch user drivers (merged drivers + user data)
export function useUserDrivers(filters?: {
  season_id?: string
  rarity?: number
  series?: number
  search?: string
  owned_only?: boolean
  sort_by?: 'name' | 'rarity' | 'series' | 'level'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['user-drivers', filters],
    queryFn: async (): Promise<{ data: DriverView[]; pagination: PaginationMeta }> => {
      const params = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${API_BASE}/drivers/user?${params}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user drivers')
      }

      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Fetch car parts
export function useCarParts(filters?: {
  season_id?: string
  rarity?: number
  series?: number
  car_part_type?: number
  search?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['car-parts', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${API_BASE}/car-parts?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch car parts')
      }

      return response.json()
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

// Fetch user car parts (merged car parts + user data)
export function useUserCarParts(filters?: {
  season_id?: string
  rarity?: number
  series?: number
  car_part_type?: number
  search?: string
  owned_only?: boolean
  sort_by?: 'name' | 'rarity' | 'series' | 'level' | 'car_part_type'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['user-car-parts', filters],
    queryFn: async (): Promise<{ data: CarPartView[]; pagination: PaginationMeta }> => {
      const params = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${API_BASE}/car-parts/user?${params}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user car parts')
      }

      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Fetch boosts
export function useBoosts(filters?: {
  season_id?: string
  rarity?: number
  series?: number
  search?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['boosts', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${API_BASE}/boosts?${params}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch boosts')
      }

      return response.json()
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

// Fetch user boosts (merged boosts + user data)
export function useUserBoosts(filters?: {
  season_id?: string
  rarity?: number
  series?: number
  search?: string
  owned_only?: boolean
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['user-boosts', filters],
    queryFn: async (): Promise<{ data: BoostView[]; pagination: PaginationMeta }> => {
      const params = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${API_BASE}/user-boosts?${params}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user boosts')
      }

      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Fetch seasons
export function useSeasons(filters?: {
  is_active?: boolean
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['seasons', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${API_BASE}/seasons?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch seasons')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch user car setups
export function useUserCarSetups(filters?: { season_id?: string }) {
  return useQuery({
    queryKey: ['user-car-setups', filters],
    queryFn: async (): Promise<{ data: UserCarSetup[]; pagination: PaginationMeta }> => {
      const params = new URLSearchParams()
      if (filters?.season_id) params.append('season_id', filters.season_id)

      const response = await fetch(`${API_BASE}/setups?${params}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user car setups')
      }

      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Fetch GP guides
export function useGpGuides(filters?: { season_id?: string }) {
  return useQuery({
    queryKey: ['gp-guides', filters],
    queryFn: async (): Promise<{ data: import('@/types/database').UserGpGuide[] }> => {
      const params = new URLSearchParams()
      if (filters?.season_id) params.append('season_id', filters.season_id)

      const response = await fetch(`${API_BASE}/gp-guides?${params}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch GP guides')
      }

      return response.json()
    },
    staleTime: 30 * 1000,
  })
}

// Create setup mutation
export function useCreateSetup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      notes?: string | null
      brake_id?: string | null
      gearbox_id?: string | null
      rear_wing_id?: string | null
      front_wing_id?: string | null
      suspension_id?: string | null
      engine_id?: string | null
      series_filter?: number
      bonus_percentage?: number
      season_id?: string | null
    }) => {
      const response = await fetch(`${API_BASE}/setups`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create setup')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch setups
      queryClient.invalidateQueries({ queryKey: ['user-car-setups'] })
    },
  })
}

// Update setup mutation
export function useUpdateSetup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string
      data: Partial<{
        name: string
        notes: string | null
        brake_id: string | null
        gearbox_id: string | null
        rear_wing_id: string | null
        front_wing_id: string | null
        suspension_id: string | null
        engine_id: string | null
        series_filter: number
        bonus_percentage: number
      }>
    }) => {
      const response = await fetch(`${API_BASE}/setups/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update setup')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch setups
      queryClient.invalidateQueries({ queryKey: ['user-car-setups'] })
    },
  })
}

// Delete setup mutation
export function useDeleteSetup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/setups/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Failed to delete setup')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch setups
      queryClient.invalidateQueries({ queryKey: ['user-car-setups'] })
    },
  })
}

// Fetch tracks
export function useTracks(filters?: {
  season_id?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['tracks', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${API_BASE}/tracks?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch tracks')
      }

      return response.json()
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

// Create track mutation
export function useCreateTrack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      alt_name?: string | null
      laps: number
      driver_track_stat: string
      car_track_stat: string
      season_id: string
    }) => {
      const response = await fetch(`${API_BASE}/tracks`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create track')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch tracks
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
    },
  })
}

// Update track mutation
export function useUpdateTrack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string
      data: Partial<{
        name: string
        alt_name: string | null
        laps: number
        driver_track_stat: string
        car_track_stat: string
        season_id: string
      }>
    }) => {
      const response = await fetch(`${API_BASE}/tracks/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update track')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch tracks
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
    },
  })
}

// Delete track mutation
export function useDeleteTrack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/tracks/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })

      if (!response.ok) {
        // Try to parse the error message from the response body
        try {
          const errorData = await response.json()
          throw new Error(errorData?.error?.message || 'Failed to delete track')
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error('Failed to delete track')
          }
          throw parseError
        }
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch tracks
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
    },
  })
}

// Deprecated hooks - kept for backward compatibility with old components
// The catalog_items table has been removed, these hooks return empty data
export function useCatalogItems() {
  return useQuery<CatalogItem[]>({
    queryKey: ['catalog-items-deprecated'],
    queryFn: async () => {
      // Return empty array - the old catalog_items table no longer exists
      return [] as CatalogItem[]
    },
    staleTime: Infinity, // Never refetch deprecated data
  })
}

export function useAddUserItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      catalog_item_id: string
      level: number
      card_count: number
    }) => {
      // This function is deprecated - the catalog_items table no longer exists
      // Return a mock success response
      console.warn('useAddUserItem is deprecated - catalog_items table has been removed')
      return { success: true, ...data }
    },
    onSuccess: () => {
      // No-op since we're not actually updating anything
    },
  })
}

// Fetch series data with track information
export function useSeries() {
  return useQuery({
    queryKey: ['series'],
    queryFn: async (): Promise<{ data: SeriesWithTracks[] }> => {
      const response = await fetch(`${API_BASE}/series`)

      if (!response.ok) {
        throw new Error('Failed to fetch series data')
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
