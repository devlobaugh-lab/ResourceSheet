'use client';

import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ui/Toast';
import { getAuthHeaders } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { useSeason } from '@/contexts/SeasonContext';
import { useSeasons } from '@/hooks/useApi';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { activeSeasonId, setActiveSeason } = useSeason();
  const { data: seasonsData } = useSeasons();
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const response = await fetch('/api/export-user-data', {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Export failed: ${response.status}`);
      }

      const data = await response.json();

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `f1-user-data-${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.addToast('User data exported successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      toast.addToast(error instanceof Error ? error.message : 'Failed to export user data', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch('/api/import-user-data', {
        method: 'POST',
        headers: {
          ...await getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Import failed');
      }

      const result = await response.json();

      // Invalidate all queries to refresh the UI with new data
      queryClient.invalidateQueries();

      const totalImported = Object.values(result.results.imported).reduce((a: number, b: unknown) => a + (b as number), 0);
      const totalUpdated = Object.values(result.results.updated).reduce((a: number, b: unknown) => a + (b as number), 0);
      
      toast.addToast(`Data imported: ${totalImported} new, ${totalUpdated} updated`, 'success');

      if (result.results.errors?.length > 0) {
        console.warn('Import errors:', result.results.errors);
        toast.addToast(`${result.results.errors.length} errors occurred during import`, 'warning');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.addToast(error instanceof Error ? error.message : 'Failed to import user data', 'error');
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      }
    } catch {
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-2 text-gray-600">Manage your account and data</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Info Card */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="text-center">
                  <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-white">
                      {user?.email?.[0].toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.email?.split('@')[0] || 'User'}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                  <Badge variant="success" className="mt-2">Verified</Badge>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button variant="outline" className="w-full" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Data Backup */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Backup & Restore</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Export all your data including drivers, car parts, boosts, track guides, GP guides, and car setups.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={handleExport}
                    disabled={exportLoading}
                  >
                    {exportLoading ? (
                      <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    )}
                    {exportLoading ? 'Exporting...' : 'Export My Data'}
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={triggerImport}
                    disabled={importLoading}
                  >
                    {importLoading ? (
                      <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    )}
                    {importLoading ? 'Importing...' : 'Import Data'}
                  </Button>
                </div>
              </Card>

              {/* Active Season */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Season</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Select which season&apos;s data you want to work with. &quot;Current&quot; marks the admin-designated active season.
                </p>
                {seasonsData && (() => {
                  const seasons = (seasonsData as any)?.data ?? seasonsData ?? []
                  if (!seasons.length) {
                    return <p className="text-sm text-gray-400">No seasons available.</p>
                  }
                  return (
                    <div className="space-y-2">
                      {seasons.map((season: any) => (
                        <button
                          key={season.id}
                          onClick={() => setActiveSeason(season.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors ${
                            activeSeasonId === season.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`font-medium text-sm ${activeSeasonId === season.id ? 'text-blue-700' : 'text-gray-900'}`}>
                            {season.name}
                          </span>
                          <div className="flex items-center gap-2">
                            {season.is_active && (
                              <Badge variant="success">Current</Badge>
                            )}
                            {activeSeasonId === season.id && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })()}
              </Card>

              {/* Change Password */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h3>
                <form className="space-y-4" onSubmit={handleChangePassword}>
                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                      Password updated successfully.
                    </div>
                  )}
                  <Input
                    label="New password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    required
                    autoComplete="new-password"
                  />
                  <Input
                    label="Confirm password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    required
                    autoComplete="new-password"
                  />
                  <Button type="submit" isLoading={passwordLoading} disabled={passwordLoading}>
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </Card>

            </div>
          </div>
        </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        style={{ display: 'none' }}
      />
    </ProtectedRoute>
  );
}