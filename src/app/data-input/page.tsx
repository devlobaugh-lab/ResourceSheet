'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Import extracted tab components
import { DriversTab } from './components/DriversTab';
import { PartsTab } from './components/PartsTab';
import { BoostsTab } from './components/BoostsTab';

/**
 * Data Input Page
 * 
 * Main page for users to input and manage their game asset data.
 * Provides tabbed interface for drivers, car parts, and boosts.
 */
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
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
          {/* Page Title and Tabs */}
          <div className="mb-8 flex items-center gap-6">
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
