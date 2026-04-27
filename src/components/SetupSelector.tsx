'use client'

import React, { useState, useMemo } from 'react'
import { CarPartView, UserCarSetup } from '@/types/database'
import { SetupPreviewPanel } from './SetupPreviewPanel'
import { CarPartSelectionGrid } from './CarPartSelectionGrid'
import { useCreateSetup } from '@/hooks/useApi'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

const PART_TYPES = [
  { key: 'front_wing', type: 4, label: 'Front Wing' },
  { key: 'brake', type: 1, label: 'Brake' },
  { key: 'suspension', type: 3, label: 'Suspension' },
  { key: 'rear_wing', type: 5, label: 'Rear Wing' },
  { key: 'gearbox', type: 0, label: 'Gearbox' },
  { key: 'engine', type: 2, label: 'Engine' },
] as const

interface SetupSelectorProps {
  setups: UserCarSetup[]
  selectedSetupId: string | null | undefined
  allCarParts: CarPartView[]
  onSelect: (id: string | null) => void
  seriesFilter?: number
}

type Mode = 'display' | 'select' | 'create'

export function SetupSelector({
  setups,
  selectedSetupId,
  allCarParts,
  onSelect,
  seriesFilter = 12,
}: SetupSelectorProps) {
  const [mode, setMode] = useState<Mode>('display')
  const [partModal, setPartModal] = useState<{ open: boolean; partKey: string; partType: number } | null>(null)
  const [newSetupName, setNewSetupName] = useState('')
  const [selectedParts, setSelectedParts] = useState<Record<string, string>>({
    brake: '', gearbox: '', rear_wing: '', front_wing: '', suspension: '', engine: '',
  })

  const createSetup = useCreateSetup()

  const selectedSetup = useMemo(
    () => setups.find((s) => s.id === selectedSetupId) ?? null,
    [setups, selectedSetupId]
  )

  async function handleCreate() {
    if (!newSetupName.trim()) return
    try {
      const result = await createSetup.mutateAsync({
        name: newSetupName.trim(),
        brake_id: selectedParts.brake || null,
        gearbox_id: selectedParts.gearbox || null,
        rear_wing_id: selectedParts.rear_wing || null,
        front_wing_id: selectedParts.front_wing || null,
        suspension_id: selectedParts.suspension || null,
        engine_id: selectedParts.engine || null,
        series_filter: seriesFilter,
      })
      onSelect(result.id ?? result.data?.id ?? null)
      setMode('display')
      setNewSetupName('')
      setSelectedParts({ brake: '', gearbox: '', rear_wing: '', front_wing: '', suspension: '', engine: '' })
    } catch (e) {
      console.error('Failed to create setup', e)
    }
  }

  function handleSelectChange(value: string) {
    if (value === '__create__') {
      setMode('create')
      return
    }
    if (value === '__none__') {
      onSelect(null)
    } else {
      onSelect(value)
    }
    setMode('display')
  }

  if (mode === 'create') {
    return (
      <div className="border border-gray-200 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">New Setup</span>
          <button
            onClick={() => { setMode('display'); setNewSetupName(''); setSelectedParts({ brake: '', gearbox: '', rear_wing: '', front_wing: '', suspension: '', engine: '' }) }}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
        <Input
          placeholder="Setup name"
          value={newSetupName}
          onChange={(e) => setNewSetupName(e.target.value)}
          className="text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          {PART_TYPES.map(({ key, label }) => {
            const partId = selectedParts[key]
            const part = allCarParts.find((p) => p.id === partId)
            return (
              <button
                key={key}
                onClick={() => setPartModal({ open: true, partKey: key, partType: PART_TYPES.find((p) => p.key === key)!.type })}
                className="px-2 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left truncate"
              >
                <span className="text-gray-500">{label}: </span>
                <span className="text-gray-900">{part?.name ?? '—'}</span>
              </button>
            )
          })}
        </div>
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={!newSetupName.trim() || createSetup.isPending}
        >
          {createSetup.isPending ? 'Saving…' : 'Save Setup'}
        </Button>

        {/* Part selection modal */}
        {partModal?.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  Select {PART_TYPES.find((p) => p.key === partModal.partKey)?.label}
                </h3>
                <button onClick={() => setPartModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>
              <CarPartSelectionGrid
                parts={allCarParts}
                partType={partModal.partType}
                selectedPartId={selectedParts[partModal.partKey]}
                onPartSelect={(id) => {
                  const key = partModal.partKey
                  setSelectedParts((prev) => ({ ...prev, [key]: id }))
                  setPartModal(null)
                }}
                bonusCheckedItems={new Set()}
                onBonusToggle={() => {}}
                bonusPercentage=""
                initialMaxSeries={seriesFilter}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (mode === 'select') {
    return (
      <div className="border border-gray-200 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Select Setup</span>
          <button onClick={() => setMode('display')} className="text-xs text-gray-500 hover:text-gray-700">
            Cancel
          </button>
        </div>
        <select
          className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={selectedSetupId ?? '__none__'}
          onChange={(e) => handleSelectChange(e.target.value)}
        >
          <option value="__none__">— No setup —</option>
          {setups.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value="__create__">+ Create new setup…</option>
        </select>
      </div>
    )
  }

  // display mode
  if (!selectedSetup) {
    return (
      <button
        onClick={() => setMode('select')}
        className="w-full text-sm text-blue-600 hover:text-blue-700 border border-dashed border-blue-300 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors"
      >
        + Select Car Setup
      </button>
    )
  }

  return (
    <div>
      <SetupPreviewPanel
        setup={selectedSetup}
        carParts={allCarParts}
        onClose={() => { onSelect(null); setMode('display') }}
      />
    </div>
  )
}
