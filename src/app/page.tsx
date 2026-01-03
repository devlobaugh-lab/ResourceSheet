import Link from 'next/link'

export default function Home() {
  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to F1 Resource Manager
        </h2>
        <p className="text-xl text-gray-600">
          Manage your Formula 1 drivers, car parts, and boosts efficiently
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          href="/drivers" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Drivers</h3>
          <p className="text-gray-600">View and manage driver information and stats</p>
        </Link>
        
        <Link 
          href="/parts" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Car Parts</h3>
          <p className="text-gray-600">Browse available car parts and components</p>
        </Link>
        
        <Link 
          href="/boosts" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Boosts</h3>
          <p className="text-gray-600">Manage performance boosts and upgrades</p>
        </Link>
        
        <Link 
          href="/dashboard" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard</h3>
          <p className="text-gray-600">View analytics and manage resources</p>
        </Link>
      </div>
      
      <div className="mt-12 text-center">
        <Link 
          href="/compare" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Compare Resources
        </Link>
      </div>
    </div>
  )
}
