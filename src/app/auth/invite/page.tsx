'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

function InvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const tokenHash = searchParams.get('th');

    if (!tokenHash) {
      setStatus('error');
      setErrorMessage('Invalid invite link. The link may be missing required parameters.');
      return;
    }

    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: 'recovery' })
      .then(({ error }) => {
        if (error) {
          setStatus('error');
          setErrorMessage(
            error.message.toLowerCase().includes('expired')
              ? 'This invite link has expired or has already been used. Ask an admin to generate a new one.'
              : `Could not verify invite link: ${error.message}`
          );
        } else {
          router.replace('/auth/update-password');
        }
      });
  }, [searchParams, router]);

  if (status === 'verifying') {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Verifying your invite link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Invite link invalid</h1>
        </div>
        <Card className="p-8">
          <p className="text-red-600 text-sm mb-6">{errorMessage}</p>
          <div className="text-center">
            <Link href="/auth/login">
              <Button variant="outline">Back to login</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense>
      <InvitePageContent />
    </Suspense>
  );
}
