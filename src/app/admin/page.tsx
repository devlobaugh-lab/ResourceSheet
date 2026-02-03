'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ui/Toast';
import { useQuery } from '@tanstack/react-query';
import { getAuthHeaders } from '@/hooks/useApi';
import Link from 'next/link';
import { Database, Upload, Settings, Users, Shield } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

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
      title: 'Data Import/Export',
      description: 'Import and export game data',
      icon: Database,
      href: '/admin/import-export',
      color: 'text-purple-600'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'text-orange-600'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">Manage your ResourceSheet application</p>
              </div>
              <Link href="/profile">
                <Button variant="outline">Back to Profile</Button>
              </Link>
            </div>
          </div>

          {/* Admin Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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

          {/* Admin Info */}
          <Card className="mt-8 p-6">
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
    </ProtectedRoute>
  );
}