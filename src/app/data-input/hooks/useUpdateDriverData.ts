import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthHeaders } from '@/hooks/useApi';

interface UpdateDriverDataParams {
  driverId: string;
  data: { level?: number; card_count?: number };
}

/**
 * Custom mutation hook for updating driver data.
 * Handles API calls to update driver level and card count,
 * and invalidates relevant queries on success.
 */
export const useUpdateDriverData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, data }: UpdateDriverDataParams) => {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver data');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch user drivers
      queryClient.invalidateQueries({ queryKey: ['user-drivers'] });
    },
  });
};