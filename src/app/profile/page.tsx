'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  // Mock stats - in production, these would come from the API
  const stats = {
    totalItems: 156,
    ownedItems: 89,
    completionRate: 57,
    legendaryOwned: 12,
    epicOwned: 34,
    rareOwned: 28,
    uncommonOwned: 15,
    commonOwned: 0,
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

            {/* Stats Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Collection Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Summary</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900">{stats.totalItems}</div>
                    <div className="text-sm text-gray-500">Total Items</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{stats.ownedItems}</div>
                    <div className="text-sm text-gray-500">Owned</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{stats.completionRate}%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">
                      {stats.totalItems - stats.ownedItems}
                    </div>
                    <div className="text-sm text-gray-500">Remaining</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Collection Progress</span>
                    <span className="font-medium text-gray-900">{stats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${stats.completionRate}%` }}
                    />
                  </div>
                </div>
              </Card>

              {/* Rarity Breakdown */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rarity Breakdown</h3>
                
                <div className="space-y-4">
                  {/* Legendary */}
                  <div className="flex items-center">
                    <div className="w-24 text-sm font-medium text-gray-700">Legendary</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-red-500 h-4 rounded-full"
                          style={{ width: `${(stats.legendaryOwned / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-600">
                      {stats.legendaryOwned}/20
                    </div>
                  </div>

                  {/* Epic */}
                  <div className="flex items-center">
                    <div className="w-24 text-sm font-medium text-gray-700">Epic</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-purple-500 h-4 rounded-full"
                          style={{ width: `${(stats.epicOwned / 40) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-600">
                      {stats.epicOwned}/40
                    </div>
                  </div>

                  {/* Rare */}
                  <div className="flex items-center">
                    <div className="w-24 text-sm font-medium text-gray-700">Rare</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-500 h-4 rounded-full"
                          style={{ width: `${(stats.rareOwned / 50) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-600">
                      {stats.rareOwned}/50
                    </div>
                  </div>

                  {/* Uncommon */}
                  <div className="flex items-center">
                    <div className="w-24 text-sm font-medium text-gray-700">Uncommon</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-green-500 h-4 rounded-full"
                          style={{ width: `${(stats.uncommonOwned / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-600">
                      {stats.uncommonOwned}/30
                    </div>
                  </div>

                  {/* Common */}
                  <div className="flex items-center">
                    <div className="w-24 text-sm font-medium text-gray-700">Common</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gray-400 h-4 rounded-full"
                          style={{ width: `${(stats.commonOwned / 16) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-600">
                      {stats.commonOwned}/16
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                  </Button>
                  
                  <Button variant="outline" className="justify-start">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import Data
                  </Button>
                  
                  <Button variant="outline" className="justify-start">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Collection
                  </Button>
                  
                  <Button variant="outline" className="justify-start">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Compare Items
                  </Button>
                  
                  <Button variant="outline" className="justify-start">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Settings
                  </Button>
                  
                  <Button variant="outline" className="justify-start">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}