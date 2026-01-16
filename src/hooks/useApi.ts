import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@supabase/supabase-js'
import type { UserAssetView, CatalogItem, UserItem, Boost, Season, DriverView, CarPartView, BoostView } from '@/types/database'

// API base URL
const API_BASE = '/api'

// Client-side Supabase client for getting auth tokens
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Helper function to get auth headers
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // For client-side requests, try to get the access token from Supabase session
  if (typeof window !== 'undefined') {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession()

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      } else {
        // If no session, try to refresh or get user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (user && !userError) {
          // User exists but no session, try to refresh
          const { data: { session: refreshedSession }, error: refreshError } = await supabaseClient.auth.refreshSession()
          if (refreshedSession?.access_token && !refreshError) {
            headers['Authorization'] = `Bearer ${refreshedSession.access_token}`
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error)
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
    queryFn: async (): Promise<{ data: DriverView[]; pagination: any }> => {
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

// Fetch user assets (merged catalog + user data)
export function useUserAssets(filters?: {
  season_id?: string
  card_type?: number
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
    queryKey: ['user-assets', filters],
    queryFn: async (): Promise<{ data: UserAssetView[]; pagination: any }> => {
      const params = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${API_BASE}/user-assets?${params}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user assets')
      }

      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Fetch catalog items
export function useCatalogItems(filters?: {
  season_id?: string
  card_type?: number
  rarity?: number
  series?: number
  search?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['catalog-items', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            // Handle numeric values properly
            if (typeof value === 'number') {
              params.append(key, value.toString())
            } else {
              params.append(key, value)
            }
          }
        })
      }

      const response = await fetch(`${API_BASE}/catalog-items?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch catalog items')
      }

      return response.json()
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

// Fetch user items
export function useUserItems() {
  return useQuery({
    queryKey: ['user-items'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/user-items`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user items')
      }

      return response.json()
    },
    staleTime: 30 * 1000,
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
    queryFn: async (): Promise<{ data: CarPartView[]; pagination: any }> => {
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

      const response = await fetch(`${API_BASE}/boosts?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch boosts')
      }

      return response.json()
    },
    staleTime: 60 * 1000,
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
    queryFn: async (): Promise<{ data: any[]; pagination: any }> => {
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

// Update user item mutation
export function useUpdateUserItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { level?: number; card_count?: number } }) => {
      const response = await fetch(`${API_BASE}/user-items/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update user item')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch user items and user assets
      queryClient.invalidateQueries({ queryKey: ['user-items'] })
      queryClient.invalidateQueries({ queryKey: ['user-assets'] })
    },
  })
}

// Add user item mutation
export function useAddUserItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { catalog_item_id: string; level?: number; card_count?: number }) => {
      const response = await fetch(`${API_BASE}/user-items`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to add user item')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch user items and user assets
      queryClient.invalidateQueries({ queryKey: ['user-items'] })
      queryClient.invalidateQueries({ queryKey: ['user-assets'] })
    },
  })
}

// Delete user item mutation
export function useDeleteUserItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/user-items/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Failed to delete user item')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch user items and user assets
      queryClient.invalidateQueries({ queryKey: ['user-items'] })
      queryClient.invalidateQueries({ queryKey: ['user-assets'] })
    },
  })
}
