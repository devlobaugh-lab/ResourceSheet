import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        variantStyles[variant],
        className
      )}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1rem' : undefined),
      }}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton width={160} height={20} variant="rectangular" />
          <Skeleton width={100} height={14} />
        </div>
        <Skeleton width={60} height={24} variant="rectangular" />
      </div>
      
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="flex justify-between">
          <Skeleton width={80} height={16} />
          <Skeleton width={60} height={16} />
        </div>
        <div className="flex justify-between">
          <Skeleton width={70} height={16} />
          <Skeleton width={50} height={16} />
        </div>
        <div className="flex justify-between">
          <Skeleton width={90} height={16} />
          <Skeleton width={70} height={16} />
        </div>
      </div>
      
      <div className="flex space-x-2 pt-4 border-t border-gray-100">
        <Skeleton width={80} height={36} variant="rectangular" />
        <Skeleton width={100} height={36} variant="rectangular" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
          <Skeleton width={48} height={48} variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={16} variant="rectangular" />
            <Skeleton width="40%" height={12} variant="rectangular" />
          </div>
          <Skeleton width={80} height={24} variant="rectangular" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <Skeleton width={96} height={96} variant="circular" className="mx-auto mb-4" />
      <Skeleton width={160} height={24} variant="rectangular" className="mx-auto mb-2" />
      <Skeleton width={200} height={16} variant="rectangular" className="mx-auto mb-4" />
      <Skeleton width={100} height={28} variant="rectangular" className="mx-auto" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
            <Skeleton width={40} height={32} variant="rectangular" className="mx-auto mb-2" />
            <Skeleton width={60} height={12} variant="rectangular" className="mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <Skeleton width={200} height={24} variant="rectangular" />
      
      <div className="space-y-4">
        <div>
          <Skeleton width={100} height={16} className="mb-2" />
          <Skeleton width="100%" height={40} variant="rectangular" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton width={60} height={16} className="mb-2" />
            <Skeleton width="100%" height={40} variant="rectangular" />
          </div>
          <div>
            <Skeleton width={80} height={16} className="mb-2" />
            <Skeleton width="100%" height={40} variant="rectangular" />
          </div>
        </div>
      </div>
      
      <Skeleton width={120} height={40} variant="rectangular" />
    </div>
  );
}