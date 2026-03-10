'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/components/auth/AuthContext';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading: authLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if we have a valid session from the reset link
  useEffect(() => {
    // The URL might have error params if the link is expired
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (errorParam) {
      setError(errorDescription || 'Invalid or expired reset link. Please request a new one.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Use the client-side supabase client
      const { supabase } = await import('@/lib/supabase');
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      setLoading(false);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to update password. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="flex justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Password updated!</h1>
            <p className="mt-2 text-gray-600">
              Your password has been successfully updated. Redirecting to your dashboard...
            </p>
          </div>

          <div className="text-center">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
              Go to dashboard now →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while auth initializes (detectSessionInUrl may still be resolving)
  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Set your password</h1>
          <p className="mt-2 text-gray-600">Enter a new password for your account</p>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
                {error.includes('expired') && (
                  <div className="mt-2">
                    <Link href="/auth/reset-password" className="text-blue-600 hover:underline">
                      Request a new reset link
                    </Link>
                  </div>
                )}
              </div>
            )}

            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
              autoComplete="new-password"
            />

            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loading}
              disabled={loading || !!searchParams.get('error')}
            >
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}