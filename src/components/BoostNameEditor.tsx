'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/auth/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { getAuthHeaders } from '@/hooks/useApi'

interface BoostNameEditorProps {
  boostId: string
  currentName: string
  icon?: string
  customName?: string | null
  onNameChange: (newName: string | null) => void
  className?: string
}

export function BoostNameEditor({
  boostId,
  currentName,
  icon,
  customName,
  onNameChange,
  className = ''
}: BoostNameEditorProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(customName || '')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check if user is admin by checking the profile (user should have is_admin set)
  const isAdmin = user?.email === 'thomas.lobaugh@gmail.com' || false

  // Display name logic: custom_name || icon name || current name
  const displayName = customName || (icon ? icon.replace('BoostIcon_', '') : currentName)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const startEditing = () => {
    if (!isAdmin) {
      addToast('Admin access required to edit boost names', 'error')
      return
    }
    setEditValue(customName || '')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditValue(customName || '')
  }

  const validateName = (name: string): { valid: boolean; error?: string } => {
    const trimmed = name.trim()

    // Empty/whitespace-only treated as deletion
    if (trimmed.length === 0) return { valid: true }

    // Check for leading/trailing spaces
    if (name !== name.trim()) {
      return { valid: false, error: 'Name cannot start or end with spaces' }
    }

    // Character validation: A-Z, a-z, 0-9, -, ., spaces
    if (!/^[A-Za-z0-9\.\-\s]+$/.test(trimmed)) {
      return { valid: false, error: 'Only letters, numbers, hyphens, periods, and spaces allowed' }
    }

    // Length validation
    if (trimmed.length > 64) {
      return { valid: false, error: 'Maximum 64 characters' }
    }

    return { valid: true }
  }

  const saveName = async () => {
    const trimmedValue = editValue.trim()

    // If empty/whitespace, treat as deletion
    if (trimmedValue.length === 0) {
      await deleteCustomName()
      return
    }

    // Validate the name
    const validation = validateName(editValue)
    if (!validation.valid) {
      addToast(`Invalid name: ${validation.error}`, 'error')
      return
    }

    setIsLoading(true)
    try {
      // Get authentication headers
      const authHeaders = await getAuthHeaders()

      const response = await fetch(`/api/boosts/${boostId}/custom-name`, {
        method: 'PUT',
        headers: authHeaders,
        credentials: 'same-origin',
        body: JSON.stringify({ custom_name: trimmedValue }),
      })

      const data = await response.json()

      if (response.ok) {
        onNameChange(trimmedValue)
        setIsEditing(false)
        addToast('Boost name updated successfully', 'success')
      } else {
        // Handle duplicate name error
        if (response.status === 409) {
          addToast('This custom name is already used by another boost', 'error')
        } else {
          addToast(data.error || 'Failed to update boost name', 'error')
        }
      }
    } catch (error) {
      console.error('Error saving boost name:', error)
      addToast('Failed to update boost name', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCustomName = async () => {
    setIsLoading(true)
    try {
      // Get authentication headers
      const authHeaders = await getAuthHeaders()

      const response = await fetch(`/api/boosts/${boostId}/custom-name`, {
        method: 'DELETE',
        headers: authHeaders,
        credentials: 'same-origin',
      })

      if (response.ok) {
        onNameChange(null)
        setIsEditing(false)
        addToast('Custom name removed, now using default name', 'success')
      } else {
        const data = await response.json()
        addToast(data.error || 'Failed to remove custom name', 'error')
      }
    } catch (error) {
      console.error('Error deleting custom name:', error)
      addToast('Failed to remove custom name', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveName()
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  if (isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter custom name..."
          disabled={isLoading}
          maxLength={64}
        />
        <Button
          size="sm"
          variant="primary"
          onClick={saveName}
          disabled={isLoading}
          className="px-2 py-1"
        >
          {isLoading ? '...' : 'Save'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={cancelEditing}
          disabled={isLoading}
          className="px-2 py-1"
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded transition-colors ${className}`}
      onClick={startEditing}
      title={isAdmin ? 'Click to edit boost name' : 'Admin access required'}
    >
      <span className="text-sm font-medium text-gray-900">
        {displayName}
      </span>
    </div>
  )
}
