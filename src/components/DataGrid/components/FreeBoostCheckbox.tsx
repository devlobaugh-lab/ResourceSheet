'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthHeaders } from '@/hooks/useApi';

interface FreeBoostCheckboxProps {
  boostId: string;
  isFree: boolean;
}

/**
 * Free Boost Checkbox Component - Admin only.
 * Allows admin users to mark boosts as free.
 */
export function FreeBoostCheckbox({ boostId, isFree }: FreeBoostCheckboxProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch user profile to check admin status
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/profiles/${user.id}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  // Check if user is admin via profile
  const isAdmin = profile?.is_admin === true || profile?.user_type === 'admin';

  const handleToggle = async () => {
    if (!isAdmin) {
      addToast('Admin access required to modify boost free status', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/boosts/${boostId}`, {
        method: 'PATCH',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ is_free: !isFree }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update boost';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          // If response.json() fails (empty response), use default message
          console.warn('Could not parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Invalidate boosts queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['boosts'] });

      addToast(`Boost ${!isFree ? 'marked as free' : 'unmarked as free'}`, 'success');
    } catch (error) {
      console.error('Error updating boost free status:', error);
      addToast(error instanceof Error ? error.message : 'Failed to update boost free status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <input
      type="checkbox"
      checked={isFree}
      onChange={handleToggle}
      disabled={!isAdmin || isUpdating}
      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
      title={isAdmin ? 'Admin only: Mark as free boost' : 'Admin access required'}
    />
  );
}