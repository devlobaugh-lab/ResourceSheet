'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserDrivers, useUserCarParts, useUserBoosts, useBoosts, getAuthHeaders } from '@/hooks/useApi';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DriverView, CarPartView, BoostWithCustomName } from '@/types/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  getMaxLevelForRarity,
  formatCompactNumber,
  DriverStatsPerLevel,
  CarPartStatsPerLevel
} from '@/lib/utils';

// Level range validation by rarity
const LEVEL_RANGES = {
  0: { min: 1, max: 11 }, // Basic
  1: { min: 1, max: 11 }, // Common
  2: { min: 1, max: 9 },  // Rare
  3: { min: 1, max: 8 },  // Epic
  4: { min: 1, max: 7 },  // Legendary
  5: { min: 1, max: 7 },  // Special Edition
};



// Custom mutation for updating driver data
const useUpdateDriverData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, data }: { driverId: string; data: { level?: number; card_count?: number } }) => {
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

// Custom mutation for updating car part data
const useUpdateCarPartData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ carPartId, data }: { carPartId: string; data: { level?: number; card_count?: number } }) => {
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

// Custom mutation for updating boost amount
const useUpdateBoostData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boostId, data }: { boostId: string; data: { card_count: number } }) => {
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

function DriversTab() {
  const { data: driversResponse, isLoading } = useUserDrivers({
    page: 1,
    limit: 200 // Get all drivers, not just paginated
  });
  const updateDriverData = useUpdateDriverData();

  const drivers = driversResponse?.data || [];

  // Sort: rarity groups first, then series ascending, within series by rarity then ordinal, series 0 at end
  const sortedDrivers = [...drivers].sort((a, b) => {
    // Helper function to get rarity group for sorting
    const getRarityGroup = (rarity: number): number => {
      if (rarity < 4) return 0; // Group 0: rarities 0, 1, 2, 3
      if (rarity === 4) return 1; // Group 1: rarity 4
      if (rarity === 5) return 2; // Group 2: rarity 5
      return 99; // Unknown/invalid rarity
    };

    const aRarityGroup = getRarityGroup(a.rarity);
    const bRarityGroup = getRarityGroup(b.rarity);

    // First: sort by rarity group
    if (aRarityGroup !== bRarityGroup) return aRarityGroup - bRarityGroup;

    // Within same rarity group, put series 0 at the end
    if (a.series === 0 && b.series !== 0) return 1;
    if (b.series === 0 && a.series !== 0) return -1;

    // For rarity 5 (Special Edition with collections), sort by collection ordinal then driver ordinal
    if (a.rarity === 5 && b.rarity === 5) {
      const aCollOrd = a.collection_ordinal || 999;
      const bCollOrd = b.collection_ordinal || 999;
      if (aCollOrd !== bCollOrd) return aCollOrd - bCollOrd;
      return (a.ordinal || 0) - (b.ordinal || 0);
    }

    // Then: sort by series ascending
    if (a.series !== b.series) return a.series - b.series;

    // Finally: within same series, sort by rarity ascending then ordinal ascending
    if (a.rarity !== b.rarity) return a.rarity - b.rarity;
    return (a.ordinal || 0) - (b.ordinal || 0);
  });

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

  // Helper function to get rarity background color
  const getRarityBackground = (rarity: number): string => {
    return rarity === 0 ? "bg-gray-300" :
           rarity === 1 ? "bg-blue-200" :
           rarity === 2 ? "bg-orange-200" :
           rarity === 3 ? "bg-purple-300" :
           rarity === 4 ? "bg-yellow-300" :
           rarity === 5 ? "bg-red-300":
           rarity === 6 ? "bg-rose-400" : "bg-gray-300"; 
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="overflow-auto bg-white rounded-lg border border-gray-200 w-fit max-h-[73vh]">
        <table className="table divide-y divide-gray-200">
        <thead className="bg-gray-700 sticky top-0 z-10">
          <tr>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Name
            </th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Rarity
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">
              Series
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">
              Level
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Highest<br/>Level
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Gold<br/>Cost
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Legacy<br/>Pts
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Cards<br/>- Next
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Gold<br/>- Next
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Legacy<br/>- Next
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Cards<br/>- Max
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Gold<br/>- Max
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Legacy<br/>- Max
            </th>
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
                    {(() => {
                      const nameParts = driver.name.split(' ')
                      if (nameParts.length >= 2) {
                        const lastName = nameParts[nameParts.length - 1]
                        const firstName = nameParts.slice(0, -1).join(' ')
                        return `${lastName}, ${firstName}`
                      }
                      return driver.name
                    })()}
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
                    // Reset input to the saved value (or clamped value)
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
                    // Reset input to the saved value
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
          )})}
        </tbody>
      </table>
    </div>
    </form>
  );
}

