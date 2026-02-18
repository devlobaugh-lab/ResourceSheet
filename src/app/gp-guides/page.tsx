'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getAuthHeaders } from '@/hooks/useApi'
import { UserGpGuide } from '@/types/database'

export const dynamic = 'force-dynamic'

const GP_LEVELS = [
  { id: 0, name: 'Junior', color: 'bg-blue-100 text-blue-800', seriesMax: 3 },
  { id: 1, name: 'Challenger', color: 'bg-green-100 text-green-800', seriesMax: 6 },
  { id: 2, name: 'Contender', color: 'bg-yellow-100 text-yellow-800', seriesMax: 9 },
  { id: 3, name: 'Champion', color: 'bg-red-100 text-red-800', seriesMax: 12 },
]

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function GpGuidesPage() {
  const router = useRouter()
  const [guides, setGuides] = useState<UserGpGuide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Create form state
  const [newName, setNewName] = useState('')
  const [newStartDate, setNewStartDate] = useState('')
  const [newGpLevel, setNewGpLevel] = useState<number>(3)

  const fetchGuides = useCallback(async () => {
    try {
      const response = await fetch('/api/gp-guides', {
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
      })
      const result = response.ok ? await response.json() : { data: [] }
      setGuides(result.data || [])
    } catch {
      setGuides([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGuides()
  }, [fetchGuides])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setIsCreating(true)
    setError(null)
    try {
      const response = await fetch('/api/gp-guides', {
        method: 'POST',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({
          name: newName.trim(),
          start_date: newStartDate || null,
          gp_level: newGpLevel,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error?.message || 'Failed to create GP guide')
      }

      const result = await response.json()
      // Navigate to the new guide editor
      router.push(`/gp-guides/${result.data.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeletingId(id)
    try {
      const response = await fetch(`/api/gp-guides/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
      })
      if (response.ok) {
        setGuides(prev => prev.filter(g => g.id !== id))
      }
    } catch {
      // Silently handle error
    } finally {
      setIsDeletingId(null)
      setDeleteConfirmId(null)
    }
  }

  const gpLevelInfo = (level: number) => GP_LEVELS[level] || GP_LEVELS[3]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GP Guides</h1>
              <p className="mt-1 text-gray-600">
                Plan your weekly GP strategy — qualifying, opening round, and final round.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setShowCreateForm(true)
                setError(null)
                setNewName('')
                setNewStartDate('')
                setNewGpLevel(3)
              }}
            >
              + New GP Guide
            </Button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <Card className="p-5 mb-6 border-2 border-blue-200 bg-blue-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New GP Guide</h2>
              <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Monaco GP Week"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    autoFocus
                  />
                </div>

                <div className="min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={e => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="min-w-[160px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GP Level
                  </label>
                  <select
                    value={newGpLevel}
                    onChange={e => setNewGpLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {GP_LEVELS.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name} (Series ≤{level.seriesMax})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" variant="primary" disabled={isCreating || !newName.trim()}>
                    {isCreating ? 'Creating...' : 'Create & Edit'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowCreateForm(false); setError(null) }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}
            </Card>
          )}

          {/* Guides List */}
          {isLoading ? (
            <Card className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            </Card>
          ) : guides.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-5xl mb-4">🏁</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No GP Guides Yet</h2>
              <p className="text-gray-500 mb-6">
                Create your first GP guide to start planning your weekly race strategy.
              </p>
              <Button
                variant="primary"
                onClick={() => setShowCreateForm(true)}
              >
                + Create First GP Guide
              </Button>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                        GP Level
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guides.map((guide) => {
                      const level = gpLevelInfo(guide.gp_level)
                      return (
                        <tr key={guide.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3">
                            <div className="text-sm font-semibold text-gray-900">{guide.name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(guide.start_date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${level.color}`}>
                              {level.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                            {guide.notes ? (
                              <span className="truncate block max-w-xs" title={guide.notes}>
                                {guide.notes.length > 80 ? guide.notes.slice(0, 80) + '…' : guide.notes}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Link href={`/gp-guides/${guide.id}`}>
                                <Button variant="outline" size="sm">View/Edit</Button>
                              </Link>
                              {deleteConfirmId === guide.id ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-600">Delete?</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={() => handleDelete(guide.id)}
                                    disabled={isDeletingId === guide.id}
                                  >
                                    {isDeletingId === guide.id ? '...' : 'Yes'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteConfirmId(null)}
                                  >
                                    No
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => setDeleteConfirmId(guide.id)}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
