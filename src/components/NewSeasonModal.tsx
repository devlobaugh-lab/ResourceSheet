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
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">A New Season Has Started!</h2>
        {/* <p className="text-gray-600 mb-1">
          <strong>{activeSeason.name}</strong> is now the active season.
        </p> */}
        <p className="text-normal text-gray-700 mb-6">
          Everything but your boosts are reset. Time to start racing and climb the ranks again!
        </p>
        <p className="text-normal text-gray-600">
          Note: If you want to see any data from the previous season, you can change the season shown in your profile. 
        </p>
        <br />
        <div className="flex justify-end">
          <Button onClick={dismissNewSeasonModal}>Got it</Button>
        </div>
      </Card>
    </div>
  )
}
