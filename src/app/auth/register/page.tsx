'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  return (
    <>
      {/* Title section at top */}
      <div className="pb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">F1 Resource Manager</h1>
        <p className="mt-2 text-gray-600">Invite Only</p>
      </div>

      {/* Card section */}
      <div className="flex justify-center px-4 sm:px-6 lg:px-8">
        <Card className="p-8 w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Registration Required</h3>
            <p className="mt-2 text-sm text-gray-600">
              This application is invite-only. To create an account, please contact an administrator.
            </p>
          </div>

          <div className="mt-6">
            <Link href="/auth/login" className="block text-center">
              <Button variant="outline" className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}