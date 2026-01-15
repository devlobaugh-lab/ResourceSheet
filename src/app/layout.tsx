import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { Providers } from './providers'
import { Button } from '@/components/ui/Button'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'F1 Resource Manager',
  description: 'Manage F1 resources, drivers, car parts, and boosts',
}

function Navigation() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              F1 Resource Manager
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/drivers" 
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Drivers
            </Link>
            <Link 
              href="/parts" 
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Car Parts
            </Link>
            <Link 
              href="/boosts" 
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Boosts
            </Link>
            <Link 
              href="/dashboard" 
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/compare" 
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Compare
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Link href="/auth/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register" className="hidden sm:block">
              <Button variant="primary" size="sm">
                Sign Up
              </Button>
            </Link>
            <Link href="/profile" className="hidden sm:block">
              <Button variant="outline" size="sm">
                Profile
              </Button>
            </Link>
            
            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-100">
        <div className="px-4 py-3 space-y-1">
          <Link 
            href="/drivers" 
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Drivers
          </Link>
          <Link 
            href="/parts" 
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Car Parts
          </Link>
          <Link 
            href="/boosts" 
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Boosts
          </Link>
          <Link 
            href="/dashboard" 
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Dashboard
          </Link>
          <Link 
            href="/compare" 
            className="block px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Compare
          </Link>
          <div className="pt-3 border-t border-gray-100 flex space-x-2">
            <Link href="/auth/login" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register" className="flex-1">
              <Button variant="primary" size="sm" className="w-full">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
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
