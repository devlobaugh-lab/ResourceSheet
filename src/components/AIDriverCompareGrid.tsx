'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface AIDriverCompareGridProps {
  data: any[]
  trackName: string
  difficulty: string
}

// Helper function to get stat background color based on value position in range
const getStatBackgroundColor = (value: number, min: number, max: number, median: number): string => {
  if (min === max) return 'bg-white' // All values are the same
  if (value === max) return 'bg-green-400'
  if (value === median) return 'bg-white'
  if (value === min) return 'bg-red-400'

  if (value < median) {
    // Gradient from red-400 to white for values below median
    const ratio = (value - min) / (median - min)
    if (ratio < 0.25) return 'bg-red-400'
    if (ratio < 0.5) return 'bg-red-300'
    if (ratio < 0.75) return 'bg-red-200'
    return 'bg-red-100'
  } else {
    // Gradient from white to green-400 for values above median
    const ratio = (value - median) / (max - median)
    if (ratio < 0.25) return 'bg-green-100'
    if (ratio < 0.5) return 'bg-green-200'
    if (ratio < 0.75) return 'bg-green-300'
    return 'bg-green-400'
  }
}

export function AIDriverCompareGrid({ data, trackName, difficulty }: AIDriverCompareGridProps) {
  const [sortBy, setSortBy] = useState<string>('driver_name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Define columns for the grid
  // Driver stats first, then Qualifying Total, then Car Part stats
  const columns = [
    // Driver columns
    { key: 'driver_name', label: 'Driver', type: 'driver' },
    { key: 'overtaking', label: 'OVT', type: 'driver' },
    { key: 'blocking', label: 'DEF', type: 'driver' },
    { key: 'qualifying', label: 'QLY', type: 'driver' },
    { key: 'tyre_use', label: 'TYR', type: 'driver' },
    { key: 'race_start', label: 'RST', type: 'driver' },
    // Qualifying total (driver + parts)
    { key: 'qualifying_total', label: 'Total QLY', type: 'combined' },
    // Car part columns (consolidated)
    { key: 'cp_speed', label: 'SPD', type: 'part' },
    { key: 'cp_cornering', label: 'CRN', type: 'part' },
    { key: 'cp_powerUnit', label: 'PWR', type: 'part' },
    { key: 'cp_qualifying', label: 'QLY', type: 'part' },
    { key: 'cp_pitStopTime', label: 'PIT', type: 'part' },
    { key: 'cp_drs', label: 'DRS', type: 'part' }
  ]
  
  // Calculate column statistics for coloring
  const columnStats = useMemo(() => {
    const stats: Record<string, { min: number; max: number; median: number }> = {}
    const numericColumns = columns.filter(c => c.key !== 'driver_name')
    
    numericColumns.forEach(col => {
      const values = data.map(d => d[col.key]).filter(v => typeof v === 'number').sort((a, b) => a - b)
      if (values.length > 0) {
        stats[col.key] = {
          min: values[0],
          max: values[values.length - 1],
          median: values.length % 2 === 0
            ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
            : values[Math.floor(values.length / 2)]
        }
      }
    })
    
    return stats
  }, [data])
  
  // Sort data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'driver_name') {
        comparison = (a[sortBy] || '').localeCompare(b[sortBy] || '')
      } else {
        comparison = (a[sortBy] || 0) - (b[sortBy] || 0)
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [data, sortBy, sortOrder])
  
  // Handle sort click
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc') // Default to descending for stats
    }
  }
  
  // Get stat cell class
  const getStatCellClass = (value: number, column: string): string => {
    const stats = columnStats[column]
    if (!stats || typeof value !== 'number') return ''
    return getStatBackgroundColor(value, stats.min, stats.max, stats.median)
  }
  
  // Format value for display
  const formatValue = (value: number, column: string): string => {
    if (typeof value !== 'number') return '-'
    // Round pit stop time to 2 decimal places
    if (column === 'cp_pitStopTime') {
      return value.toFixed(2)
    }
    return String(value)
  }
  
  return (
    <div className="space-y-4">
      {/* Grid */}
      <div className="overflow-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-700 sticky top-0 z-10">
            <tr>
              {/* Driver columns with dark header */}
              {columns.filter(c => c.type === 'driver').map(col => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-3 py-2 text-xs font-bold text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-600",
                    col.key === 'driver_name' ? 'text-left' : 'text-center'
                  )}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label} {sortBy === col.key && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              ))}
              {/* Qualifying Total with distinct header styling */}
              {columns.filter(c => c.type === 'combined').map(col => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-3 py-2 text-center text-xs font-bold text-yellow-200 uppercase tracking-wider cursor-pointer hover:bg-gray-600 bg-gray-800"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label} {sortBy === col.key && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              ))}
              {/* Car part columns */}
              {columns.filter(c => c.type === 'part').map(col => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-3 py-2 text-center text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label} {sortBy === col.key && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'hover:bg-gray-50 transition-colors',
                  row.is_custom && 'bg-blue-50'
                )}
              >
                {/* Driver columns */}
                {columns.filter(c => c.type === 'driver').map(col => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-2 whitespace-nowrap text-sm",
                      col.key === 'driver_name' 
                        ? 'font-medium text-gray-900 text-left'
                        : cn('text-center font-medium', getStatCellClass(row[col.key], col.key))
                    )}
                  >
                    {col.key === 'driver_name' ? (
                      <>
                        {row[col.key]}
                        {row.is_custom && (
                          <span className="ml-2 text-xs text-blue-600">(Custom)</span>
                        )}
                      </>
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
                {/* Qualifying Total with color coding */}
                {columns.filter(c => c.type === 'combined').map(col => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-2 whitespace-nowrap text-center text-sm font-bold",
                      getStatCellClass(row[col.key], col.key)
                    )}
                  >
                    {row[col.key]}
                  </td>
                ))}
                {/* Car part columns */}
                {columns.filter(c => c.type === 'part').map(col => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-2 whitespace-nowrap text-center text-sm font-medium",
                      getStatCellClass(row[col.key], col.key)
                    )}
                  >
                    {formatValue(row[col.key], col.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Empty State */}
        {sortedData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>
      
      {/* Stats Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span>Color Scale:</span>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 bg-red-400 rounded"></span>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 bg-white border border-gray-300 rounded"></span>
          <span>Median</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 bg-green-400 rounded"></span>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}