function PartsTab() {
  const { data: partsResponse, isLoading } = useUserCarParts({
    page: 1,
    limit: 200 // Get all parts, not just paginated
  });
  const updateCarPartData = useUpdateCarPartData();

  const parts = partsResponse?.data || [];

  // Filter out starter components (they don't have levels/amounts to track)
  const filteredParts = parts.filter(part => {
    // Exclude series 0 (unknown series) and very basic components
    return part.series > 0;
  });

  // Custom part type ordering: brakes(1), gearbox(0), rear wing(5), front wing(4), suspension(3), engine(2)
  const PART_TYPE_ORDER = {
    1: 0, // Brakes - first
    0: 1, // Gearbox - second
    5: 2, // Rear Wing - third
    4: 3, // Front Wing - fourth
    3: 4, // Suspension - fifth
    2: 5  // Engine - sixth
  };

  const getPartTypeOrder = (type: number | null): number => {
    return type !== null ? (PART_TYPE_ORDER[type as keyof typeof PART_TYPE_ORDER] ?? 99) : 99;
  };

  // Sort: custom part type order, series ascending, rarity ascending, then by ID for consistent tiebreaking
  const sortedParts = [...filteredParts].sort((a, b) => {
    const aOrder = getPartTypeOrder(a.car_part_type);
    const bOrder = getPartTypeOrder(b.car_part_type);
    if (aOrder !== bOrder) return aOrder - bOrder;
    if (a.series !== b.series) return a.series - b.series;
    if (a.rarity !== b.rarity) return a.rarity - b.rarity;
    // Final tiebreaker: sort alphabetically by ID to ensure consistent ordering
    return a.id.localeCompare(b.id);
  });

  const handleSave = useCallback(async (partId: string, field: 'level' | 'card_count', value: number) => {
    try {
      const data = { [field]: value };
      await updateCarPartData.mutateAsync({ carPartId: partId, data });
    } catch (error) {
      console.error('Failed to save part data:', error);
    }
  }, [updateCarPartData]);

  const getPartTypeName = (type: number | null) => {
    if (type === null) return 'N/A';
    const types = ['Gearbox', 'Brakes', 'Engine', 'Suspension', 'Front Wing', 'Rear Wing'];
    return types[type] || 'Unknown';
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading parts...</div>;
  }

  // Helper function to get rarity background color
  const getRarityBackground = (rarity: number): string => {
    return rarity === 0 ? "bg-gray-300" :
           rarity === 1 ? "bg-blue-200" :
           rarity === 2 ? "bg-orange-200" :
           rarity === 3 ? "bg-purple-300" :
           rarity === 4 ? "bg-yellow-300" :
           rarity === 5 ? "bg-red-300" : "bg-gray-300";
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="overflow-auto bg-white rounded-lg border border-gray-200 w-fit max-h-[73vh]">
        <table className="table divide-y divide-gray-200">
        <thead className="bg-gray-700 sticky top-0 z-10">
          <tr>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Name
            </th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Rarity
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Part<br/>Type
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">
              Series
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">
              Level
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Highest<br/>Level
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Gold<br/>Cost
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Cards<br/>- Next
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Gold<br/>- Next
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Cards<br/>- Max
            </th>
            <th className="px-2 py-1 text-center text-xs font-medium text-gray-200 uppercase tracking-wider leading-tight">
              Gold<br/>- Max
            </th>
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
                  <div className="text-sm font-medium text-gray-900">
                    {part.name}
                  </div>
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
                <div className="text-sm text-gray-900">{getPartTypeName(part.car_part_type)}</div>
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
                    // Reset input to the saved value (or clamped value)
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
                    // Reset input to the saved value
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
          )})}
        </tbody>
      </table>
    </div>
    </form>
  );
}

function BoostsTab() {
  const { data: boostsResponse, isLoading: boostsLoading } = useBoosts({
    page: 1,
    limit: 200 // Get all boosts
  });
  const { data: userBoostsResponse, isLoading: userBoostsLoading } = useUserBoosts({
    page: 1,
    limit: 200 // Get user's boost ownership data
  });
  const updateBoostData = useUpdateBoostData();

  // Merge catalog boosts with user ownership data
  const rawBoosts = (boostsResponse?.data || []).map((boost: any) => {
    // Find user's ownership data for this boost
    const userData = (userBoostsResponse?.data || []).find((userBoost: any) => userBoost.id === boost.id);
    const cardCount = userData?.card_count || 0;

    return {
      ...boost,
      custom_name: boost.boost_custom_names?.custom_name || null,
      card_count: cardCount
    };
  });

  // Sort: BoostIcon_1 through BoostIcon_6 first (alphabetically), then rest by ID
  const sortedBoosts = [...rawBoosts].sort((a, b) => {
    const aIsSpecial = a.icon && a.icon.startsWith('BoostIcon_') && ['1','2','3','4','5','6'].includes(a.icon.replace('BoostIcon_', ''));
    const bIsSpecial = b.icon && b.icon.startsWith('BoostIcon_') && ['1','2','3','4','5','6'].includes(b.icon.replace('BoostIcon_', ''));
    
    // If one is special and the other isn't, special comes first
    if (aIsSpecial && !bIsSpecial) return -1;
    if (!aIsSpecial && bIsSpecial) return 1;
    
    // If both are special, sort by icon name (BoostIcon_1, BoostIcon_2, etc.)
    if (aIsSpecial && bIsSpecial) {
      return a.icon.localeCompare(b.icon);
    }
    
    // If neither is special, sort by ID
    return a.id.localeCompare(b.id);
  });

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
                    {boost.custom_name || boost.icon.replace('BoostIcon_', '') || boost.name}
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
                    // Reset input to the saved value
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

export default function DataInputPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'drivers' | 'parts' | 'boosts'>('drivers');

  if (authLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Card className="p-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign in Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access data input functionality.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-gray-50 py-1">
        <div className="space-y-4">
          {/* Page Title and Tabs */}
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold text-gray-900 mr-4">Data Input</h1>

            {/* Tabs */}
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('drivers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'drivers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Drivers
              </button>
              <button
                onClick={() => setActiveTab('parts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'parts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Car Parts
              </button>
              <button
                onClick={() => setActiveTab('boosts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'boosts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Boosts
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'drivers' ? <DriversTab /> :
           activeTab === 'parts' ? <PartsTab /> :
           <BoostsTab />}

        </div>
      </div>
    </ProtectedRoute>
  );
}
