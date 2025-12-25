import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  calculateRonPoints,
  calculateTsumoPoints,
  calculateRonDeltas,
  calculateTsumoDeltas,
  RIICHI_BET,
  type Seat,
} from "@/lib/mahjong";

interface RouteContext {
  params: Promise<{ gameId: string }>;
}

export type EventType = "tsumo" | "ron" | "draw" | "abortive_draw" | "chombo";

export type AbortiveDrawType =
  | "kyuushu_kyuuhai"
  | "suufon_renda"
  | "suucha_riichi"
  | "suukan_sanra"
  | "sanchahou";

export interface RecordHandRequest {
  eventType: EventType;
  round: "E" | "S" | "W" | "N";
  kyoku: 1 | 2 | 3 | 4;
  honba: number;
  // For wins (ron/tsumo)
  winnerSeat?: Seat;
  han?: number;
  fu?: number;
  // For ron specifically
  loserSeat?: Seat;
  // Riichi declarations for this hand
  riichiDeclarations?: Seat[];
  // Number of riichi sticks on the table (from previous hands)
  riichiSticks?: number;
  // Current dealer seat
  dealerSeat: Seat;
  // Optional yaku list for record keeping
  yakuList?: string[];
  // For abortive draws
  abortiveDrawType?: AbortiveDrawType;
  // For draws: which players are in tenpai
  tenpaiSeats?: Seat[];
}

export interface HandEventResponse {
  handSeq: number;
  events: {
    seat: Seat;
    eventType: EventType;
    pointsDelta: number;
    riichiDeclared: boolean;
  }[];
  pointsWon?: number;
  tier?: string;
}

