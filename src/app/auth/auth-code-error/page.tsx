'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function AuthCodeErrorContent() {
  const [description, setDescription] = useState('');

  useEffect(() => {
    // Error details arrive in the URL hash (client-side only)
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const desc = params.get('error_description');
    if (desc) setDescription(decodeURIComponent(desc.replace(/\+/g, ' ')));
  }, []);

  return (
    <div className="flex justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Authentication error</h1>
          <p className="mt-2 text-gray-600">There was a problem with your link.</p>
        </div>
        <Card className="p-8 space-y-4">
          {description && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {description}
            </p>
          )}
          <p className="text-sm text-gray-600">
            The link may have expired or already been used. You can request a new one below, or
            contact an admin to generate a fresh invite link.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/auth/reset-password" className="flex-1">
              <Button variant="outline" className="w-full">
                Request new link
              </Button>
            </Link>
            <Link href="/auth/login" className="flex-1">
              <Button className="w-full">Back to login</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense>
      <AuthCodeErrorContent />
    </Suspense>
  );
}
