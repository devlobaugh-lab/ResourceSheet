import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserAssetView, CatalogItem, UserItem, Boost, Season } from '@/types/database'

// API base URL
const API_BASE = '/api'

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

      const response = await fetch(`${API_BASE}/user-assets?${params}`)
      
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
      const response = await fetch(`${API_BASE}/user-items`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch user items')
      }
      
      return response.json()
    },
    staleTime: 30 * 1000,
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

      const response = await fetch(`${API_BASE}/user-boosts?${params}`)

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
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
