'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AddAssetForm, BulkEntryForm } from '@/components/AddAssetForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

type EntryMode = 'single' | 'bulk';

export default function AddAssetPage() {
  const [mode, setMode] = useState<EntryMode>('single');
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add Items</h1>
            <p className="mt-2 text-gray-600">Add catalog items to your collection</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Item(s) added to your collection successfully!
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={mode === 'single' ? 'primary' : 'outline'}
              onClick={() => setMode('single')}
            >
              Single Item
            </Button>
            <Button
              variant={mode === 'bulk' ? 'primary' : 'outline'}
              onClick={() => setMode('bulk')}
            >
              Bulk Entry
            </Button>
          </div>

          {/* Form */}
          {mode === 'single' ? (
            <AddAssetForm onSuccess={handleSuccess} />
          ) : (
            <BulkEntryForm onSuccess={handleSuccess} />
          )}

          {/* Tips Card */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Use bulk entry to quickly add multiple items at once
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Level affects item stats - higher levels provide better performance
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                You can always update level and card count later from your dashboard
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}