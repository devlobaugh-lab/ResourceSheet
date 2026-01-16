import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ClientNavigation } from './client-navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'F1 Resource Manager',
  description: 'Manage F1 resources, drivers, car parts, and boosts',
}

function Navigation() {
  return <ClientNavigation />
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main>
              <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>

          </div>
        </Providers>
      </body>
    </html>
  )
}
