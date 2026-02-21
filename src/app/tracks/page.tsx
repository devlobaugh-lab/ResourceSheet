'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useTracks } from '@/hooks/useApi';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Stat display configuration
const driverStats: Record<string, string> = {
  'tyreUse': 'Tyre Management',
  'overtaking': 'Overtaking',
  'defending': 'Defending',
  'raceStart': 'Race Start',
  'none': 'None'
};

const carStats: Record<string, string> = {
  'speed': 'Speed',
  'cornering': 'Cornering',
  'powerUnit': 'Power Unit',
  'none': 'None'
};

export default function TracksReferencePage() {
  const { data: tracksData, isLoading, error } = useTracks();

  // Get display name with alias if available
  const getDisplayName = (track: any) => {
    if (track.display_name) {
      return `${track.display_name} (${track.name})`;
    }
    return track.name;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tracks</h1>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-8 text-center bg-red-50">
              <p className="text-red-600">Error loading tracks. Please try again.</p>
            </Card>
          )}

          {/* Tracks Table */}
          {tracksData && !isLoading && (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-100 bg-gray-800 uppercase tracking-wider">
                        Track Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-100 bg-gray-800 uppercase tracking-wider">
                        Laps
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-100 bg-gray-800 uppercase tracking-wider">
                        Driver Stat
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-100 bg-gray-800 uppercase tracking-wider">
                        Car Stat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tracksData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          No tracks found. Upload a content_cache.json to populate tracks.
                        </td>
                      </tr>
                    ) : (
                      tracksData
                        .sort((a: any, b: any) => a.name.localeCompare(b.name))
                        .map((track: any) => (
                          <tr key={track.id} className="hover:bg-gray-50">
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="text-base font-medium text-gray-900">
                                {getDisplayName(track)}
                              </div>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                              {track.laps}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                              {driverStats[track.driver_track_stat] || track.driver_track_stat}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                              {carStats[track.car_track_stat] || track.car_track_stat}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {tracksData.length > 0 && (
                <div className="text-center py-4 border-t border-gray-200 text-sm text-gray-500">
                  {tracksData.length} tracks
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}