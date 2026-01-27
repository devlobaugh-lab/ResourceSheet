'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserDrivers, useUserCarParts, useUserBoosts, useBoosts, getAuthHeaders } from '@/hooks/useApi';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DriverView, CarPartView, BoostWithCustomName } from '@/types/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calculateHighestLevel } from '@/lib/utils';

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

  // Sort: series ascending, within series by rarity then ordinal, series 0 at end
  const sortedDrivers = [...drivers].sort((a, b) => {
    // Put series 0 at the end
    if (a.series === 0 && b.series !== 0) return 1;
    if (b.series === 0 && a.series !== 0) return -1;

    // Sort by series ascending
    if (a.series !== b.series) return a.series - b.series;

    // Within same series, sort by rarity ascending then ordinal ascending
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
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Name
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Rarity
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Series
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Level
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Highest Level
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedDrivers.map((driver) => (
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
                  {driver.rarity === 0 ? 'Basic' :
                   driver.rarity === 1 ? 'Common' :
                   driver.rarity === 2 ? 'Rare' :
                   driver.rarity === 3 ? 'Epic' :
                   driver.rarity === 4 ? 'Legendary' :
                   driver.rarity === 5 ? 'SE Standard' :
                   driver.rarity === 6 ? 'SE Turbo' : 'Unknown'}
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
                <div className={`text-sm text-gray-900 ${calculateHighestLevel(driver.level || 0, driver.card_count || 0, driver.rarity) > (driver.level || 0) ? 'text-red-600' : ''}`}>
                  {calculateHighestLevel(driver.level || 0, driver.card_count || 0, driver.rarity)}
                </div>
              </td>
            </tr>
          ))}
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

  // Sort: custom part type order, series ascending, rarity ascending
  const sortedParts = [...filteredParts].sort((a, b) => {
    const aOrder = getPartTypeOrder(a.car_part_type);
    const bOrder = getPartTypeOrder(b.car_part_type);
    if (aOrder !== bOrder) return aOrder - bOrder;
    if (a.series !== b.series) return a.series - b.series;
    return a.rarity - b.rarity;
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
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Name
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Rarity
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Part Type
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Series
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Level
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Highest Level
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedParts.map((part) => (
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
                <div className={`text-sm text-gray-900 ${calculateHighestLevel(part.level || 0, part.card_count || 0, part.rarity) > (part.level || 0) ? 'text-red-600' : ''}`}>
                  {calculateHighestLevel(part.level || 0, part.card_count || 0, part.rarity)}
                </div>
              </td>
            </tr>
          ))}
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

  // Extract number from boost name for sorting (only for data input page)
  const extractBoostNumber = (name: string): number => {
    const match = name.match(/(\d+)$/); // Get the last number in the string
    return match ? parseInt(match[1], 10) : 0;
  };

  // Sort by extracted number from boost name (numerical sort)
  const sortedBoosts = [...rawBoosts].sort((a, b) => {
    const numA = extractBoostNumber(a.name);
    const numB = extractBoostNumber(b.name);
    return numA - numB;
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
