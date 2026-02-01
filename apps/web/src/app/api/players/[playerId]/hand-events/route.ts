import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { config } from "@/config";
import type {
  PlayerGameForStats,
  PlayerHandEventForStats,
  Seat,
} from "@/features/players/playerStatistics";

interface RouteContext {
  params: Promise<{ playerId: string }>;
}

type RatingConfigurationRaw = {
  config_hash: string;
  name: string | null;
  config_data: unknown;
};

type ConfigDataParsed = {
  timeRange?: { startDate?: string; endDate?: string; name?: string };
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function asSeat(value: unknown): Seat | null {
  if (
    value === "east" ||
    value === "south" ||
    value === "west" ||
    value === "north"
  ) {
    return value;
  }
  return null;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { playerId: rawPlayerId } = await context.params;
    const { searchParams } = new URL(request.url);
    const configHash = searchParams.get("configHash") || config.season.hash;

    const supabase = await createClient();

    // Resolve player UUID if display name is provided
    let playerId = rawPlayerId;
    if (!uuidPattern.test(rawPlayerId)) {
      const { data: playerRow, error: playerError } = await supabase
        .from("players")
        .select("id")
        .ilike("display_name", rawPlayerId)
        .single();

      if (playerError || !playerRow?.id) {
        return NextResponse.json(
          { error: "Player not found" },
          { status: 404 }
        );
      }
      playerId = playerRow.id;
    }

    // Load config time range
    const { data: configData, error: configError } = await supabase
      .from("rating_configurations")
      .select("config_hash, name, config_data")
      .eq("config_hash", configHash)
      .single();

    if (configError) {
      return NextResponse.json(
        { error: "Failed to load configuration" },
        { status: 500 }
      );
    }

    const ratingConfig = configData as RatingConfigurationRaw;
    let parsedConfigData: ConfigDataParsed | null = null;
    if (ratingConfig?.config_data) {
      if (typeof ratingConfig.config_data === "string") {
        try {
          parsedConfigData = JSON.parse(ratingConfig.config_data);
        } catch {
          parsedConfigData = null;
        }
      } else {
        parsedConfigData = ratingConfig.config_data as ConfigDataParsed;
      }
    }
    const timeRange = parsedConfigData?.timeRange;

    // Query player's games within config time range
    let playerGamesQuery = supabase
      .from("game_seats")
      .select(
        `
        game_id,
        seat,
        final_score,
        games!inner(
          id,
          started_at,
          finished_at,
          status
        )
      `
      )
      .eq("player_id", playerId)
      .eq("games.status", "finished");

    if (timeRange?.startDate) {
      playerGamesQuery = playerGamesQuery.gte(
        "games.started_at",
        timeRange.startDate
      );
    }
    if (timeRange?.endDate) {
      const endDate = new Date(timeRange.endDate);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
      const nextDay = endDate.toISOString().split("T")[0];
      playerGamesQuery = playerGamesQuery.lt("games.started_at", nextDay);
    }

    const { data: playerGameSeats, error: playerGamesError } =
      await playerGamesQuery;
    if (playerGamesError) {
      console.error("Failed to fetch player games:", playerGamesError);
      return NextResponse.json(
        { error: "Failed to fetch player games" },
        { status: 500 }
      );
    }

    const gameIds = (playerGameSeats || [])
      .map(r => r.game_id as string)
      .filter(Boolean);

    if (gameIds.length === 0) {
      return NextResponse.json({
        configHash,
        seasonName: ratingConfig?.name || timeRange?.name || null,
        hasHandData: false,
        games: [],
        handEvents: [],
      });
    }

    // Fetch all game_seats for those games to compute placement
    const { data: allSeats, error: allSeatsError } = await supabase
      .from("game_seats")
      .select("game_id, seat, final_score")
      .in("game_id", gameIds);

    if (allSeatsError) {
      console.error("Failed to fetch game seats:", allSeatsError);
      return NextResponse.json(
        { error: "Failed to fetch game seats" },
        { status: 500 }
      );
    }

    const seatsByGame = new Map<
      string,
      Array<{ seat: Seat; finalScore: number }>
    >();
    for (const row of allSeats || []) {
      const gid = row.game_id as string;
      const seat = asSeat(row.seat);
      const finalScore =
        typeof row.final_score === "number" && Number.isFinite(row.final_score)
          ? row.final_score
          : 0;
      if (!gid || !seat) continue;
      if (!seatsByGame.has(gid)) seatsByGame.set(gid, []);
      seatsByGame.get(gid)!.push({ seat, finalScore });
    }

    // Build games payload
    const games: PlayerGameForStats[] = [];
    for (const row of playerGameSeats || []) {
      const gid = row.game_id as string;
      const seat = asSeat(row.seat);
      if (!gid || !seat) continue;

      const finalScore =
        typeof row.final_score === "number" && Number.isFinite(row.final_score)
          ? row.final_score
          : 0;

      const game = (row as any).games as {
        started_at: string;
        finished_at: string | null;
      } | null;

      const seats = seatsByGame.get(gid) || [];
      const sorted = [...seats].sort((a, b) => b.finalScore - a.finalScore);
      const placementIndex = sorted.findIndex(s => s.seat === seat);
      const placement = (placementIndex >= 0 ? placementIndex + 1 : 4) as
        | 1
        | 2
        | 3
        | 4;

      games.push({
        gameId: gid,
        startedAt: game?.started_at,
        finishedAt: game?.finished_at,
        seat,
        finalScore,
        placement,
      });
    }

    // Map for filtering hand events down to the player's seat in each game
    const seatByGameId = new Map<string, Seat>();
    for (const g of games) seatByGameId.set(g.gameId, g.seat);

    // Fetch hand events for all these games (round_kanji, kyoku for round-based stats)
    const { data: handEventsRaw, error: handEventsError } = await supabase
      .from("hand_events")
      .select(
        "game_id, hand_seq, seat, event_type, riichi_declared, points_delta, round_kanji, kyoku, details"
      )
      .in("game_id", gameIds)
      .order("hand_seq", { ascending: true });

    if (handEventsError) {
      console.error("Failed to fetch hand events:", handEventsError);
      return NextResponse.json(
        { error: "Failed to fetch hand events" },
        { status: 500 }
      );
    }

    const handEvents: PlayerHandEventForStats[] = [];
    for (const row of handEventsRaw || []) {
      const gid = row.game_id as string;
      const seat = asSeat(row.seat);
      if (!gid || !seat) continue;
      const playerSeat = seatByGameId.get(gid);
      if (!playerSeat || playerSeat !== seat) continue;

      handEvents.push({
        gameId: gid,
        handSeq: row.hand_seq as number,
        seat,
        eventType: row.event_type as string,
        riichiDeclared: Boolean(row.riichi_declared),
        pointsDelta:
          typeof row.points_delta === "number" &&
          Number.isFinite(row.points_delta)
            ? row.points_delta
            : 0,
        roundKanji:
          typeof row.round_kanji === "string" ? row.round_kanji : undefined,
        kyoku:
          typeof row.kyoku === "number" && Number.isFinite(row.kyoku)
            ? row.kyoku
            : undefined,
        details: (row.details || null) as any,
      });
    }

    return NextResponse.json({
      configHash,
      seasonName: ratingConfig?.name || timeRange?.name || null,
      hasHandData: handEvents.length > 0,
      games,
      handEvents,
    });
  } catch (error) {
    console.error("Error fetching player hand events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
