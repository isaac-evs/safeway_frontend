'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken')
    
    if (!authToken) {
      // Redirect to login if no token found
      router.push('/login')
    } else {
      setIsAuthenticated(true)
    }
    
    setLoading(false)
  }, [router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  // If authenticated, render children
  return isAuthenticated ? <>{children}</> : null
} 