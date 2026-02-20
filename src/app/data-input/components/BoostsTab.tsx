'use client';

import React, { useCallback } from 'react';
import { useBoosts, useUserBoosts } from '@/hooks/useApi';
import { BoostWithCustomName } from '@/types/database';
import { useUpdateBoostData } from '../hooks/useUpdateBoostData';
import { sortBoosts } from '../utils/sorting';

/** Local interface for boost with card count */
interface BoostItem extends BoostWithCustomName {
  card_count: number;
}

/**
 * BoostsTab component for data input page.
 * Displays a table of boosts with editable card count field.
 */
export function BoostsTab() {
  const { data: boostsResponse, isLoading: boostsLoading } = useBoosts({
    page: 1,
    limit: 200
  });
  const { data: userBoostsResponse, isLoading: userBoostsLoading } = useUserBoosts({
    page: 1,
    limit: 200
  });
  const updateBoostData = useUpdateBoostData();

  // Merge catalog boosts with user ownership data
  const rawBoosts: BoostItem[] = (boostsResponse?.data || []).map((boost: any) => {
    const userData = (userBoostsResponse?.data || []).find((userBoost: any) => userBoost.id === boost.id);
    const cardCount = userData?.card_count || 0;

    return {
      ...boost,
      custom_name: boost.boost_custom_names?.custom_name || null,
      card_count: cardCount
    };
  });

  const sortedBoosts = sortBoosts(rawBoosts);

  const handleSave = useCallback(async (boostId: string, value: number) => {
    try {
      await updateBoostData.mutateAsync({ boostId, data: { card_count: value } });
    } catch (error) {
      console.error('Failed to save boost data:', error);
    }
  }, [updateBoostData]);

  if (boostsLoading || userBoostsLoading) {
    return <div className="text-center py-8">Loading boosts...</div>;
  }

  return (
    <div className="overflow-auto bg-white rounded-lg border border-gray-200 w-fit max-h-[73vh]">
      <table className="table divide-y divide-gray-200">
        <thead className="bg-gray-700 sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Boost Display Name
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedBoosts.map((boost) => (
            <tr key={boost.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-3 py-1 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">
                    {boost.custom_name || boost.icon?.replace('BoostIcon_', '') || boost.name}
                  </div>
                </div>
              </td>
              <td className="px-3 py-1 whitespace-nowrap text-center">
                <input
                  key={`boost-count-${boost.id}-${boost.card_count}`}
                  type="number"
                  min={0}
                  defaultValue={boost.card_count || 0}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value !== (boost.card_count || 0)) {
                      handleSave(boost.id, value);
                    }
                    e.target.value = value.toString();
                  }}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}