'use client';

import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ui/Toast';
import { getAuthHeaders } from '@/hooks/useApi';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [exportStableLoading, setExportStableLoading] = useState(false);
  const [importStableLoading, setImportStableLoading] = useState(false);
  const [exportCustomNamesLoading, setExportCustomNamesLoading] = useState(false);
  const [importCustomNamesLoading, setImportCustomNamesLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stableFileInputRef = useRef<HTMLInputElement>(null);
  const customNamesFileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is admin
  const { data: profile } = useQuery({
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isAdmin = profile?.is_admin || false;



  const handleExport = async () => {
    setExportLoading(true);
    try {
      const response = await fetch('/api/export-collection', {
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
      const filename = `f1-resource-backup-${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.addToast('Collection exported successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      toast.addToast('Failed to export collection', 'error');
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

      const response = await fetch('/api/import-collection', {
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

      // Invalidate all queries to refresh the UI with new data
      queryClient.invalidateQueries();

      toast.addToast('Collection imported successfully', 'success');
    } catch (error) {
      console.error('Import error:', error);
      toast.addToast(error instanceof Error ? error.message : 'Failed to import collection', 'error');
    } finally {
      setImportLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportStable = async () => {
    setExportStableLoading(true);
    try {
      const response = await fetch('/api/export-collection-stable', {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Stable export failed: ${response.status}`);
      }

      const data = await response.json();

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `f1-stable-backup-${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.addToast('Stable collection exported successfully', 'success');
    } catch (error) {
      console.error('Stable export error:', error);
      toast.addToast(error instanceof Error ? error.message : 'Failed to export stable collection', 'error');
    } finally {
      setExportStableLoading(false);
    }
  };

  const handleImportStable = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStableLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch('/api/import-collection-stable', {
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
        throw new Error(errorData.error?.message || 'Stable import failed');
      }

      const result = await response.json();

      // Invalidate all queries to refresh the UI with new data
      queryClient.invalidateQueries();

      const successMessage = `Stable collection imported successfully! ${result.summary.imported} items imported.`;
      toast.addToast(successMessage, 'success');

      if (result.results.errors.length > 0) {
        console.warn('Import errors:', result.results.errors);
        toast.addToast(`${result.results.errors.length} items could not be matched and were skipped.`, 'warning');
      }
    } catch (error) {
      console.error('Stable import error:', error);
      toast.addToast(error instanceof Error ? error.message : 'Failed to import stable collection', 'error');
    } finally {
      setImportStableLoading(false);
      // Reset file input
      if (stableFileInputRef.current) {
        stableFileInputRef.current.value = '';
      }
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const triggerImportStable = () => {
    stableFileInputRef.current?.click();
  };

  const handleExportCustomNames = async () => {
    setExportCustomNamesLoading(true);
    try {
      const response = await fetch('/api/export-custom-names', {
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
      const filename = `f1-custom-names-backup-${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.addToast('Custom boost names exported successfully', 'success');
    } catch (error) {
      console.error('Export custom names error:', error);
      toast.addToast(error instanceof Error ? error.message : 'Failed to export custom boost names', 'error');
    } finally {
      setExportCustomNamesLoading(false);
    }
  };

  const handleImportCustomNames = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportCustomNamesLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch('/api/import-custom-names', {
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

      // Invalidate boost queries to refresh the UI with new custom names
      queryClient.invalidateQueries({ queryKey: ['boosts'] });

      toast.addToast('Custom boost names imported successfully', 'success');
    } catch (error) {
      console.error('Import custom names error:', error);
      toast.addToast(error instanceof Error ? error.message : 'Failed to import custom boost names', 'error');
    } finally {
      setImportCustomNamesLoading(false);
      // Reset file input
      if (customNamesFileInputRef.current) {
        customNamesFileInputRef.current.value = '';
      }
    }
  };

  const triggerImportCustomNames = () => {
    customNamesFileInputRef.current?.click();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-2 text-gray-600">Manage your account and view your collection stats</p>
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
              {/* Collection Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Backup & Restore</h3>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={handleExportStable}
                    disabled={exportStableLoading}
                  >
                    {exportStableLoading ? (
                      <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {exportStableLoading ? 'Backing up...' : 'Backup Collection'}
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={triggerImportStable}
                    disabled={importStableLoading}
                  >
                    {importStableLoading ? (
                      <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    )}
                    {importStableLoading ? 'Restoring...' : 'Restore Collection'}
                  </Button>

                  <Button variant="outline" className="justify-start opacity-50 cursor-not-allowed" disabled>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help
                  </Button>
                </div>
              </Card>

              {/* Admin Actions */}
              {isAdmin && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/admin/tracks">
                      <Button variant="outline" className="justify-start w-full">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Manage Tracks
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={triggerImportCustomNames}
                      disabled={importCustomNamesLoading}
                    >
                      {importCustomNamesLoading ? (
                        <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      )}
                      {importCustomNamesLoading ? 'Importing...' : 'Import Custom Names'}
                    </Button>

                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={handleExportCustomNames}
                      disabled={exportCustomNamesLoading}
                    >
                      {exportCustomNamesLoading ? (
                        <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {exportCustomNamesLoading ? 'Exporting...' : 'Export Custom Names'}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Hidden file input for stable import */}
      <input
        type="file"
        ref={stableFileInputRef}
        onChange={handleImportStable}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Hidden file input for custom names import */}
      <input
        type="file"
        ref={customNamesFileInputRef}
        onChange={handleImportCustomNames}
        accept=".json"
        style={{ display: 'none' }}
      />
    </ProtectedRoute>
  );
}
