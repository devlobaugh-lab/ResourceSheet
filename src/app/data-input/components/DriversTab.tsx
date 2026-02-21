'use client';

import React, { useCallback } from 'react';
import { useUserDrivers } from '@/hooks/useApi';
import { DriverView } from '@/types/database';
import { DriverStatsPerLevel } from '@/lib/utils';
import { useUpdateDriverData } from '../hooks/useUpdateDriverData';
import { sortDrivers } from '../utils/sorting';
import { LEVEL_RANGES } from '../utils/constants';
import { 
  calculateHighestLevel, 
  getRarityBackground, 
  getRarityDisplay, 
  getCollectionRarityDisplay,
  calculateCardsToNextLevel,
  calculateCardsToMaxLevel,
  calculateGoldCostToHighestLevel,
  calculateLegacyCostToHighestLevel,
  calculateGoldToNextLevel,
  calculateGoldToMaxLevel,
  calculateLegacyToNextLevel,
  calculateLegacyToMaxLevel,
  formatCompactNumber,
} from '@/lib/utils';

/**
 * Format driver name for display (Last, First)
 */
const formatDriverName = (name: string): string => {
  const nameParts = name.split(' ');
  if (nameParts.length >= 2) {
    const lastName = nameParts[nameParts.length - 1];
    const firstName = nameParts.slice(0, -1).join(' ');
    return `${lastName}, ${firstName}`;
  }
  return name;
};

/**
 * DriversTab component for data input page.
 * Displays a table of drivers with editable level and card count fields.
 */
export function DriversTab() {
  const { data: driversResponse, isLoading } = useUserDrivers({
    page: 1,
    limit: 200 // Get all drivers, not just paginated
  });
  const updateDriverData = useUpdateDriverData();

  const drivers = driversResponse?.data || [];
  const sortedDrivers = sortDrivers(drivers);

  const handleSave = useCallback(async (driverId: string, field: 'level' | 'card_count', value: number) => {
    try {
      const data = { [field]: value };
      await updateDriverData.mutateAsync({ driverId, data });
    } catch (error) {
      console.error('Failed to save driver data:', error);
    }
  }, [updateDriverData]);

  if (isLoading) {
    return <div className="text-center py-8">Loading drivers...</div>;
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="overflow-auto bg-white rounded-lg border border-gray-200 w-fit max-h-[73vh]">
        <table className="table divide-y divide-gray-200">
          <thead className="bg-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Name</th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Rarity</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">Series</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">Level</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">Amount</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Highest<br/>Level</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Gold<br/>Cost</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Legacy<br/>Pts</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Cards<br/>- Next</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Gold<br/>- Next</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Legacy<br/>- Next</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Cards<br/>- Max</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Gold<br/>- Max</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">Legacy<br/>- Max</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedDrivers.map((driver) => {
              const currentLevel = driver.level || 0;
              const cardCount = driver.card_count || 0;
              const highestLevel = calculateHighestLevel(currentLevel, cardCount, driver.rarity);
              const statsPerLevel = driver.stats_per_level as DriverStatsPerLevel[] | undefined;
              
              const goldCost = calculateGoldCostToHighestLevel(currentLevel, highestLevel, statsPerLevel);
              const legacyCost = calculateLegacyCostToHighestLevel(currentLevel, highestLevel, statsPerLevel);
              const cardsToNext = calculateCardsToNextLevel(currentLevel, cardCount, highestLevel, driver.rarity, statsPerLevel);
              const goldToNext = calculateGoldToNextLevel(highestLevel, driver.rarity, statsPerLevel);
              const legacyToNext = calculateLegacyToNextLevel(highestLevel, driver.rarity, statsPerLevel);
              const cardsToMax = calculateCardsToMaxLevel(currentLevel, cardCount, highestLevel, driver.rarity, statsPerLevel);
              const goldToMax = calculateGoldToMaxLevel(currentLevel, cardCount, highestLevel, driver.rarity, statsPerLevel);
              const legacyToMax = calculateLegacyToMaxLevel(currentLevel, cardCount, highestLevel, driver.rarity, statsPerLevel);
              
              return (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className={`px-3 py-1 whitespace-nowrap ${getRarityBackground(driver.rarity)}`}>
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDriverName(driver.name)}
                      </div>
                    </div>
                  </td>
                  <td className={`px-3 py-1 whitespace-nowrap ${getRarityBackground(driver.rarity)}`}>
                    <div className="text-sm font-medium text-gray-900">
                      {driver.rarity === 5
                        ? (driver.collection_theme ? getCollectionRarityDisplay(driver.collection_theme, driver.collection_sub_name) : getRarityDisplay(5))
                        : getRarityDisplay(driver.rarity)}
                    </div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">{driver.series}</div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <input
                      key={`driver-level-${driver.id}-${driver.level}`}
                      type="number"
                      min={0}
                      max={LEVEL_RANGES[driver.rarity as keyof typeof LEVEL_RANGES]?.max || 11}
                      defaultValue={driver.level || 0}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const maxLevel = LEVEL_RANGES[driver.rarity as keyof typeof LEVEL_RANGES]?.max || 11;
                        const finalValue = Math.min(value, maxLevel);
                        if (finalValue !== (driver.level || 0)) {
                          handleSave(driver.id, 'level', finalValue);
                        }
                        e.target.value = finalValue.toString();
                      }}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <input
                      key={`driver-count-${driver.id}-${driver.card_count}`}
                      type="number"
                      min={0}
                      defaultValue={driver.card_count || 0}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value !== (driver.card_count || 0)) {
                          handleSave(driver.id, 'card_count', value);
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
                      {legacyCost > 0 ? formatCompactNumber(legacyCost) : '—'}
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
                      {legacyToNext > 0 ? formatCompactNumber(legacyToNext) : '—'}
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
                  <td className="px-3 py-1 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {legacyToMax > 0 ? formatCompactNumber(legacyToMax) : '—'}
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