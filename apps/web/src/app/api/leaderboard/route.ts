import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'https://mj-skill-rating.vercel.app'

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    )
  }
}