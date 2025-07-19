'use client'

import { useState, useEffect } from 'react'

export default function ApiTestPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mj-skill-rating.vercel.app'
    console.log('Testing API URL:', apiUrl)
    
    fetch(`${apiUrl}/leaderboard`)
      .then(res => {
        console.log('Response status:', res.status)
        console.log('Response headers:', res.headers)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        console.log('Data received:', data)
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Fetch error:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Direct Test</h1>
      <p className="mb-4">API URL: {process.env.NEXT_PUBLIC_API_URL || 'https://mj-skill-rating.vercel.app'}</p>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {data && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}