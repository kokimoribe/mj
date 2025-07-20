import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playerId } = await params
    
    // Convert player_id to display_name (e.g., "joseph" -> "Joseph")
    const playerName = playerId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    
    // Get player info from current_leaderboard view
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('current_leaderboard')
      .select('*')
      .eq('display_name', playerName)
      .single()
    
    if (leaderboardError || !leaderboardData) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }
    
    // Get player's last game date
    const { data: playerData } = await supabase
      .from('players')
      .select('id')
      .eq('display_name', playerName)
      .single()
    
    let lastGameDate = new Date().toISOString()
    
    if (playerData) {
      const { data: lastGame } = await supabase
        .from('game_seats')
        .select('games(started_at)')
        .eq('player_id', playerData.id)
        .order('game_id', { ascending: false })
        .limit(1)
        .single()
      
      if (lastGame && typeof lastGame === 'object' && 'games' in lastGame) {
        const games = lastGame.games as { started_at?: string }
        if (games?.started_at) {
          lastGameDate = games.started_at
        }
      }
    }
    
    // Format the response
    const player = {
      id: playerId,
      name: playerName,
      rating: parseFloat(leaderboardData.display_rating || '25.0'),
      mu: 25.0, // Default values as these aren't in the view
      sigma: 8.33,
      games: leaderboardData.games_played || 0,
      lastGameDate,
      totalPlusMinus: leaderboardData.total_plus_minus || 0,
      averagePlusMinus: leaderboardData.average_plus_minus || 0,
      bestGame: 0, // TODO: Calculate from game history
      worstGame: 0, // TODO: Calculate from game history
      ratingChange: 0 // TODO: Calculate from recent games
    }
    
    return NextResponse.json(player)
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    )
  }
}