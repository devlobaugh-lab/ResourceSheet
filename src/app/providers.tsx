'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { AuthProvider } from '@/components/auth/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'
import { CollectionsProvider } from '@/lib/collectionsContext'
import { SeasonProvider } from '@/contexts/SeasonContext'
import { NewSeasonModal } from '@/components/NewSeasonModal'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <CollectionsProvider>
            <SeasonProvider>
              {children}
              <NewSeasonModal />
            </SeasonProvider>
          </CollectionsProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
