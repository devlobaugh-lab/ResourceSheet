'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface CustomDriverFormProps {
  onSubmit: (data: {
    name: string
    overtaking: number
    blocking: number
    qualifying: number
    tyre_use: number
    race_start: number
    car_parts: {
      speed: number
      cornering: number
      powerUnit: number
      qualifying: number
      pitStopTime: number
      drs: number
    }
  }) => void
  onCancel: () => void
  isLoading?: boolean
  initialValues?: {
    name?: string
    overtaking?: number
    blocking?: number
    qualifying?: number
    tyre_use?: number
    race_start?: number
    car_parts?: {
      speed: number
      cornering: number
      powerUnit: number
      qualifying: number
      pitStopTime: number
      drs: number
    }
  }
}

export function CustomDriverForm({ onSubmit, onCancel, isLoading, initialValues }: CustomDriverFormProps) {
  const [formData, setFormData] = useState({
    name: initialValues?.name || '',
    // Driver stats
    overtaking: initialValues?.overtaking || 0,
    blocking: initialValues?.blocking || 0,
    qualifying: initialValues?.qualifying || 0,
    tyre_use: initialValues?.tyre_use || 0,
    race_start: initialValues?.race_start || 0,
    // Car part stats (consolidated)
    cp_speed: initialValues?.car_parts?.speed || 0,
    cp_cornering: initialValues?.car_parts?.cornering || 0,
    cp_powerUnit: initialValues?.car_parts?.powerUnit || 0,
    cp_qualifying: initialValues?.car_parts?.qualifying || 0,
    cp_pitStopTime: initialValues?.car_parts?.pitStopTime || 0,
    cp_drs: initialValues?.car_parts?.drs || 0
  })
  
  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'name' ? parseFloat(value) || 0 : value
    }))
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      overtaking: formData.overtaking,
      blocking: formData.blocking,
      qualifying: formData.qualifying,
      tyre_use: formData.tyre_use,
      race_start: formData.race_start,
      car_parts: {
        speed: formData.cp_speed,
        cornering: formData.cp_cornering,
        powerUnit: formData.cp_powerUnit,
        qualifying: formData.cp_qualifying,
        pitStopTime: formData.cp_pitStopTime,
        drs: formData.cp_drs
      }
    })
  }
  
  const driverStatFields = [
    { key: 'overtaking', label: 'OVT' },
    { key: 'blocking', label: 'DEF' },
    { key: 'qualifying', label: 'QLY' },
    { key: 'tyre_use', label: 'TYR' },
    { key: 'race_start', label: 'RST' }
  ]
  
  const carPartFields = [
    { key: 'cp_speed', label: 'SPD' },
    { key: 'cp_cornering', label: 'CRN' },
    { key: 'cp_powerUnit', label: 'PWR' },
    { key: 'cp_qualifying', label: 'QLY' },
    { key: 'cp_pitStopTime', label: 'PIT', decimal: true },
    { key: 'cp_drs', label: 'DRS' }
  ]
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Driver Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Driver Name *
        </label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter driver name"
          required
          maxLength={100}
        />
      </div>
      
      {/* Driver Stats */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Driver Stats</h4>
        <div className="grid grid-cols-5 gap-2">
          {driverStatFields.map(field => (
            <div key={field.key}>
              <label className="block text-xs text-gray-600 mb-1 text-center">
                {field.label}
              </label>
              <Input
                type="number"
                min={0}
                max={999}
                value={formData[field.key as keyof typeof formData] as number}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="text-center"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Car Part Stats */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Car Part Stats (Total)</h4>
        <div className="grid grid-cols-6 gap-2">
          {carPartFields.map(field => (
            <div key={field.key}>
              <label className="block text-xs text-gray-600 mb-1 text-center">
                {field.label}
              </label>
              <Input
                type="number"
                min={0}
                max={999}
                step={field.decimal ? 0.01 : 1}
                value={formData[field.key as keyof typeof formData] as number}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="text-center"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.name.trim()}>
          {isLoading ? 'Creating...' : 'Create Driver'}
        </Button>
      </div>
    </form>
  )
}