'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useSeason } from '@/contexts/SeasonContext'

export function NewSeasonModal() {
  const { showNewSeasonModal, activeSeason, dismissNewSeasonModal } = useSeason()

  if (!showNewSeasonModal || !activeSeason) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">New Season Started!</h2>
        <p className="text-gray-600 mb-1">
          <strong>{activeSeason.name}</strong> is now the active season.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Head to your profile to switch seasons or explore the new season data.
        </p>
        <div className="flex justify-end">
          <Button onClick={dismissNewSeasonModal}>Got it</Button>
        </div>
      </Card>
    </div>
  )
}
