'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useToast } from '@/components/ui/Toast'
import {
  useAdminRotationSets,
  useUpdateRotationSet,
  useAdminRotationSchedule,
  useCreateRotationScheduleEntry,
  useUpdateRotationScheduleEntry,
  useDeleteRotationScheduleEntry,
} from '@/hooks/useApi'
import { useSeason } from '@/contexts/SeasonContext'
import { ROTATION_TRACK_NAMES, ROTATION_SERIES_INDICES } from '@/lib/track-rotation-constants'
import type { TrackRotationSet, RotationSeriesData, RotationTrackEntry } from '@/types/database'
import { cn } from '@/lib/utils'

const WEATHER_OPTIONS = ['dry', 'wet', 'mixed'] as const

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function isCurrentEntry(startDate: string, endDate: string): boolean {
  const today = getTodayDate()
  return today >= startDate && today <= endDate
}

// ── Rotation Set Editor ───────────────────────────────────────────────────────

function RotationSetEditor({
  rotationSet,
  onClose,
}: {
  rotationSet: TrackRotationSet
  onClose: () => void
}) {
  const toast = useToast()
  const updateSet = useUpdateRotationSet()

  // Deep-clone for local editing
  const [draft, setDraft] = useState<RotationSeriesData>(() => {
    const result: RotationSeriesData = {}
    for (const idx of ROTATION_SERIES_INDICES) {
      const key = String(idx)
      const existing = rotationSet.series_data[key] ?? []
      // ensure 4 rows
      result[key] = Array.from({ length: 4 }, (_, i) => ({
        track: existing[i]?.track ?? ROTATION_TRACK_NAMES[0],
        weather: existing[i]?.weather ?? 'dry',
      }))
    }
    return result
  })

  function setEntry(seriesKey: string, rowIdx: number, field: keyof RotationTrackEntry, value: string) {
    setDraft((prev) => {
      const rows = [...(prev[seriesKey] ?? [])]
      rows[rowIdx] = { ...rows[rowIdx], [field]: value } as RotationTrackEntry
      return { ...prev, [seriesKey]: rows }
    })
  }

  async function handleSave() {
    try {
      await updateSet.mutateAsync({ id: rotationSet.id, series_data: draft })
      toast.addToast('Rotation set saved', 'success')
      onClose()
    } catch {
      toast.addToast('Failed to save rotation set', 'error')
    }
  }

  return (
    <div className="mt-4 space-y-6">
      {ROTATION_SERIES_INDICES.map((idx) => {
        const key = String(idx)
        const rows = draft[key] ?? []
        return (
          <div key={idx}>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Series {idx + 1}</h4>
            <div className="space-y-2">
              {rows.map((entry, rowIdx) => (
                <div key={rowIdx} className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400 w-4">{rowIdx + 1}</span>
                  <select
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                    value={entry.track}
                    onChange={(e) => setEntry(key, rowIdx, 'track', e.target.value)}
                  >
                    {ROTATION_TRACK_NAMES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    value={entry.weather}
                    onChange={(e) => setEntry(key, rowIdx, 'weather', e.target.value)}
                  >
                    {WEATHER_OPTIONS.map((w) => (
                      <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={handleSave} disabled={updateSet.isPending}>
          {updateSet.isPending ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ── Add / Edit Schedule Entry Form ────────────────────────────────────────────

function ScheduleEntryForm({
  sets,
  seasons,
  initial,
  onSave,
  onCancel,
  isLoading,
}: {
  sets: TrackRotationSet[]
  seasons: { id: string; name: string }[]
  initial?: { rotation_set_id: string; season_id?: string | null; start_date: string; end_date: string }
  onSave: (data: { rotation_set_id: string; season_id: string | null; start_date: string; end_date: string }) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [rotationSetId, setRotationSetId] = useState(initial?.rotation_set_id ?? sets[0]?.id ?? '')
  const [seasonId, setSeasonId] = useState<string>(initial?.season_id ?? '')
  const [startDate, setStartDate] = useState(initial?.start_date ?? '')
  const [endDate, setEndDate] = useState(initial?.end_date ?? '')

  return (
    <div className="flex flex-wrap gap-3 items-end p-4 bg-gray-50 rounded-lg border">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Season</label>
        <select
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          value={seasonId}
          onChange={(e) => setSeasonId(e.target.value)}
        >
          <option value="">— None —</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Set</label>
        <select
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          value={rotationSetId}
          onChange={(e) => setRotationSetId(e.target.value)}
        >
          {sets.map((s) => (
            <option key={s.id} value={s.id}>Set {s.set_number}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Start date</label>
        <input
          type="date"
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">End date</label>
        <input
          type="date"
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onSave({ rotation_set_id: rotationSetId, season_id: seasonId || null, start_date: startDate, end_date: endDate })}
          disabled={isLoading || !rotationSetId || !startDate || !endDate}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

// ── Main admin page ───────────────────────────────────────────────────────────

export default function AdminTrackRotationsPage() {
  const toast = useToast()
  const [expandedSet, setExpandedSet] = useState<string | null>(null)
  const [showAddSchedule, setShowAddSchedule] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)

  const { seasons } = useSeason()
  const { data: setsData, isLoading: setsLoading } = useAdminRotationSets()
  const { data: scheduleData, isLoading: scheduleLoading } = useAdminRotationSchedule()
  const createEntry = useCreateRotationScheduleEntry()
  const updateEntry = useUpdateRotationScheduleEntry()
  const deleteEntry = useDeleteRotationScheduleEntry()

  const sets = setsData?.data ?? []
  const schedule = scheduleData?.data ?? []

  async function handleCreateEntry(data: { rotation_set_id: string; season_id: string | null; start_date: string; end_date: string }) {
    try {
      await createEntry.mutateAsync(data)
      toast.addToast('Schedule entry added', 'success')
      setShowAddSchedule(false)
    } catch {
      toast.addToast('Failed to add schedule entry', 'error')
    }
  }

  async function handleUpdateEntry(id: string, data: { rotation_set_id: string; season_id: string | null; start_date: string; end_date: string }) {
    try {
      await updateEntry.mutateAsync({ id, data })
      toast.addToast('Schedule entry updated', 'success')
      setEditingScheduleId(null)
    } catch {
      toast.addToast('Failed to update schedule entry', 'error')
    }
  }

  async function handleDeleteEntry(id: string) {
    if (!confirm('Delete this schedule entry?')) return
    try {
      await deleteEntry.mutateAsync(id)
      toast.addToast('Schedule entry deleted', 'success')
    } catch {
      toast.addToast('Failed to delete schedule entry', 'error')
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Track Rotations — Admin</h1>
          <p className="mt-2 text-gray-600">Manage rotation sets and the schedule.</p>
        </div>

        {/* Rotation Sets */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rotation Sets</h2>
          {setsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
            </div>
          ) : (
            <div className="space-y-3">
              {sets.map((rotSet) => (
                <Card key={rotSet.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Set {rotSet.set_number}</p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        {ROTATION_SERIES_INDICES.map((idx) => {
                          const tracks = rotSet.series_data[String(idx)] ?? []
                          return (
                            <span key={idx}>
                              S{idx + 1}: {tracks.map((t) => t.track).join(', ')}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedSet(expandedSet === rotSet.id ? null : rotSet.id)}
                    >
                      {expandedSet === rotSet.id ? 'Close' : 'Edit'}
                    </Button>
                  </div>
                  {expandedSet === rotSet.id && (
                    <RotationSetEditor
                      rotationSet={rotSet}
                      onClose={() => setExpandedSet(null)}
                    />
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Schedule */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Schedule</h2>
            <Button size="sm" onClick={() => setShowAddSchedule(true)} disabled={showAddSchedule}>
              + Add Entry
            </Button>
          </div>

          {showAddSchedule && (
            <div className="mb-4">
              <ScheduleEntryForm
                sets={sets}
                seasons={seasons}
                onSave={handleCreateEntry}
                onCancel={() => setShowAddSchedule(false)}
                isLoading={createEntry.isPending}
              />
            </div>
          )}

          {scheduleLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Season</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Set</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Start</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">End</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {schedule.map((entry) => {
                      const current = isCurrentEntry(entry.start_date, entry.end_date)
                      const editing = editingScheduleId === entry.id
                      return (
                        <React.Fragment key={entry.id}>
                          <tr className={cn('hover:bg-gray-50', current && 'bg-blue-50 hover:bg-blue-50')}>
                            <td className="px-4 py-2.5 text-sm text-gray-600">
                              {entry.season_id ? (seasons.find(s => s.id === entry.season_id)?.name ?? '—') : '—'}
                            </td>
                            <td className="px-4 py-2.5 font-medium">Set {entry.rotation_set_number}</td>
                            <td className="px-4 py-2.5 tabular-nums">{entry.start_date}</td>
                            <td className="px-4 py-2.5 tabular-nums">{entry.end_date}</td>
                            <td className="px-4 py-2.5">
                              {current && <Badge variant="success" size="sm">Current</Badge>}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingScheduleId(editing ? null : entry.id)}
                                >
                                  {editing ? 'Cancel' : 'Edit'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  disabled={deleteEntry.isPending}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {editing && (
                            <tr>
                              <td colSpan={5} className="px-4 pb-3">
                                <ScheduleEntryForm
                                  sets={sets}
                                  seasons={seasons}
                                  initial={{
                                    rotation_set_id: entry.rotation_set_id,
                                    season_id: entry.season_id,
                                    start_date: entry.start_date,
                                    end_date: entry.end_date,
                                  }}
                                  onSave={(data) => handleUpdateEntry(entry.id, data)}
                                  onCancel={() => setEditingScheduleId(null)}
                                  isLoading={updateEntry.isPending}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </section>
      </div>
    </ProtectedRoute>
  )
}
