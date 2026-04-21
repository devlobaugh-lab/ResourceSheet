import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Boost, Season, DriverView, CarPartView, BoostView, UserCarSetup, Track, CatalogItem, SeriesWithTracks, TrackRotationView, UserRotationSetData } from '@/types/database'
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
      battery_id?: string | null
      series_filter?: number
      bonus_percentage?: number
      bonus_part_ids?: string[]
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
        battery_id: string | null
        series_filter: number
        bonus_percentage: number
        bonus_part_ids: string[]
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
}, options?: { enabled?: boolean }) {
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
    enabled: options?.enabled ?? true,
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

// Fetch current track rotation by date and/or season
export function useCurrentTrackRotation(date?: string, seasonId?: string) {
  return useQuery({
    queryKey: ['track-rotation', date, seasonId],
    queryFn: async (): Promise<TrackRotationView> => {
      const params = new URLSearchParams()
      if (date) params.set('date', date)
      if (seasonId) params.set('season_id', seasonId)
      const qs = params.toString()
      const response = await fetch(`${API_BASE}/track-rotations${qs ? `?${qs}` : ''}`)
      if (!response.ok) {
        throw new Error('Failed to fetch track rotation')
      }
      return response.json()
    },
    enabled: !!seasonId,
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch track rotation schedule entries, optionally filtered by season
export function useTrackRotationSchedule(seasonId?: string) {
  return useQuery({
    queryKey: ['track-rotation-schedule', seasonId],
    queryFn: async (): Promise<{ data: (import('@/types/database').TrackRotationScheduleEntry & { rotation_set_number: number })[] }> => {
      const qs = seasonId ? `?season_id=${seasonId}` : ''
      const response = await fetch(`${API_BASE}/track-rotations/schedule${qs}`)
      if (!response.ok) {
        throw new Error('Failed to fetch rotation schedule')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Admin: fetch all rotation sets
export function useAdminRotationSets() {
  return useQuery({
    queryKey: ['admin-rotation-sets'],
    queryFn: async (): Promise<{ data: import('@/types/database').TrackRotationSet[] }> => {
      const response = await fetch(`${API_BASE}/admin/track-rotations/sets`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
      })
      if (!response.ok) throw new Error('Failed to fetch rotation sets')
      return response.json()
    },
    staleTime: 60 * 1000,
  })
}

// Admin: update a rotation set
export function useUpdateRotationSet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, series_data }: { id: string; series_data: import('@/types/database').RotationSeriesData }) => {
      const response = await fetch(`${API_BASE}/admin/track-rotations/sets/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({ series_data }),
      })
      if (!response.ok) throw new Error('Failed to update rotation set')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rotation-sets'] })
      queryClient.invalidateQueries({ queryKey: ['track-rotation'] })
    },
  })
}

// Admin: fetch all schedule entries
export function useAdminRotationSchedule() {
  return useQuery({
    queryKey: ['admin-rotation-schedule'],
    queryFn: async (): Promise<{ data: (import('@/types/database').TrackRotationScheduleEntry & { rotation_set_number: number })[] }> => {
      const response = await fetch(`${API_BASE}/admin/track-rotations/schedule`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
      })
      if (!response.ok) throw new Error('Failed to fetch admin schedule')
      return response.json()
    },
    staleTime: 60 * 1000,
  })
}

// Admin: create schedule entry
export function useCreateRotationScheduleEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { rotation_set_id: string; season_id?: string | null; start_date: string; end_date: string }) => {
      const response = await fetch(`${API_BASE}/admin/track-rotations/schedule`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create schedule entry')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rotation-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['track-rotation-schedule'] })
    },
  })
}

// Admin: update schedule entry
export function useUpdateRotationScheduleEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { rotation_set_id?: string; season_id?: string | null; start_date?: string; end_date?: string } }) => {
      const response = await fetch(`${API_BASE}/admin/track-rotations/schedule/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update schedule entry')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rotation-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['track-rotation-schedule'] })
    },
  })
}

// Admin: delete schedule entry
export function useDeleteRotationScheduleEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/admin/track-rotations/schedule/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
      })
      if (!response.ok) throw new Error('Failed to delete schedule entry')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rotation-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['track-rotation-schedule'] })
    },
  })
}

// Admin: generate 26 schedule entries for a season
export function useGenerateSeasonSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ season_id, start_date }: { season_id: string; start_date: string }) => {
      const response = await fetch(`${API_BASE}/admin/track-rotations/schedule/generate`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({ season_id, start_date }),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error?.message ?? 'Failed to generate schedule')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rotation-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['track-rotation-schedule'] })
    },
  })
}

// Fetch series data with track information
export function useSeries(filters?: { season_id?: string }) {
  return useQuery({
    queryKey: ['series', filters],
    queryFn: async (): Promise<{ data: SeriesWithTracks[] }> => {
      const params = new URLSearchParams()
      if (filters?.season_id) params.append('season_id', filters.season_id)
      const query = params.toString() ? `?${params}` : ''
      const response = await fetch(`${API_BASE}/series${query}`)

      if (!response.ok) {
        throw new Error('Failed to fetch series data')
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch user rotation data (series + track) for a given rotation set
export function useUserRotationSetData(rotationSetId?: string) {
  return useQuery({
    queryKey: ['user-rotation-data', rotationSetId],
    queryFn: async (): Promise<UserRotationSetData> => {
      const response = await fetch(
        `${API_BASE}/track-rotations/user-data?rotation_set_id=${rotationSetId}`,
        { headers: await getAuthHeaders(), credentials: 'same-origin' }
      )
      if (!response.ok) throw new Error('Failed to fetch user rotation data')
      return response.json()
    },
    enabled: !!rotationSetId,
    staleTime: 30 * 1000,
  })
}

// Upsert a series data row (driver 1, driver 2, inline setup)
export function useUpsertRotationSeriesData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      rotation_set_id: string
      series_index: number
      driver_1_id?: string | null
      driver_2_id?: string | null
      setup_brake_id?: string | null
      setup_gearbox_id?: string | null
      setup_rear_wing_id?: string | null
      setup_front_wing_id?: string | null
      setup_suspension_id?: string | null
      setup_engine_id?: string | null
      setup_bonus_percentage?: number
      setup_series_filter?: number
    }) => {
      const response = await fetch(`${API_BASE}/track-rotations/user-data`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to save series data')
      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-rotation-data', variables.rotation_set_id] })
    },
  })
}

// Upsert a track data row (boost, dry/wet strategy)
export function useUpsertRotationTrackData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      rotation_set_id: string
      series_index: number
      track_position: number
      boost_id?: string | null
      dry_strategy?: string | null
      wet_strategy?: string | null
    }) => {
      const response = await fetch(`${API_BASE}/track-rotations/user-data/track`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to save track data')
      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-rotation-data', variables.rotation_set_id] })
    },
  })
}
