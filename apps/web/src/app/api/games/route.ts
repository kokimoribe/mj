import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = await createClient()
  
  const { data: games, error } = await supabase
    .from('games')
    .select(`
      id,
      created_at,
      player1_id,
      player2_id,
      player3_id,
      player4_id,
      player1_score,
      player2_score,
      player3_score,
      player4_score,
      player1:players!player1_id(id, name),
      player2:players!player2_id(id, name),
      player3:players!player3_id(id, name),
      player4:players!player4_id(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ games })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { data: game, error } = await supabase
    .from('games')
    .insert({
      player1_id: body.player1_id,
      player2_id: body.player2_id,
      player3_id: body.player3_id,
      player4_id: body.player4_id,
      player1_score: body.player1_score,
      player2_score: body.player2_score,
      player3_score: body.player3_score,
      player4_score: body.player4_score,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Trigger rating recalculation
  try {
    await fetch('https://mj-skill-rating.vercel.app/materialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    console.error('Failed to trigger rating recalculation:', err)
  }

  return NextResponse.json({ game })
}