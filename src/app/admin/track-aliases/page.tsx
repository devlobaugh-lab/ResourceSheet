'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuthHeaders } from '@/hooks/useApi'
import { useToast } from '@/components/ui/Toast'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

interface TrackNameAlias {
  id: string
  system_name: string
  display_name: string
  created_at: string
  updated_at: string
}

export default function TrackAliasesAdminPage() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  
  const [showModal, setShowModal] = useState(false)
  const [editingAlias, setEditingAlias] = useState<TrackNameAlias | null>(null)
  const [formData, setFormData] = useState({ system_name: '', display_name: '' })
  
  // Fetch aliases
  const { data: aliasesData, isLoading } = useQuery({
    queryKey: ['track-name-aliases'],
    queryFn: async () => {
      const response = await fetch('/api/track-name-aliases', {
        headers: await getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to fetch aliases')
      return response.json()
    }
  })
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: { system_name: string; display_name: string }) => {
      const response = await fetch('/api/track-name-aliases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to create alias')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-name-aliases'] })
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      addToast('Track alias created successfully', 'success')
      closeModal()
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    }
  })
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; system_name: string; display_name: string }) => {
      const response = await fetch('/api/track-name-aliases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to update alias')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-name-aliases'] })
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      addToast('Track alias updated successfully', 'success')
      closeModal()
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    }
  })
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/track-name-aliases?id=${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to delete alias')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track-name-aliases'] })
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      addToast('Track alias deleted successfully', 'success')
    },
    onError: (error: Error) => {
      addToast(error.message, 'error')
    }
  })
  
  const openCreateModal = () => {
    setEditingAlias(null)
    setFormData({ system_name: '', display_name: '' })
    setShowModal(true)
  }
  
  const openEditModal = (alias: TrackNameAlias) => {
    setEditingAlias(alias)
    setFormData({ system_name: alias.system_name, display_name: alias.display_name })
    setShowModal(true)
  }
  
  const closeModal = () => {
    setShowModal(false)
    setEditingAlias(null)
    setFormData({ system_name: '', display_name: '' })
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAlias) {
      updateMutation.mutate({ id: editingAlias.id, ...formData })
    } else {
      createMutation.mutate(formData)
    }
  }
  
  const handleDelete = (alias: TrackNameAlias) => {
    if (confirm(`Delete alias "${alias.system_name}" -> "${alias.display_name}"?`)) {
      deleteMutation.mutate(alias.id)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Track Name Aliases</h1>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Alias
        </Button>
      </div>
      
      <Card className="p-6">
        <p className="text-gray-600 mb-4">
          Track name aliases allow you to define user-friendly names for tracks.
          For example, "Americas" can be displayed as "Austin".
        </p>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : aliasesData?.data?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Display Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {aliasesData.data.map((alias: TrackNameAlias) => (
                  <tr key={alias.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {alias.system_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {alias.display_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(alias)}
                        className="mr-2"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(alias)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No track name aliases configured. Click "Add Alias" to create one.
          </div>
        )}
      </Card>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAlias ? 'Edit Track Alias' : 'Add Track Alias'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Name *
                </label>
                <Input
                  type="text"
                  value={formData.system_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, system_name: e.target.value }))}
                  placeholder="e.g., Americas"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  The track name used in the game data
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                </label>
                <Input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="e.g., Austin"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  The user-friendly name to display
                </p>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : editingAlias ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}