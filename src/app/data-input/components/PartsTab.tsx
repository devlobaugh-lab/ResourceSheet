'use client';

import React, { useCallback } from 'react';
import { useUserCarParts } from '@/hooks/useApi';
import { CarPartView } from '@/types/database';
import { CarPartStatsPerLevel } from '@/lib/utils';
import { useUpdateCarPartData } from '../hooks/useUpdateCarPartData';
import { sortCarParts } from '../utils/sorting';
import { LEVEL_RANGES, PART_TYPE_NAMES } from '../utils/constants';
import { 
  calculateHighestLevel, 
  getRarityBackground,
  calculateCardsToNextLevel,
  calculateCardsToMaxLevel,
  calculateGoldCostToHighestLevel,
  calculateGoldToNextLevel,
  calculateGoldToMaxLevel,
  formatCompactNumber,
} from '@/lib/utils';

/**
 * PartsTab component for data input page.
 * Displays a table of car parts with editable level and card count fields.
 */
export function PartsTab({ seasonId }: { seasonId?: string }) {
  const { data: partsResponse, isLoading } = useUserCarParts({
    page: 1,
    limit: 200,
    season_id: seasonId,
  });
  const updateCarPartData = useUpdateCarPartData();

  const parts = partsResponse?.data || [];
  const sortedParts = sortCarParts(parts);

  const handleSave = useCallback(async (partId: string, field: 'level' | 'card_count', value: number) => {
    try {
      const data = { [field]: value };
      await updateCarPartData.mutateAsync({ carPartId: partId, data });
    } catch (error) {
      console.error('Failed to save part data:', error);
    }
  }, [updateCarPartData]);

  if (isLoading) {
    return <div className="text-center py-8">Loading parts...</div>;
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="overflow-auto bg-white rounded-lg border border-gray-200 w-fit max-h-[73vh]">
        <table className="table divide-y divide-gray-200">
          <thead className="bg-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Name</th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Rarity</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Part<br/>Type</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">Series</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">Level</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">Amount</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Highest<br/>Level</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Gold<br/>Cost</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Cards<br/>- Next</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Gold<br/>- Next</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Cards<br/>- Max</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Gold<br/>- Max</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedParts.map((part) => {
              const currentLevel = part.level || 0;
              const cardCount = part.card_count || 0;
              const highestLevel = calculateHighestLevel(currentLevel, cardCount, part.rarity);
              const statsPerLevel = part.stats_per_level as CarPartStatsPerLevel[] | undefined;
              
              const goldCost = calculateGoldCostToHighestLevel(currentLevel, highestLevel, statsPerLevel);
              const cardsToNext = calculateCardsToNextLevel(currentLevel, cardCount, highestLevel, part.rarity, statsPerLevel);
              const goldToNext = calculateGoldToNextLevel(highestLevel, part.rarity, statsPerLevel);
              const cardsToMax = calculateCardsToMaxLevel(currentLevel, cardCount, highestLevel, part.rarity, statsPerLevel);
              const goldToMax = calculateGoldToMaxLevel(currentLevel, cardCount, highestLevel, part.rarity, statsPerLevel);
              
              return (
                <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                  <td className={`px-3 py-1 whitespace-nowrap ${getRarityBackground(part.rarity)}`}>
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{part.name}</div>
                    </div>
                  </td>
                  <td className={`px-3 py-1 whitespace-nowrap ${getRarityBackground(part.rarity)}`}>
                    <div className="text-sm font-medium text-gray-900">
                      {part.rarity === 0 ? 'Basic' :
                       part.rarity === 1 ? 'Common' :
                       part.rarity === 2 ? 'Rare' :
                       part.rarity === 3 ? 'Epic' :
                       part.rarity === 4 ? 'Legendary' : 'Unknown'}
                    </div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {PART_TYPE_NAMES[part.car_part_type ?? 0] || 'N/A'}
                    </div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">{part.series}</div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <input
                      key={`part-level-${part.id}-${part.level}`}
                      type="number"
                      min={0}
                      max={LEVEL_RANGES[part.rarity as keyof typeof LEVEL_RANGES]?.max || 11}
                      defaultValue={part.level || 0}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const maxLevel = LEVEL_RANGES[part.rarity as keyof typeof LEVEL_RANGES]?.max || 11;
                        const finalValue = Math.min(value, maxLevel);
                        if (finalValue !== (part.level || 0)) {
                          handleSave(part.id, 'level', finalValue);
                        }
                        e.target.value = finalValue.toString();
                      }}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <input
                      key={`part-count-${part.id}-${part.card_count}`}
                      type="number"
                      min={0}
                      defaultValue={part.card_count || 0}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value !== (part.card_count || 0)) {
                          handleSave(part.id, 'card_count', value);
                        }
                        e.target.value = value.toString();
                      }}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <div className={`text-sm text-gray-900 ${highestLevel > currentLevel ? 'text-red-600' : ''}`}>
                      {highestLevel}
                    </div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {goldCost > 0 ? formatCompactNumber(goldCost) : '—'}
                    </div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {cardsToNext > 0 ? cardsToNext : '—'}
                    </div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {goldToNext > 0 ? formatCompactNumber(goldToNext) : '—'}
                    </div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {cardsToMax > 0 ? cardsToMax : '—'}
                    </div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {goldToMax > 0 ? formatCompactNumber(goldToMax) : '—'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </form>
  );
}