/**
 * GET /api/games/[gameId]/hands - Get all hands for a game
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { gameId } = await context.params;
    const supabase = await createClient();

    const { data: hands, error } = await supabase
      .from("hand_events")
      .select("*")
      .eq("game_id", gameId)
      .order("hand_seq", { ascending: true })
      .order("seat", { ascending: true });

    if (error) {
      console.error("Failed to fetch hands:", error);
      return NextResponse.json(
        { error: "Failed to fetch hands" },
        { status: 500 }
      );
    }

    // Group by hand_seq
    const groupedHands: Record<
      number,
      {
        handSeq: number;
        round: string;
        kyoku: number;
        honba: number;
        events: typeof hands;
      }
    > = {};

    for (const hand of hands || []) {
      if (!groupedHands[hand.hand_seq]) {
        groupedHands[hand.hand_seq] = {
          handSeq: hand.hand_seq,
          round: hand.round_kanji,
          kyoku: hand.kyoku,
          honba: hand.honba,
          events: [],
        };
      }
      groupedHands[hand.hand_seq].events.push(hand);
    }

    return NextResponse.json({
      hands: Object.values(groupedHands).sort((a, b) => a.handSeq - b.handSeq),
    });
  } catch (error) {
    console.error("Error fetching hands:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/[gameId]/hands - Record a new hand result
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { gameId } = await context.params;
    const supabase = await createClient();
    const body: RecordHandRequest = await request.json();

    // Validate required fields
    if (!body.eventType || !body.round || !body.kyoku || !body.dealerSeat) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate win-specific fields
    if (body.eventType === "ron" || body.eventType === "tsumo") {
      if (!body.winnerSeat || !body.han || !body.fu) {
        return NextResponse.json(
          { error: "Winner seat, han, and fu are required for wins" },
          { status: 400 }
        );
      }
      if (body.eventType === "ron" && !body.loserSeat) {
        return NextResponse.json(
          { error: "Loser seat is required for ron" },
          { status: 400 }
        );
      }
    }

    // Validate chombo-specific fields
    if (body.eventType === "chombo") {
      if (!body.loserSeat) {
        return NextResponse.json(
          { error: "Loser seat (offender) is required for chombo" },
          { status: 400 }
        );
      }
    }

    // Get the next hand sequence number
    const { data: maxSeqResult } = await supabase
      .from("hand_events")
      .select("hand_seq")
      .eq("game_id", gameId)
      .order("hand_seq", { ascending: false })
      .limit(1)
      .single();

    const nextSeq = (maxSeqResult?.hand_seq || 0) + 1;

    // Calculate point deltas based on event type
    const seats: Seat[] = ["east", "south", "west", "north"];
    const deltas: Record<string, number> = {
      east: 0,
      south: 0,
      west: 0,
      north: 0,
    };
    let pointsWon = 0;
    let tier: string | undefined;

    const riichiDeclarations = body.riichiDeclarations || [];
    const riichiSticks = body.riichiSticks || 0;
    const honba = body.honba || 0;

    // Handle riichi declarations (each player declaring riichi loses 1000)
    for (const seat of riichiDeclarations) {
      deltas[seat] -= RIICHI_BET;
    }

    // Total riichi sticks for winner to collect:
    // - Existing sticks from previous draws/hands
    // - Plus newly declared riichi sticks from this hand (winner collects all)
    const totalRiichiSticks = riichiSticks + riichiDeclarations.length;

    switch (body.eventType) {
      case "ron": {
        const isWinnerDealer = body.winnerSeat === body.dealerSeat;
        const result = calculateRonPoints(
          body.han!,
          body.fu!,
          isWinnerDealer,
          honba
        );
        pointsWon = result.total;
        tier = result.tier;

        const ronDeltas = calculateRonDeltas(
          body.winnerSeat!,
          body.loserSeat!,
          result.total,
          totalRiichiSticks
        );

        // Add ron deltas to existing deltas (from riichi)
        for (const seat of seats) {
          deltas[seat] += ronDeltas[seat];
        }
        break;
      }

      case "tsumo": {
        const isWinnerDealer = body.winnerSeat === body.dealerSeat;
        const result = calculateTsumoPoints(
          body.han!,
          body.fu!,
          isWinnerDealer,
          honba
        );
        pointsWon = result.total;
        tier = result.tier;

        const tsumoDeltas = calculateTsumoDeltas(
          body.winnerSeat!,
          body.dealerSeat,
          result,
          totalRiichiSticks
        );

        // Add tsumo deltas to existing deltas (from riichi)
        for (const seat of seats) {
          deltas[seat] += tsumoDeltas[seat];
        }
        break;
      }

      case "draw":
      case "abortive_draw": {
        // In a draw, riichi sticks stay on the table
        // The riichi declarations were already subtracted above (lines 192-194)
        // Handle tenpai payments ONLY if not all players are in tenpai
        // If all 4 players are in tenpai, no no-ten payments are made
        const tenpaiSeats = body.tenpaiSeats || [];

        // Explicitly check: if all 4 players are in tenpai, skip tenpai payments
        // Only riichi declarations affect points in this case
        if (tenpaiSeats.length === 4) {
          // All players in tenpai: no no-ten payments
          // Only riichi declarations (already handled above) affect points
          break;
        }

        // Only process tenpai payments if there are non-tenpai players
        // (i.e., when tenpaiSeats.length is 1, 2, or 3)
        if (tenpaiSeats.length > 0 && tenpaiSeats.length < 4) {
          const nonTenpaiSeats = seats.filter(
            seat => !tenpaiSeats.includes(seat)
          );

          if (tenpaiSeats.length === 1) {
            // 1 player in tenpai: gets 3000 total (1000 from each of the 3 other players)
            const tenpaiSeat = tenpaiSeats[0];
            deltas[tenpaiSeat] += 3000;
            for (const seat of nonTenpaiSeats) {
              deltas[seat] -= 1000;
            }
          } else if (tenpaiSeats.length === 2) {
            // 2 players in tenpai: each non-tenpai player pays 1500 total (750 to each tenpai player)
            // Each tenpai player receives 1500 total (750 from each non-tenpai player)
            for (const tenpaiSeat of tenpaiSeats) {
              deltas[tenpaiSeat] += 1500;
            }
            for (const nonTenpaiSeat of nonTenpaiSeats) {
              deltas[nonTenpaiSeat] -= 1500;
            }
          } else if (tenpaiSeats.length === 3) {
            // 3 players in tenpai: the 1 non-tenpai player pays 1000 to each of the 3 tenpai players
            // (3000 total from the non-tenpai player)
            const nonTenpaiSeat = nonTenpaiSeats[0];
            deltas[nonTenpaiSeat] -= 3000;
            for (const tenpaiSeat of tenpaiSeats) {
              deltas[tenpaiSeat] += 1000;
            }
          }
        }
        break;
      }

      case "chombo": {
        // Chombo penalty (JPML / EMA-style rules):
        // - Dealer chombo: pays 4000 to each non-dealer (total 12,000)
        // - Non-dealer chombo: pays 4000 to dealer and 2000 to each other non-dealer (total 8,000)
        // - Honba increases by +1 (like a draw)
        // - Dealer does not rotate
        // - Riichi sticks stay on the table (from current hand and previous hands)
        if (body.loserSeat) {
          const isOffenderDealer = body.loserSeat === body.dealerSeat;

          if (isOffenderDealer) {
            // Dealer chombo: pays 4000 to each non-dealer (total 12,000)
            deltas[body.loserSeat] -= 12000;
            for (const seat of seats) {
              if (seat !== body.loserSeat) {
                deltas[seat] += 4000;
              }
            }
          } else {
            // Non-dealer chombo: pays 4000 to dealer and 2000 to each other non-dealer (total 8,000)
            deltas[body.loserSeat] -= 8000;
            for (const seat of seats) {
              if (seat !== body.loserSeat) {
                if (seat === body.dealerSeat) {
                  deltas[seat] += 4000;
                } else {
                  deltas[seat] += 2000;
                }
              }
            }
          }
        }
        break;
      }
    }

    // Determine if this is a winning hand where riichi sticks are collected
    const isWinningHand =
      body.eventType === "ron" || body.eventType === "tsumo";
    const riichiSticksCollected = isWinningHand ? totalRiichiSticks : 0;

    // Create hand events for each player
    const handEvents = seats.map(seat => {
      // pot_delta tracks riichi stick flow:
      // - Negative when declaring riichi (stick goes to pot)
      // - Positive when winning and collecting sticks (sticks leave pot)
      let potDelta = 0;
      if (riichiDeclarations.includes(seat)) {
        potDelta -= RIICHI_BET; // Declaring riichi
      }
      if (seat === body.winnerSeat && riichiSticksCollected > 0) {
        potDelta += riichiSticksCollected * RIICHI_BET; // Collecting riichi sticks
      }

      return {
        game_id: gameId,
        hand_seq: nextSeq,
        seat,
        event_type: body.eventType,
        riichi_declared: riichiDeclarations.includes(seat),
        points_delta: deltas[seat],
        pot_delta: potDelta,
        round_kanji: body.round,
        kyoku: body.kyoku,
        honba,
        details: {
          han: body.han,
          fu: body.fu,
          yakuList: body.yakuList || [],
          dealerSeat: body.dealerSeat,
          winnerSeat: body.winnerSeat,
          loserSeat: body.loserSeat,
          riichiSticks,
          pointsWon,
          tier,
          abortiveDrawType: body.abortiveDrawType,
          tenpaiSeats: body.tenpaiSeats,
        },
      };
    });

    const { error: insertError } = await supabase
      .from("hand_events")
      .insert(handEvents);

    if (insertError) {
      console.error("Failed to record hand:", insertError);
      return NextResponse.json(
        { error: "Failed to record hand", details: insertError.message },
        { status: 500 }
      );
    }

    const response: HandEventResponse = {
      handSeq: nextSeq,
      events: seats.map(seat => ({
        seat,
        eventType: body.eventType,
        pointsDelta: deltas[seat],
        riichiDeclared: riichiDeclarations.includes(seat),
      })),
      pointsWon: pointsWon > 0 ? pointsWon : undefined,
      tier,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error recording hand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/games/[gameId]/hands - Delete the last recorded hand (for corrections)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { gameId } = await context.params;
    const supabase = await createClient();

    // Get the last hand sequence
    const { data: maxSeqResult } = await supabase
      .from("hand_events")
      .select("hand_seq")
      .eq("game_id", gameId)
      .order("hand_seq", { ascending: false })
      .limit(1)
      .single();

    if (!maxSeqResult) {
      return NextResponse.json(
        { error: "No hands to delete" },
        { status: 404 }
      );
    }

    // Delete all events for the last hand
    const { error } = await supabase
      .from("hand_events")
      .delete()
      .eq("game_id", gameId)
      .eq("hand_seq", maxSeqResult.hand_seq);

    if (error) {
      console.error("Failed to delete hand:", error);
      return NextResponse.json(
        { error: "Failed to delete hand" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Hand ${maxSeqResult.hand_seq} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting hand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
