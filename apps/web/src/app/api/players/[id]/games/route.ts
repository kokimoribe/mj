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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Convert player_id to display_name
    const playerName = playerId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    
    // Get player's internal ID
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('id')
      .eq('display_name', playerName)
      .single()
    
    if (playerError || !playerData) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }
    
    // Get player's current rating
    const { data: leaderboardData } = await supabase
      .from('current_leaderboard')
      .select('display_rating')
      .eq('display_name', playerName)
      .single()
    
    const currentRating = parseFloat(leaderboardData?.display_rating || '25.0')
    
    // Get player's recent games with all seats data
    const { data: gamesData, error: gamesError } = await supabase
      .from('game_seats')
      .select(`
        *,
        games!inner (
          id,
          started_at,
          created_at
        )
      `)
      .eq('player_id', playerData.id)
      .order('games(started_at)', { ascending: false })
      .limit(limit)
    
    if (gamesError) {
      console.error('Error fetching games:', gamesError)
      return NextResponse.json([])
    }
    
    if (!gamesData || gamesData.length === 0) {
      return NextResponse.json([])
    }
    
    // Get all game IDs to fetch complete game data
    const gameIds = [...new Set(gamesData.map(g => g.game_id))]
    
    // Fetch complete game data with all players
    const { data: completeGames } = await supabase
      .from('games')
      .select(`
        id,
        started_at,
        created_at,
        game_seats (
          player_id,
          placement,
          final_score,
          players (
            display_name
          )
        )
      `)
      .in('id', gameIds)
    
    // Format the games
    const games = []
    
    for (const gameData of gamesData) {
      const completeGame = completeGames?.find(g => g.id === gameData.game_id)
      if (!completeGame) continue
      
      // Get opponents data
      const opponents = completeGame.game_seats
        .filter((seat: any) => seat.player_id !== playerData.id && seat.placement)
        .map((seat: any) => ({
          name: seat.players.display_name,
          placement: seat.placement,
          score: seat.final_score || 0
        }))
        .sort((a: any, b: any) => a.placement - b.placement)
      
      const placement = gameData.placement
      
      // Skip if no valid placement
      if (!placement || placement < 1 || placement > 4) continue
      
      // Calculate plus/minus
      const score = gameData.final_score || 0
      const uma = [15, 5, -5, -15][placement - 1]
      const plusMinus = Math.round((score - 25000) / 1000) + uma
      
      // Mock rating change (would need rating history for real data)
      const ratingChange = [0.8, 0.3, -0.2, -0.9][placement - 1]
      
      games.push({
        id: completeGame.id,
        date: completeGame.started_at || completeGame.created_at,
        placement,
        score,
        plusMinus,
        ratingBefore: currentRating - ratingChange,
        ratingAfter: currentRating,
        ratingChange,
        opponents
      })
    }
    
    return NextResponse.json(games)
  } catch (error) {
    console.error('Error fetching player games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player games' },
      { status: 500 }
    )
  }
}