import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthHeaders } from '@/hooks/useApi';

interface UpdateBoostDataParams {
  boostId: string;
  data: { card_count: number };
}

/**
 * Custom mutation hook for updating boost data.
 * Handles API calls to update boost card count,
 * and invalidates relevant queries on success.
 */
export const useUpdateBoostData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boostId, data }: UpdateBoostDataParams) => {
      console.log('🔄 Starting boost update for:', boostId, data);
      const authHeaders = await getAuthHeaders();
      console.log('🔑 Auth headers:', Object.keys(authHeaders));

      const response = await fetch(`/api/boosts/${boostId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      });

      console.log('📡 API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`Failed to update boost data: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ API success response:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('🎉 Mutation success, invalidating queries for:', variables.boostId, variables.data.card_count);

      // Invalidate both boost-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['user-boosts'] });
      queryClient.invalidateQueries({ queryKey: ['boosts'] });
    },
    onError: (error, variables) => {
      console.error('💥 Mutation failed for boost:', variables.boostId, error);
    },
  });
};