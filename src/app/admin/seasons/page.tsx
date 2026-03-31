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
import { Plus, AlertTriangle, CheckCircle, X } from 'lucide-react'
import type { Season } from '@/types/database'

export default function SeasonsAdminPage() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const { activeSeasonId, setActiveSeason, pendingSeason } = useSeason()

  const [showAddModal, setShowAddModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Fetch all seasons (admin receives pending seasons too via the API)
  const { data: seasonsData, isLoading } = useQuery({
    queryKey: ['admin-seasons'],
    queryFn: async () => {
      const response = await fetch('/api/seasons', { headers: await getAuthHeaders() })
      if (!response.ok) throw new Error('Failed to fetch seasons')
      return response.json()
    },
  })

  const seasons: Season[] = seasonsData?.data ?? seasonsData ?? []
  const currentActiveSeason = seasons.find(s => s.is_active) ?? null
  const isTestingNewSeason = pendingSeason && activeSeasonId === pendingSeason.id

  // Create season mutation
  const createMutation = useMutation({
    mutationFn: async (data: { start_date: string }) => {
      const response = await fetch('/api/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify(data),
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
      setShowAddModal(false)
      setStartDate('')
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    },
  })

  // Activate season mutation
  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/seasons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({ is_active: true }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to activate season')
      }
      return response.json()
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-seasons'] })
      queryClient.invalidateQueries({ queryKey: ['seasons'] })
      setActiveSeason(id)
      setShowActivateModal(false)
      addToast('Season activated successfully', 'success')
    },
    onError: (error: Error) => {
      setShowActivateModal(false)
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
      setDeleteConfirmId(null)
      addToast('Season deleted', 'success')
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    },
  })

  const handleAddSeason = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate) return
    createMutation.mutate({ start_date: startDate })
  }

  const handleToggleTest = () => {
    if (!pendingSeason || !currentActiveSeason) return
    if (isTestingNewSeason) {
      setActiveSeason(currentActiveSeason.id)
    } else {
      setActiveSeason(pendingSeason.id)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Season Management</h1>
          <p className="mt-2 text-gray-600">Manage seasons and the season transition workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddModal(true)}
            disabled={!!pendingSeason}
            title={pendingSeason ? 'A pending season already exists. Activate or delete it first.' : undefined}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Season
          </Button>
          <Link href="/admin">
            <Button variant="outline">Back to Admin</Button>
          </Link>
        </div>
      </div>

      {/* Pending Season Card */}
      {pendingSeason && (
        <Card className="p-6 mb-6 border-2 border-amber-300 bg-amber-50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pending: {pendingSeason.name}
              </h2>
              {pendingSeason.start_date && (
                <p className="text-sm text-gray-600 mt-1">
                  Season starts: {new Date(pendingSeason.start_date + 'T00:00:00').toLocaleDateString()}
                </p>
              )}
            </div>
            <Badge variant="warning">Pending</Badge>
          </div>

          {!pendingSeason.content_cache_loaded ? (
            <div className="flex items-start gap-2 p-3 bg-amber-100 rounded-lg mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                Content cache not yet loaded. Go to{' '}
                <Link href="/admin/content-cache" className="underline font-medium">
                  Content Cache
                </Link>{' '}
                and import a file for this season before you can activate it.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg mb-4">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-sm text-green-800">Content cache loaded. Ready to activate.</p>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {currentActiveSeason && (
              <Button
                variant="outline"
                onClick={handleToggleTest}
                className="whitespace-nowrap"
              >
                {isTestingNewSeason ? 'Return to Current Season' : 'Test New Season'}
              </Button>
            )}
            <Button
              onClick={() => setShowActivateModal(true)}
              disabled={!pendingSeason.content_cache_loaded || activateMutation.isPending}
              title={!pendingSeason.content_cache_loaded ? 'Load a content cache file first' : undefined}
              className="whitespace-nowrap"
            >
              {activateMutation.isPending ? 'Activating…' : 'Activate New Season'}
            </Button>
          </div>
        </Card>
      )}

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seasons.map((season) => {
                  const isPending = season.activated_at === null
                  return (
                    <tr key={season.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {season.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {season.start_date
                          ? new Date(season.start_date + 'T00:00:00').toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(season.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {season.is_active ? (
                          <Badge variant="success">Current</Badge>
                        ) : isPending ? (
                          <Badge variant="warning">Pending</Badge>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(season.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No seasons yet. Add one above.
          </div>
        )}
      </Card>

      {/* Add Season Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Season</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              The season will be automatically named. Choose the date rotation 1 begins.
            </p>
            <form onSubmit={handleAddSeason} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Season Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Track rotation 1 will start on this date and cycle through all 7 sets every 2 weeks.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || !startDate}
                >
                  {createMutation.isPending ? 'Creating…' : 'Create Season'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Activate Confirmation Modal */}
      {showActivateModal && pendingSeason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Activate {pendingSeason.name}?
              </h2>
              <button onClick={() => setShowActivateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-700">
                This will make <strong>{pendingSeason.name}</strong> the active season for all users.
              </p>
              {pendingSeason.start_date && (
                <p className="text-sm text-gray-700">
                  The track rotation schedule will be automatically regenerated starting from{' '}
                  <strong>{new Date(pendingSeason.start_date + 'T00:00:00').toLocaleDateString()}</strong>{' '}
                  with rotation 1, cycling through all 7 sets every 2 weeks for 2 years.
                </p>
              )}
              <p className="text-sm font-medium text-red-600">This cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowActivateModal(false)}
                disabled={activateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => activateMutation.mutate(pendingSeason.id)}
                disabled={activateMutation.isPending}
              >
                {activateMutation.isPending ? 'Activating…' : `Yes, Activate ${pendingSeason.name}`}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Delete Season?</h2>
              <button onClick={() => setDeleteConfirmId(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              This cannot be undone and will remove all associated data (drivers, car parts, boosts, etc.) for this season.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete Season'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
