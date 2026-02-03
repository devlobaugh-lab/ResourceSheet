'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ui/Toast';
import { useQuery } from '@tanstack/react-query';
import { getAuthHeaders } from '@/hooks/useApi';
import Link from 'next/link';
import { Upload, FileText, Settings, Database, AlertCircle, Eye } from 'lucide-react';

export default function AdminContentCachePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [allowModifications, setAllowModifications] = useState<boolean>(false);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.json')) {
        addToast('Please select a JSON file', 'error');
        return;
      }
      
      // Validate file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        addToast('File size must be less than 100MB', 'error');
        return;
      }
      
      setSelectedFile(file);
      addToast(`Selected: ${file.name}`, 'success');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      addToast('Please select a file first', 'error');
      return;
    }

    if (!seasonFilter.trim()) {
      addToast('Please specify season filter (e.g., "2,3,4,5" or "6")', 'error');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setProcessingStatus('Starting upload...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('season_filter', seasonFilter.trim());
      formData.append('allow_modifications', allowModifications.toString());

      // Use authorization header for local development
      const response = await fetch('/api/admin/content-cache/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsb2NhbC1hZG1pbi11c2VyIiwiaWF0IjoxNjQyNjMwNDAwLCJleHAiOjE5NTc5OTA0MDB9.mock-token-for-local-dev'
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const result = await response.json();
      
      // Store result for display on page
      setUploadResult(result);
      
      // Show modified items in console for admin review
      if (result.summary.total_modified > 0) {
        console.log('Modified Items Report:', result.results);
      }
      
      // Reset form
      setSelectedFile(null);
      setSeasonFilter('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addToast(`Upload failed: ${errorMessage}`, 'error');
      setProcessingStatus('Upload failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Cache Management</h1>
                <p className="mt-2 text-gray-600">Upload and process content_cache.json files</p>
              </div>
              <Link href="/profile">
                <Button variant="outline">Back to Profile</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Content Cache
                </h2>
              </div>


              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select content_cache.json file
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-gray-600 hover:text-gray-900"
                    >
                      {selectedFile ? (
                        <div className="flex items-center justify-center space-x-2">
                          <FileText className="w-5 h-5" />
                          <span className="text-sm">{selectedFile.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Upload className="w-6 h-6 mx-auto text-gray-400" />
                          <p className="text-sm">Click to select JSON file</p>
                          <p className="text-xs text-gray-500">Max 100MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Modification Mode Toggle */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Mode Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allow-modifications"
                        checked={allowModifications}
                        onChange={(e) => setAllowModifications(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="allow-modifications" className="text-sm font-medium text-gray-700">
                        Allow Modifications (Override Mode)
                      </label>
                    </div>
                    
                    <div className={`rounded-lg p-4 ${
                      allowModifications 
                        ? 'bg-yellow-50 border border-yellow-200' 
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <Eye className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          allowModifications ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                        <div>
                          <h4 className={`font-medium ${
                            allowModifications ? 'text-yellow-900' : 'text-blue-900'
                          }`}>
                            {allowModifications ? 'Override Mode Active' : 'Change Detection Mode'}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            allowModifications ? 'text-yellow-800' : 'text-blue-800'
                          }`}>
                            {allowModifications 
                              ? 'Modifications will be applied to existing items. Use with caution after reviewing changes.'
                              : 'Only new items will be added. Existing items will not be modified.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Season Filtering */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Season Filtering
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Seasons (required)
                      </label>
                      <Input
                        type="text"
                        value={seasonFilter}
                        onChange={(e) => setSeasonFilter(e.target.value)}
                        placeholder="e.g., 2,3,4,5 or 6"
                        className="font-mono"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter season numbers to import (comma-separated). Leave empty to import all seasons.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload Status */}
                {isProcessing && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Processing...</span>
                      <span className="text-sm text-gray-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{processingStatus}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || !seasonFilter.trim() || isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? 'Processing...' : 'Upload & Process'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setSeasonFilter('');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={isProcessing}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </Card>

            {/* Instructions or Results */}
            {uploadResult ? (
              <Card className={`p-6 ${allowModifications ? 'border-yellow-200' : 'border-green-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <AlertCircle className={`w-5 h-5 mr-2 ${allowModifications ? 'text-yellow-600' : 'text-green-600'}`} />
                    {allowModifications ? 'Override Mode Results' : 'Upload Results'}
                  </h2>
                  <button
                    onClick={() => setUploadResult(null)}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Clear
                  </button>
                </div>

                <div className={`rounded-lg p-4 ${
                  allowModifications 
                    ? 'bg-yellow-50 border border-yellow-200' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white rounded p-3">
                      <div className="font-medium text-gray-600">New Items</div>
                      <div className={`text-2xl font-bold ${allowModifications ? 'text-yellow-600' : 'text-green-600'}`}>
                        {uploadResult.summary.total_new}
                      </div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="font-medium text-gray-600">Modified Items</div>
                      <div className="text-2xl font-bold text-yellow-600">{uploadResult.summary.total_modified}</div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="font-medium text-gray-600">Unchanged Items</div>
                      <div className="text-2xl font-bold text-blue-600">{uploadResult.summary.total_unchanged}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white rounded p-3">
                      <div className="font-medium text-gray-700 mb-2">🚗 Drivers</div>
                      <div className="text-gray-600">New: {uploadResult.summary.drivers.new} | Modified: {uploadResult.summary.drivers.modified} | Unchanged: {uploadResult.summary.drivers.unchanged}</div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="font-medium text-gray-700 mb-2">🔧 Car Parts</div>
                      <div className="text-gray-600">New: {uploadResult.summary.car_parts.new} | Modified: {uploadResult.summary.car_parts.modified} | Unchanged: {uploadResult.summary.car_parts.unchanged}</div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="font-medium text-gray-700 mb-2">⚡ Boosts</div>
                      <div className="text-gray-600">New: {uploadResult.summary.boosts.new} | Modified: {uploadResult.summary.boosts.modified} | Unchanged: {uploadResult.summary.boosts.unchanged}</div>
                    </div>
                  </div>

                  {uploadResult.summary.total_modified > 0 && (
                    <div className="mt-4">
                      <details className="bg-white rounded p-3">
                        <summary className="cursor-pointer font-medium text-gray-700">
                          {allowModifications ? 'Applied Modifications' : 'Detected Modifications'}
                        </summary>
                        <div className="mt-2 space-y-4">
                          {/* User-friendly summary */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Summary of Changes:</h4>
                            <div className="space-y-2 text-sm">
                              {Object.entries(uploadResult.results).map(([category, data]: [string, any]) => (
                                data.modified_items && data.modified_items.length > 0 && (
                                  <div key={category} className="border-l-4 border-yellow-400 pl-3">
                                    <div className="font-medium text-gray-700 capitalize">{category.replace('_', ' ')}</div>
                                    <div className="text-gray-600">
                                      {data.modified_items.map((item: any, index: number) => (
                                        <div key={index} className="inline-block bg-gray-100 rounded px-2 py-1 mr-2 mb-1 text-xs">
                                          <span className="font-medium">{item.name || item.id || `Item ${index + 1}`}</span>
                                          {item.changes && item.changes.length > 0 && (
                                            <span className="ml-1 text-gray-500">
                                              - {item.changes.join(', ')}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                          
                          {/* Full JSON details */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Full Details:</h4>
                            <div className="text-sm text-gray-600 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
                              {JSON.stringify(uploadResult.results, null, 2)}
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className={`rounded-lg p-4 ${
                      allowModifications 
                        ? 'bg-yellow-50 border border-yellow-200' 
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <Eye className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          allowModifications ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                        <div>
                          <h4 className={`font-medium ${
                            allowModifications ? 'text-yellow-900' : 'text-blue-900'
                          }`}>
                            {allowModifications ? 'Override Mode Active' : 'Change Detection Mode'}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            allowModifications ? 'text-yellow-800' : 'text-blue-800'
                          }`}>
                            {allowModifications 
                              ? 'Modifications have been applied to existing items. Review the changes above.'
                              : 'Only new items were added. Existing items were not modified. Review the detected changes above.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Instructions
                  </h2>
                </div>

                <div className="text-sm text-gray-600 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Update Process:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Download latest content_cache.json from the game</li>
                      <li>Specify which seasons to import (e.g., "2,3,4,5" or "6")</li>
                      <li>Upload the file - system processes and imports new content only</li>
                      <li>Review change detection report for any data differences</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Season Filtering Examples:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded">2,3,4,5</code> - Import seasons 2, 3, 4, and 5</li>
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded">6</code> - Import only season 6</li>
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded">(empty)</code> - Import all seasons</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}