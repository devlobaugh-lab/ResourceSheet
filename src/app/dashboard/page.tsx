'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/components/auth/AuthContext'
import { 
  Edit3, 
  Users, 
  Settings, 
  Zap, 
  Map, 
  Calendar,
  BarChart3,
  TrendingUp,
  ChevronRight
} from 'lucide-react'

// Quick action cards for the dashboard
const quickActions = [
  {
    title: 'Data Input',
    description: 'Add or update your drivers, car parts, and boosts',
    href: '/data-input',
    icon: Edit3,
    color: 'bg-blue-50 text-blue-600',
    hoverColor: 'hover:bg-blue-100'
  },
  {
    title: 'GP Guides',
    description: 'Plan your Grand Prix weekend strategies',
    href: '/gp-guides',
    icon: Calendar,
    color: 'bg-green-50 text-green-600',
    hoverColor: 'hover:bg-green-100'
  },
  {
    title: 'Car Setups',
    description: 'Configure and compare car setups',
    href: '/setups',
    icon: Settings,
    color: 'bg-purple-50 text-purple-600',
    hoverColor: 'hover:bg-purple-100'
  },
  {
    title: 'Track Guides',
    description: 'View and manage track-specific strategies',
    href: '/track-guides',
    icon: Map,
    color: 'bg-orange-50 text-orange-600',
    hoverColor: 'hover:bg-orange-100'
  },
]

// Reference links
const referenceLinks = [
  { title: 'Drivers', href: '/drivers', icon: Users },
  { title: 'Car Parts', href: '/parts', icon: Settings },
  { title: 'Boosts', href: '/boosts', icon: Zap },
  { title: 'Tracks', href: '/tracks', icon: Map },
  { title: 'Driver Compare', href: '/compare/drivers', icon: BarChart3 },
  { title: 'AI Compare', href: '/compare/ai', icon: TrendingUp },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your F1 Manager resources and strategies
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.href} href={action.href}>
                    <Card className={`p-5 h-full transition-all duration-200 hover:shadow-md cursor-pointer ${action.hoverColor}`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg ${action.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{action.description}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reference Links */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Reference</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {referenceLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link key={link.href} href={link.href}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex items-center gap-1 flex-1">
                            <span className="font-medium text-gray-700">{link.title}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* Tips/Info Card */}
            <div>
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">💡 Pro Tip</h2>
                <p className="text-sm text-gray-700 mb-4">
                  Use GP Guides to plan your entire race weekend. Import track guides 
                  to quickly set up strategies for each track.
                </p>
                <Link href="/gp-guides">
                  <Button variant="outline" size="sm" className="w-full">
                    View GP Guides
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}