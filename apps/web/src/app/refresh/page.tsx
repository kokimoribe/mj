'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RefreshPage() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const handleRefresh = () => {
    // Clear all query cache
    queryClient.clear()
    
    // Redirect to home
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Clear Cache & Refresh</h1>
        <p className="text-muted-foreground">
          Click the button below to clear all cached data and reload the app
        </p>
        <Button onClick={handleRefresh} size="lg">
          <RefreshCw className="mr-2 h-4 w-4" />
          Clear Cache & Go Home
        </Button>
      </div>
    </div>
  )
}