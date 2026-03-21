'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useCurrentTrackRotation, useTrackRotationSchedule } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import type { RotationTrackEntryWithInfo } from '@/types/database'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const statDisplayNames: Record<string, string> = {
  tyreUse: 'Tyre Management',
  overtaking: 'Overtaking',
  defending: 'Defending',
  raceStart: 'Race Start',
  speed: 'Speed',
  cornering: 'Cornering',
  powerUnit: 'Power Unit',
  none: 'None',
}

const weatherLabel: Record<string, string> = {
  dry: 'Dry',
  wet: 'Wet',
  mixed: 'Mixed',
}

const weatherClass: Record<string, string> = {
  dry: 'text-amber-600',
  wet: 'text-blue-600',
  mixed: 'text-gray-500',
}

function formatStat(stat: string | undefined): string {
  if (!stat) return '—'
  return statDisplayNames[stat] || stat
}

function RotationSeriesCard({
  seriesNumber,
  tracks,
}: {
  seriesNumber: number
  tracks: RotationTrackEntryWithInfo[]
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-xl w-6 flex-shrink-0">
            {isExpanded ? '▼' : '▶'}
          </span>
          <h2 className="text-lg font-semibold text-gray-900">Series {seriesNumber}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Tracks:</span>
            <span className="font-medium text-gray-900">
              {tracks.map((t) => t.track).join(', ')}
            </span>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Track
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Weather
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Laps
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Driver Stat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Car Stat
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tracks.map((entry, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.track}
                  </td>
                  <td className={cn('px-6 py-4 whitespace-nowrap text-sm', weatherClass[entry.weather])}>
                    {weatherLabel[entry.weather] ?? entry.weather}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.laps ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatStat(entry.driver_track_stat)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatStat(entry.car_track_stat)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const startStr = start.toLocaleDateString('en-US', opts)
  const endStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })
  return `${startStr} – ${endStr}`
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  return date >= startDate && date <= endDate
}

export default function TrackRotationsPage() {
  const today = getTodayDate()
  const [viewDate, setViewDate] = useState(today)

  const { data: scheduleData, isLoading: scheduleLoading } = useTrackRotationSchedule()
  const schedule = useMemo(() => scheduleData?.data ?? [], [scheduleData])

  const currentIndex = useMemo(() => {
    const matches = schedule
      .map((entry, idx) => ({ entry, idx }))
      .filter(({ entry }) => isDateInRange(viewDate, entry.start_date, entry.end_date))
    if (matches.length === 0) return -1
    return matches.reduce((best, curr) =>
      curr.entry.start_date > best.entry.start_date ? curr : best
    ).idx
  }, [schedule, viewDate])

  const currentEntry = currentIndex >= 0 ? schedule[currentIndex] : null
  const queryDate = currentEntry?.start_date ?? viewDate

  const { data: rotationView, isLoading: rotationLoading } = useCurrentTrackRotation(queryDate)

  const isCurrentRotation = useMemo(() => {
    if (!currentEntry) return false
    return isDateInRange(today, currentEntry.start_date, currentEntry.end_date)
  }, [currentEntry, today])

  const todayIndex = useMemo(() => {
    const matches = schedule
      .map((entry, idx) => ({ entry, idx }))
      .filter(({ entry }) => isDateInRange(today, entry.start_date, entry.end_date))
    if (matches.length === 0) return -1
    return matches.reduce((best, curr) =>
      curr.entry.start_date > best.entry.start_date ? curr : best
    ).idx
  }, [schedule, today])

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < schedule.length - 1
  const rotationNumber = currentIndex + 1

  function goToPrev() {
    if (!canGoPrev) return
    setViewDate(schedule[currentIndex - 1].start_date)
  }

  function goToNext() {
    if (!canGoNext) return
    setViewDate(schedule[currentIndex + 1].start_date)
  }

  const isLoading = scheduleLoading || rotationLoading

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Track Rotations</h1>
          <p className="mt-2 text-gray-600">
            Series 10–12 rotate tracks every two weeks on Wednesdays.
          </p>
        </div>

        {/* Navigator */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrev}
            disabled={!canGoPrev || isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            {currentEntry ? (
              <>
                <p className="font-semibold text-gray-900">Rotation {rotationNumber}</p>
                <p className="text-sm text-gray-500">
                  {formatDateRange(currentEntry.start_date, currentEntry.end_date)}
                </p>
              </>
            ) : isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <p className="text-gray-500">No rotation found</p>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={!canGoNext || isLoading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Not-current rotation banner */}
        {!isCurrentRotation && currentEntry && (
          <div className="mb-4 px-4 py-3 rounded-lg border bg-amber-50 border-amber-200 text-amber-800 text-sm">
            Viewing rotation {rotationNumber} — not the current rotation.{' '}
            {todayIndex >= 0 && (
              <button
                onClick={() => setViewDate(today)}
                className="underline hover:text-amber-900 font-medium"
              >
                Go to current rotation
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : rotationView ? (
          <div className="space-y-4">
            {[...rotationView.series].reverse().map((s) => (
              <RotationSeriesCard
                key={s.series_index}
                seriesNumber={s.series_number}
                tracks={s.tracks}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-gray-500">
            No rotation data available.
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
