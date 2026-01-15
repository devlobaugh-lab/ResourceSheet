'use client'

import { useEffect, useState } from 'react'

export function AuthDebug() {
  const [localStorageData, setLocalStorageData] = useState<Record<string, any>>({})
  const [authHeaders, setAuthHeaders] = useState<Record<string, string>>({})

  useEffect(() => {
    // Get all localStorage data
    const data: Record<string, any> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '{}')
        } catch {
          data[key] = localStorage.getItem(key)
        }
      }
    }
    setLocalStorageData(data)

    // Simulate getAuthHeaders logic
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Try to get JWT token from Supabase's session storage
    try {
      // Supabase stores session in localStorage with a key like 'sb-[project-ref]-auth-token'
      const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase') && key.includes('auth'))
      for (const key of supabaseKeys) {
        const sessionData = localStorage.getItem(key)
        if (sessionData) {
          const session = JSON.parse(sessionData)
          const accessToken = session?.access_token
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`
            break // Use the first valid token found
          }
        }
      }

      // Also try the direct supabase.auth.token key as fallback
      const fallbackSession = localStorage.getItem('supabase.auth.token')
      if (fallbackSession && !headers['Authorization']) {
        const parsedSession = JSON.parse(fallbackSession)
        const accessToken = parsedSession?.access_token
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`
        }
      }
    } catch (error) {
      console.warn('Failed to get auth token from localStorage:', error)
    }

    setAuthHeaders(headers)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg max-w-md max-h-96 overflow-auto z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>

      <div className="mb-4">
        <h4 className="font-semibold">Auth Headers:</h4>
        <pre className="text-xs bg-gray-800 p-2 rounded">
          {JSON.stringify(authHeaders, null, 2)}
        </pre>
      </div>

      <div>
        <h4 className="font-semibold">localStorage Keys:</h4>
        <ul className="text-xs">
          {Object.keys(localStorageData).map(key => (
            <li key={key} className="truncate">
              {key}: {typeof localStorageData[key] === 'object' ? '[object]' : String(localStorageData[key]).substring(0, 50)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
