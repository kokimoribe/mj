import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/games/[gameId]/hands - Get all hands for a game
export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const supabase = await createClient();
    const { gameId } = params;

    // Fetch hands with actions
    const { data: hands, error } = await supabase
      .from("hands")
      .select(
        `
        *,
        hand_actions (
          *,
          player:players (
            id,
            display_name
          )
        )
      `
      )
      .eq("game_id", gameId)
      .order("hand_number", { ascending: true });

    if (error) {
      console.error("Error fetching hands:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Determine data quality
    const dataQuality =
      !hands || hands.length === 0
        ? "final_only"
        : hands.length < 8
          ? "partial"
          : "complete";

    // Transform hands for frontend
    const transformedHands = (hands || []).map(hand => ({
      hand_id: hand.id,
      hand_number: hand.hand_number,
      round: `${hand.wind_round.toUpperCase()} ${hand.round_number}`,
      outcome: hand.outcome_type,
      winner: getWinnerFromActions(hand.hand_actions),
      points: getPointsFromActions(hand.hand_actions),
      scores_after: hand.scores_after,
      riichi_players: getRiichiPlayers(hand.hand_actions),
      tenpai_players: getTenpaiPlayers(hand.hand_actions),
      honba: hand.honba_count,
      riichi_pot: hand.riichi_pot_before,
      dealer_seat: hand.dealer_seat,
      created_at: hand.created_at,
    }));

    return NextResponse.json({
      hands: transformedHands,
      dataQuality,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/games/[gameId]/hands - Record a new hand
export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const supabase = await createClient();
    const { gameId } = params;
    const body = await request.json();

    const {
      wind_round,
      round_number,
      honba_count,
      outcome_type,
      dealer_seat,
      actions,
      completed_at,
      notes,
    } = body;

    // Validate required fields
    if (
      !wind_round ||
      !round_number ||
      !outcome_type ||
      !dealer_seat ||
      !actions
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate point balance
    const totalPoints = actions.reduce(
      (sum: number, action: any) => sum + (action.points_delta || 0),
      0
    );

    if (Math.abs(totalPoints) > 0.01) {
      // Allow for floating point errors
      return NextResponse.json(
        { message: `Points do not balance to zero (${totalPoints})` },
        { status: 400 }
      );
    }

    // Get current game state
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select(
        `
        *,
        game_seats (
          *,
          player:players (
            id,
            display_name
          )
        )
      `
      )
      .eq("id", gameId)
      .single();

    if (gameError || !gameData) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Get the last hand number
    const { data: lastHand } = await supabase
      .from("hands")
      .select("hand_number, scores_after, riichi_pot_before")
      .eq("game_id", gameId)
      .order("hand_number", { ascending: false })
      .limit(1)
      .single();

    const hand_number = lastHand ? lastHand.hand_number + 1 : 1;

    // Calculate scores after this hand
    const startingScores =
      lastHand?.scores_after ||
      gameData.game_seats.reduce((acc: any, seat: any) => {
        acc[seat.player.id] = 25000; // Default starting score
        return acc;
      }, {});

    const scores_after = { ...startingScores };
    actions.forEach((action: any) => {
      if (action.points_delta && action.player_id) {
        scores_after[action.player_id] =
          (scores_after[action.player_id] || 0) + action.points_delta;
      }
    });

    // Calculate riichi pot after (starts with previous pot)
    let riichi_pot_after = lastHand?.riichi_pot_before || 0;
    actions.forEach((action: any) => {
      riichi_pot_after += action.riichi_stick_delta || 0;
    });

    // Check for tobi (bankruptcy)
    const tobiPlayer = Object.entries(scores_after).find(
      ([_, score]) => (score as number) < 0
    );

    // Start a transaction
    const { data: hand, error: handError } = await supabase
      .from("hands")
      .insert({
        game_id: gameId,
        hand_number,
        wind_round,
        round_number,
        honba_count: honba_count || 0,
        riichi_pot_before: lastHand?.riichi_pot_before || 0,
        outcome_type,
        dealer_seat,
        scores_after,
        completed_at: completed_at || new Date().toISOString(),
        notes,
      })
      .select()
      .single();

    if (handError) {
      console.error("Error creating hand:", handError);
      return NextResponse.json({ error: handError.message }, { status: 500 });
    }

    // Insert hand actions
    const handActions = actions.map((action: any, index: number) => ({
      hand_id: hand.id,
      player_id: action.player_id,
      action_type: action.action_type,
      action_order: action.action_order || index + 1,
      points_delta: action.points_delta,
      riichi_stick_delta: action.riichi_stick_delta || 0,
      honba_stick_delta: action.honba_stick_delta || 0,
      target_player_id: action.target_player_id,
      details: action.details || {},
    }));

    const { error: actionsError } = await supabase
      .from("hand_actions")
      .insert(handActions);

    if (actionsError) {
      console.error("Error creating hand actions:", actionsError);
      // Rollback by deleting the hand
      await supabase.from("hands").delete().eq("id", hand.id);
      return NextResponse.json(
        { error: actionsError.message },
        { status: 500 }
      );
    }

    // Determine next dealer
    const dealerWon = actions.some(
      (a: any) =>
        a.action_type === "win" &&
        a.player_id ===
          gameData.game_seats.find((s: any) => s.seat === dealer_seat)?.player
            .id
    );

    const next_dealer = getNextDealer(dealer_seat, outcome_type, dealerWon);

    // Calculate next honba
    const next_honba =
      dealerWon || outcome_type === "exhaustive_draw"
        ? (honba_count || 0) + 1
        : 0;

    // Update game status if tobi
    if (tobiPlayer) {
      await supabase
        .from("games")
        .update({
          status: "finished",
          finished_at: new Date().toISOString(),
        })
        .eq("id", gameId);
    }

    return NextResponse.json({
      hand_id: hand.id,
      hand_number: hand.hand_number,
      scores_after,
      next_dealer,
      honba_count: next_honba,
      riichi_pot: riichi_pot_after,
      game_ended: !!tobiPlayer,
      end_reason: tobiPlayer ? "tobi" : undefined,
      replay_hand: outcome_type === "chombo",
      wind_round: wind_round,
      round_number: round_number,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions
function getWinnerFromActions(actions: any[]) {
  const winAction = actions?.find(a => a.action_type === "win");
  return winAction?.player?.display_name || null;
}

function getPointsFromActions(actions: any[]) {
  const winAction = actions?.find(a => a.action_type === "win");
  return winAction?.points_delta || 0;
}

function getRiichiPlayers(actions: any[]) {
  return (
    actions?.filter(a => a.action_type === "riichi").map(a => a.player_id) || []
  );
}

function getTenpaiPlayers(actions: any[]) {
  return (
    actions?.filter(a => a.action_type === "tenpai").map(a => a.player_id) || []
  );
}

function getNextDealer(
  currentDealer: string,
  outcome: string,
  dealerWon: boolean
): string {
  // Dealer continues if they won or chombo
  if (dealerWon || outcome === "chombo") {
    return currentDealer;
  }

  // Rotate counter-clockwise
  const rotation: Record<string, string> = {
    east: "south",
    south: "west",
    west: "north",
    north: "east",
  };

  return rotation[currentDealer] || "east";
}
