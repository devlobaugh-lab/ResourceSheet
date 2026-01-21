'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTracks, useCreateTrack, useUpdateTrack, useDeleteTrack, useSeasons } from '@/hooks/useApi';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ui/Toast';
import { useQuery } from '@tanstack/react-query';
import { getAuthHeaders } from '@/hooks/useApi';
import Link from 'next/link';

interface TrackFormData {
  name: string;
  alt_name: string;
  laps: number;
  driver_track_stat: string;
  car_track_stat: string;
  season_id: string;
}

const initialFormData: TrackFormData = {
  name: '',
  alt_name: '',
  laps: 1,
  driver_track_stat: 'overtaking',
  car_track_stat: 'speed',
  season_id: ''
};

const driverStats = [
  { value: 'overtaking', label: 'Overtaking' },
  { value: 'defending', label: 'Defending' },
  { value: 'raceStart', label: 'Race Start' },
  { value: 'tyreUse', label: 'Tyre Management' }
];

const carStats = [
  { value: 'speed', label: 'Speed' },
  { value: 'cornering', label: 'Cornering' },
  { value: 'powerUnit', label: 'Power Unit' }
];

export default function AdminTracksPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any>(null);
  const [formData, setFormData] = useState<TrackFormData>(initialFormData);
  // Get current active season for default selection
  const { data: seasonsData } = useSeasons({ is_active: true });
  const currentSeason = seasonsData?.data?.find((season: any) => season.is_active);

  const [selectedSeason, setSelectedSeason] = useState<string>(currentSeason?.id || '');

  // Set default season when data loads
  React.useEffect(() => {
    if (currentSeason && !formData.season_id) {
      setFormData(prev => ({ ...prev, season_id: currentSeason.id }));
    }
  }, [currentSeason, formData.season_id]);

  // Set default filter to current season
  React.useEffect(() => {
    if (currentSeason && !selectedSeason) {
      setSelectedSeason(currentSeason.id);
    }
  }, [currentSeason, selectedSeason]);

  // Reset form with current season when currentSeason changes
  React.useEffect(() => {
    if (currentSeason) {
      resetForm();
    }
  }, [currentSeason]);

  // Get all seasons for dropdown
  const { data: allSeasons } = useSeasons();

  const { data: tracksData, isLoading } = useTracks(selectedSeason ? { season_id: selectedSeason } : undefined);
  const createTrack = useCreateTrack();
  const updateTrack = useUpdateTrack();
  const deleteTrack = useDeleteTrack();

  const resetForm = () => {
    setFormData({ ...initialFormData, season_id: currentSeason?.id || '' });
    setEditingTrack(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTrack) {
        await updateTrack.mutateAsync({ id: editingTrack.id, data: formData });
        addToast('Track updated successfully', 'success');
      } else {
        await createTrack.mutateAsync(formData);
        addToast('Track created successfully', 'success');
      }
      resetForm();
    } catch (error) {
      addToast('Failed to save track', 'error');
    }
  };

  const handleEdit = (track: any) => {
    setFormData({
      name: track.name,
      alt_name: track.alt_name || '',
      laps: track.laps,
      driver_track_stat: track.driver_track_stat,
      car_track_stat: track.car_track_stat,
      season_id: track.season_id
    });
    setEditingTrack(track);
    setShowCreateForm(true);
  };

  const handleDelete = async (trackId: string, trackName: string) => {
    if (confirm(`Are you sure you want to delete "${trackName}"?`)) {
      try {
        await deleteTrack.mutateAsync(trackId);
        addToast('Track deleted successfully', 'success');
      } catch (error) {
        addToast('Failed to delete track', 'error');
      }
    }
  };

  // Check if user is admin by fetching profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
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
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const isAdmin = profile?.is_admin || false;

  // Show loading state while checking admin status
  if (isProfileLoading && user?.id) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="p-8 max-w-md mx-auto text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking permissions...</p>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="p-8 max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
            <Link href="/profile">
              <Button>Back to Profile</Button>
            </Link>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Track Management</h1>
                <p className="mt-2 text-gray-600">Manage race tracks and their attributes</p>
              </div>
              <Link href="/profile">
                <Button variant="outline">Back to Profile</Button>
              </Link>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor="season-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Season
                </label>
                <select
                  id="season-filter"
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="rounded-lg border-gray-300 text-sm px-3 py-2 bg-white"
                >
                  <option value="">All Seasons</option>
                  {allSeasons?.data?.map((season: any) => (
                    <option key={season.id} value={season.id}>
                      {season.name} {season.is_active ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={() => setShowCreateForm(true)}
              disabled={showCreateForm}
            >
              Add New Track
            </Button>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingTrack ? 'Edit Track' : 'Create New Track'}
                </h2>
                <Button variant="outline" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Track Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternative Name
                  </label>
                  <Input
                    type="text"
                    value={formData.alt_name}
                    onChange={(e) => setFormData({ ...formData, alt_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Laps *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.laps}
                    onChange={(e) => setFormData({ ...formData, laps: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Season *
                  </label>
                  <select
                    value={formData.season_id}
                    onChange={(e) => setFormData({ ...formData, season_id: e.target.value })}
                    className="w-full rounded-lg border-gray-300 px-3 py-2 bg-white"
                    required
                  >
                    <option value="">Select Season</option>
                    {allSeasons?.data?.map((season: any) => (
                      <option key={season.id} value={season.id}>
                        {season.name} {season.is_active ? '(Active)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Track Stat *
                  </label>
                  <select
                    value={formData.driver_track_stat}
                    onChange={(e) => setFormData({ ...formData, driver_track_stat: e.target.value })}
                    className="w-full rounded-lg border-gray-300 px-3 py-2 bg-white"
                    required
                  >
                    {driverStats.map(stat => (
                      <option key={stat.value} value={stat.value}>
                        {stat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Car Track Stat *
                  </label>
                  <select
                    value={formData.car_track_stat}
                    onChange={(e) => setFormData({ ...formData, car_track_stat: e.target.value })}
                    className="w-full rounded-lg border-gray-300 px-3 py-2 bg-white"
                    required
                  >
                    {carStats.map(stat => (
                      <option key={stat.value} value={stat.value}>
                        {stat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={createTrack.isPending || updateTrack.isPending}
                  >
                    {createTrack.isPending || updateTrack.isPending
                      ? 'Saving...'
                      : editingTrack
                        ? 'Update Track'
                        : 'Create Track'
                    }
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tracks Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Track Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alt Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Laps
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver Stat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Car Stat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Season
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Loading tracks...
                      </td>
                    </tr>
                  ) : tracksData?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No tracks found
                      </td>
                    </tr>
                  ) : (
                    tracksData?.map((track: any) => (
                      <tr key={track.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {track.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {track.alt_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {track.laps}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {driverStats.find(s => s.value === track.driver_track_stat)?.label}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {carStats.find(s => s.value === track.car_track_stat)?.label}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {track.seasons?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(track)}
                            disabled={showCreateForm}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(track.id, track.name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
