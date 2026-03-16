'use client';

import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ui/Toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthHeaders } from '@/hooks/useApi';
import Link from 'next/link';
import { Upload, Users, Shield, Download, FileUp, Database, MapPin, Calendar } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  // Loading states for backup operations
  const [exportSystemLoading, setExportSystemLoading] = useState(false);
  const [importSystemLoading, setImportSystemLoading] = useState(false);
  const [exportUsersLoading, setExportUsersLoading] = useState(false);
  const [importUsersLoading, setImportUsersLoading] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // File input refs
  const systemFileInputRef = useRef<HTMLInputElement>(null);
  const usersFileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is admin
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
    staleTime: 5 * 60 * 1000
  });

  const isAdmin = profile?.is_admin === true;

  // Generic export handler
  const handleExport = async (
    endpoint: string,
    filename: string,
    setLoading: (loading: boolean) => void
  ) => {
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Export failed: ${response.status}`);
      }
      const data = await response.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split('T')[0];

      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.addToast('Export completed successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      toast.addToast(error instanceof Error ? error.message : 'Export failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Generic import handler
  const handleImport = async (
    endpoint: string,
    file: File,
    setLoading: (loading: boolean) => void,
    ref: React.RefObject<HTMLInputElement | null>
  ) => {
    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch(endpoint, {
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
      queryClient.invalidateQueries();

      const errors: string[] = result.results?.errors ?? [];
      setImportErrors(errors);
      if (errors.length > 0) {
        toast.addToast(`Import completed with ${errors.length} error${errors.length === 1 ? '' : 's'}`, 'warning');
      } else {
        toast.addToast('Import completed successfully', 'success');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.addToast(error instanceof Error ? error.message : 'Import failed', 'error');
    } finally {
      setLoading(false);
      if (ref.current) ref.current.value = '';
    }
  };

  const handleSystemFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImport('/api/admin/import/system', file, setImportSystemLoading, systemFileInputRef);
  };

  const handleUsersFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImport('/api/admin/import/users', file, setImportUsersLoading, usersFileInputRef);
  };

  // Show loading state while checking admin status
  if (isProfileLoading && user?.id) {
    return (
      <ProtectedRoute>
        <div className="mt-32 bg-gray-50 flex items-center justify-center">
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
        <div className="mt-32 bg-gray-50 flex items-center justify-center">
          <Card className="p-8 max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
            <Link href="/drivers">
              <Button>Go to Drivers</Button>
            </Link>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const adminSections = [
    {
      title: 'Content Cache Management',
      description: 'Upload and process content_cache.json files for new seasons',
      icon: Upload,
      href: '/admin/content-cache',
      color: 'text-blue-600'
    },
    {
      title: 'Track Name Aliases',
      description: 'Manage track display names (e.g., Americas → Austin)',
      icon: MapPin,
      href: '/admin/track-aliases',
      color: 'text-green-600'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'text-orange-600'
    },
    {
      title: 'Season Management',
      description: 'Add seasons and set the current active season',
      icon: Calendar,
      href: '/admin/seasons',
      color: 'text-purple-600'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your ResourceSheet application</p>
          </div>

          {/* Admin Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-gray-100 ${section.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                        <p className="text-gray-600 mt-1">{section.description}</p>
                      </div>
                    </div>
                    <Link href={section.href}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Data Backup Section */}
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Data Backup & Restore</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* System Data Backup */}
            <Card className="p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Database className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">System Data Backup</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                Admin-configured seasons, track aliases, and boost settings.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('/api/admin/export/system', 'f1-system-backup', setExportSystemLoading)}
                  disabled={exportSystemLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportSystemLoading ? 'Exporting...' : 'Export'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => systemFileInputRef.current?.click()}
                  disabled={importSystemLoading}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  {importSystemLoading ? 'Importing...' : 'Import'}
                </Button>
              </div>
            </Card>

            {/* User Data Backup */}
            <Card className="p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">User Data Backup</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                All users&apos; inventory, guides, setups, and custom drivers.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('/api/admin/export/users', 'f1-users-backup', setExportUsersLoading)}
                  disabled={exportUsersLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportUsersLoading ? 'Exporting...' : 'Export'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => usersFileInputRef.current?.click()}
                  disabled={importUsersLoading}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  {importUsersLoading ? 'Importing...' : 'Import'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Import Errors */}
          {importErrors.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-yellow-800">Import errors ({importErrors.length})</h3>
                <button
                  onClick={() => setImportErrors([])}
                  className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                >
                  Dismiss
                </button>
              </div>
              <ul className="text-xs text-yellow-700 space-y-1 max-h-40 overflow-y-auto font-mono">
                {importErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Admin Info */}
          <Card className="mt-6 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Admin Privileges</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                As an admin, you have access to powerful tools for managing the application.
                Use these tools responsibly and ensure you understand the impact of your actions.
              </p>
              <p>
                <strong>Important:</strong> Some operations cannot be undone. Always double-check
                your actions before proceeding.
              </p>
            </div>
          </Card>
        </div>

      {/* Hidden file inputs */}
      <input type="file" ref={systemFileInputRef} onChange={handleSystemFileChange} accept=".json" style={{ display: 'none' }} />
      <input type="file" ref={usersFileInputRef} onChange={handleUsersFileChange} accept=".json" style={{ display: 'none' }} />
    </ProtectedRoute>
  );
}