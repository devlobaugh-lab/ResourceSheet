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
import { Upload, Settings, Users, Shield, Download, FileUp } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [exportAdminDataLoading, setExportAdminDataLoading] = useState(false);
  const [importAdminDataLoading, setImportAdminDataLoading] = useState(false);
  const adminDataFileInputRef = useRef<HTMLInputElement>(null);

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

  const isAdmin = profile?.is_admin || false;

  const handleExportAdminData = async () => {
    setExportAdminDataLoading(true);
    try {
      const response = await fetch('/api/export-admin-data', {
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
      const filename = `f1-admin-data-backup-${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.addToast('Admin data exported successfully', 'success');
    } catch (error) {
      console.error('Export admin data error:', error);
      toast.addToast(error instanceof Error ? error.message : 'Failed to export admin data', 'error');
    } finally {
      setExportAdminDataLoading(false);
    }
  };

  const handleImportAdminData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportAdminDataLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch('/api/import-admin-data', {
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

      // Invalidate boost queries to refresh the UI with new custom names and free flags
      queryClient.invalidateQueries({ queryKey: ['boosts'] });

      const successMessage = `Admin data imported successfully! ${result.imported.customNames} custom names and ${result.imported.freeBoosts} free boost flags imported.`;
      toast.addToast(successMessage, 'success');
    } catch (error) {
      console.error('Import admin data error:', error);
      toast.addToast(error instanceof Error ? error.message : 'Failed to import admin data', 'error');
    } finally {
      setImportAdminDataLoading(false);
      // Reset file input
      if (adminDataFileInputRef.current) {
        adminDataFileInputRef.current.value = '';
      }
    }
  };

  const triggerImportAdminData = () => {
    adminDataFileInputRef.current?.click();
  };

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
      title: 'Track Management',
      description: 'Manage race tracks and their attributes',
      icon: Settings,
      href: '/admin/tracks',
      color: 'text-green-600'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'text-orange-600',
      disabled: true
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your ResourceSheet application</p>
          </div>

          {/* Admin Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className={`p-6 hover:shadow-lg transition-shadow ${section.disabled ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-gray-100 ${section.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                        <p className="text-gray-600 mt-1 mr-1">{section.description}</p>
                      </div>
                    </div>
                    {section.disabled ? (
                      <Button variant="outline" size="sm" disabled>
                        Coming Soon
                      </Button>
                    ) : (
                      <Link href={section.href}>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Admin Data Import/Export Section */}
          <Card className="mt-6 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Admin Data Backup</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Export or import admin data including boost custom names and free boost flags.
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleExportAdminData}
                disabled={exportAdminDataLoading}
              >
                {exportAdminDataLoading ? (
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Download className="w-5 h-5 mr-2" />
                )}
                {exportAdminDataLoading ? 'Exporting...' : 'Export Admin Data'}
              </Button>

              <Button
                variant="outline"
                onClick={triggerImportAdminData}
                disabled={importAdminDataLoading}
              >
                {importAdminDataLoading ? (
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FileUp className="w-5 h-5 mr-2" />
                )}
                {importAdminDataLoading ? 'Importing...' : 'Import Admin Data'}
              </Button>
            </div>
          </Card>

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
      </div>

      {/* Hidden file input for admin data import */}
      <input
        type="file"
        ref={adminDataFileInputRef}
        onChange={handleImportAdminData}
        accept=".json"
        style={{ display: 'none' }}
      />
    </ProtectedRoute>
  );
}