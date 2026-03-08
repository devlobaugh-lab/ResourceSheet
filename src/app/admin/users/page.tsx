'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ui/Toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthHeaders } from '@/hooks/useApi';
import Link from 'next/link';
import { Users, UserPlus, Edit, Trash2, UserX, UserCheck, AlertTriangle, X } from 'lucide-react';

interface User {
  id: string;
  email: string | null;
  username: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  email: string;
  username: string;
  is_admin: boolean;
}

const initialFormData: FormData = {
  email: '',
  username: '',
  is_admin: false,
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if current user is admin
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['user-profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const response = await fetch(`/api/profiles/${currentUser.id}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000
  });

  const isAdmin = profile?.is_admin === true;

  // Fetch all users
  const { data: usersData, isLoading: isUsersLoading, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users', {
        headers: await getAuthHeaders(),
        credentials: 'same-origin'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch users');
      }
      return response.json();
    },
    enabled: isAdmin,
  });

  const users = usersData?.users || [];

  const openAddModal = () => {
    setFormData(initialFormData);
    setShowAddModal(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || '',
      username: user.username || '',
      is_admin: user.is_admin || false,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
    setFormData(initialFormData);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          ...await getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ email: formData.email, username: formData.username, is_admin: formData.is_admin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create user');
      }

      toast.addToast(data.message || 'User created successfully', 'success');
      closeModal();
      refetchUsers();
    } catch (error) {
      toast.addToast(error instanceof Error ? error.message : 'Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          ...await getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: formData.username || null,
          is_admin: formData.is_admin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to update user');
      }

      toast.addToast('User updated successfully', 'success');
      closeModal();
      refetchUsers();
      
      // If editing own user, refresh profile
      if (selectedUser.id === currentUser?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      }
    } catch (error) {
      toast.addToast(error instanceof Error ? error.message : 'Failed to update user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    const action = user.is_active ? 'deactivate' : 'reactivate';
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          ...await getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `Failed to ${action} user`);
      }

      toast.addToast(`User ${action}d successfully`, 'success');
      refetchUsers();
    } catch (error) {
      toast.addToast(error instanceof Error ? error.message : `Failed to ${action} user`, 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to delete user');
      }

      toast.addToast('User deleted successfully', 'success');
      closeModal();
      refetchUsers();
    } catch (error) {
      toast.addToast(error instanceof Error ? error.message : 'Failed to delete user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Show loading state while checking admin status
  if (isProfileLoading && currentUser?.id) {
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
            <Link href="/admin">
              <Button>Back to Admin</Button>
            </Link>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="mt-2 text-gray-600">Manage user accounts and permissions</p>
              </div>
              <div className="flex items-center space-x-3">
                <Link href="/admin">
                  <Button variant="outline">Back to Admin</Button>
                </Link>
                <Button onClick={openAddModal}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <Card className="overflow-hidden">
            {isUsersLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : usersError ? (
              <div className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 mb-2">Error loading users</p>
                <p className="text-sm text-gray-500 mb-4">{usersError instanceof Error ? usersError.message : 'Unknown error'}</p>
                <Button variant="outline" onClick={() => refetchUsers()}>
                  Try Again
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found</p>
                {profile && (
                  <p className="text-xs text-gray-400 mt-2">Debug: Admin check passed for {profile.email}</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user: User) => (
                      <tr 
                        key={user.id} 
                        className={`hover:bg-gray-50 ${!user.is_active ? 'bg-gray-100' : ''} ${user.id === currentUser?.id ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {(user.username || user.email)?.[0]?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username || '—'}
                              </div>
                              {user.id === currentUser?.id && (
                                <span className="text-xs text-blue-600">(You)</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.is_admin ? 'warning' : 'default'}>
                            {user.is_admin ? 'Admin' : 'Normal'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.is_active ? 'success' : 'error'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(user)}
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(user)}
                              title={user.is_active ? 'Deactivate user' : 'Reactivate user'}
                              disabled={user.id === currentUser?.id}
                            >
                              {user.is_active ? (
                                <UserX className="w-4 h-4 text-orange-600" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(user)}
                              title="Delete user"
                              className="text-red-600 hover:text-red-800"
                              disabled={user.id === currentUser?.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Info Card */}
          <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Adding Users</h4>
                <p>When you add a user, they will receive an email to set their password. The account is created immediately and ready to use once they set their password.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Deactivating vs Deleting</h4>
                <p>
                  <strong>Deactivate</strong> when you want to temporarily prevent access. The user0027s data is preserved.
                  <br />
                  <strong>Delete</strong> permanently removes the user and all their data. This cannot be undone.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Optional)
                  </label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Type
                  </label>
                  <select
                    value={formData.is_admin ? 'admin' : 'normal'}
                    onChange={(e) => setFormData({ ...formData, is_admin: e.target.value === 'admin' })}
                    className="w-full rounded-lg border-gray-300 px-3 py-2 bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" type="button" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedUser.email}
                </p>
              </div>

              <form onSubmit={handleEditUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Type
                  </label>
                  {selectedUser.id === currentUser?.id ? (
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                      {selectedUser.is_admin ? 'Admin' : 'Normal'}
                      <span className="text-xs block text-gray-400 mt-1">You cannot change your own admin status</span>
                    </div>
                  ) : (
                    <select
                      value={formData.is_admin ? 'admin' : 'normal'}
                      onChange={(e) => setFormData({ ...formData, is_admin: e.target.value === 'admin' })}
                      className="w-full rounded-lg border-gray-300 px-3 py-2 bg-white"
                    >
                      <option value="normal">Normal</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" type="button" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Delete User Account?
              </h2>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ This action cannot be undone!
                </p>
                <p className="text-sm text-red-700">
                  You are about to permanently delete the account for:
                </p>
                <p className="text-sm font-medium text-red-900 mt-2">
                  {selectedUser.username || selectedUser.email}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {selectedUser.email}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">
                  Consider deactivating the user instead if you want to preserve their data and potentially restore access later.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    closeModal();
                    handleToggleActive(selectedUser);
                  }}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  Deactivate Instead
                </Button>
                <Button
                  onClick={handleDeleteUser}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}