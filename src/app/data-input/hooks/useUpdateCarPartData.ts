import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthHeaders } from '@/hooks/useApi';

interface UpdateCarPartDataParams {
  carPartId: string;
  data: { level?: number; card_count?: number };
}

/**
 * Custom mutation hook for updating car part data.
 * Handles API calls to update car part level and card count,
 * and invalidates relevant queries on success.
 */
export const useUpdateCarPartData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ carPartId, data }: UpdateCarPartDataParams) => {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/car-parts/${carPartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update car part data');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch user car parts
      queryClient.invalidateQueries({ queryKey: ['user-car-parts'] });
    },
  });
};