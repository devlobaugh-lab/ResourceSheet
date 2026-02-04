'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from './ui/Input'

interface EditableSelectProps {
  value: string
  options: { value: string; label: string }[]
  placeholder?: string
  onSave: (value: string) => void
  className?: string
  disabled?: boolean
}

export function EditableSelect({ 
  value, 
  options, 
  placeholder, 
  onSave, 
  className = '',
  disabled = false 
}: EditableSelectProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && selectRef.current) {
      // Focus the select trigger
      const trigger = selectRef.current.querySelector('select')
      if (trigger) {
        (trigger as HTMLElement).focus()
      }
    }
  }, [isEditing])

  const handleSave = () => {
    setIsEditing(false)
    if (editValue !== value) {
      onSave(editValue)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true)
    }
  }

  const handleSelect = (selectedValue: string) => {
    setEditValue(selectedValue)
    handleSave()
  }

  const handleBlur = () => {
    // Only save if we're not clicking on another select
    setTimeout(() => {
      if (!selectRef.current?.contains(document.activeElement)) {
        handleSave()
      }
    }, 100)
  }

  if (isEditing) {
    return (
      <div ref={selectRef}>
        <select 
          value={editValue} 
          onChange={(e) => handleSelect(e.target.value)}
          onBlur={handleBlur}
          className={`p-1 border rounded ${className}`}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  const selectedLabel = options.find(opt => opt.value === value)?.label

  return (
    <div
      className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
    >
      {selectedLabel || (placeholder ? <span className="text-gray-400">{placeholder}</span> : <span className="text-gray-400">Click to edit</span>)}
    </div>
  )
}
