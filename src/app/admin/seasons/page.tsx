'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuthHeaders } from '@/hooks/useApi'
import { useToast } from '@/components/ui/Toast'
import { useSeason } from '@/contexts/SeasonContext'
import { Plus, Star } from 'lucide-react'
import type { Season } from '@/types/database'

export default function SeasonsAdminPage() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const { setActiveSeason } = useSeason()
  const [newSeasonName, setNewSeasonName] = useState('')

  // Fetch all seasons
  const { data: seasonsData, isLoading } = useQuery({
    queryKey: ['admin-seasons'],
    queryFn: async () => {
      const response = await fetch('/api/seasons', { headers: await getAuthHeaders() })
      if (!response.ok) throw new Error('Failed to fetch seasons')
      return response.json()
    },
  })

  const seasons: Season[] = seasonsData?.data ?? seasonsData ?? []

  // Create season mutation
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to create season')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seasons'] })
      queryClient.invalidateQueries({ queryKey: ['seasons'] })
      addToast('Season created successfully', 'success')
      setNewSeasonName('')
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    },
  })

  // Set active mutation
  const setActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/seasons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({ is_active: true }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to update season')
      }
      return response.json()
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-seasons'] })
      queryClient.invalidateQueries({ queryKey: ['seasons'] })
      setActiveSeason(id)
      addToast('Active season updated', 'success')
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/seasons/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to delete season')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seasons'] })
      queryClient.invalidateQueries({ queryKey: ['seasons'] })
      addToast('Season deleted', 'success')
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSeasonName.trim()) return
    createMutation.mutate(newSeasonName.trim())
  }

  const handleDelete = (season: Season) => {
    if (!confirm(`Delete season "${season.name}"? This cannot be undone and may affect associated data.`)) return
    deleteMutation.mutate(season.id)
  }

  return (
    <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Season Management</h1>
          <p className="mt-2 text-gray-600">Add seasons and set the current active season</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">Back to Admin</Button>
        </Link>
      </div>

      {/* Add Season Form */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Season</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <Input
            type="text"
            value={newSeasonName}
            onChange={(e) => setNewSeasonName(e.target.value)}
            placeholder="e.g. Season 7"
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={createMutation.isPending || !newSeasonName.trim()}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? 'Creating...' : 'Add Season'}
          </Button>
        </form>
      </Card>

      {/* Seasons List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Seasons</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : seasons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seasons.map((season) => (
                  <tr key={season.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {season.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(season.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {season.is_active && (
                        <Badge variant="success">Current</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {!season.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveMutation.mutate(season.id)}
                          disabled={setActiveMutation.isPending}
                          className="inline-flex items-center gap-1"
                        >
                          <Star className="w-3 h-3" />
                          Set Current
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(season)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No seasons yet. Add one above.
          </div>
        )}
      </Card>
    </div>
  )
}
