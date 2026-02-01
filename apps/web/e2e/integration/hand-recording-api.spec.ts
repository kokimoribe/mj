import { test, expect } from "@playwright/test";

// Extend Window interface for test-specific properties
declare global {
  interface Window {
    handUpdates: any[];
    supabase: any;
  }
}

/**
 * Hand Recording API Integration Tests
 * Based on Hand Recording Feature Specification v3.2
 *
 * Tests the API endpoints for hand recording functionality.
 * These tests verify the backend correctly processes hand data.
 */

test.describe("Hand Recording API - Core Endpoints", () => {
  let gameId: string;

  test.beforeAll(async ({ request }) => {
    // Create a test game
    const response = await request.post("/api/games", {
      data: {
        players: [
          { id: "player-josh", seat: "east" },
          { id: "player-mikey", seat: "south" },
          { id: "player-koki", seat: "west" },
          { id: "player-jo", seat: "north" },
        ],
        startingPoints: 25000,
      },
    });

    const game = await response.json();
    gameId = game.id;
  });

  test("POST /api/games/{gameId}/hands - records a basic ron", async ({
    request,
  }) => {
    const handData = {
      wind_round: "east",
      round_number: 1,
      honba_count: 0,
      outcome_type: "ron",
      dealer_seat: "east",
      actions: [
        {
          player_id: "player-josh",
          action_type: "riichi",
          action_order: 1,
          riichi_stick_delta: -1000,
        },
        {
          player_id: "player-josh",
          action_type: "win",
          action_order: 2,
          points_delta: 5800,
          riichi_stick_delta: 1000,
          details: {
            han: 3,
            fu: 30,
            yaku: ["riichi", "tanyao", "pinfu"],
          },
        },
        {
          player_id: "player-mikey",
          action_type: "deal_in",
          action_order: 3,
          points_delta: -5800,
          target_player_id: "player-josh",
        },
      ],
    };

    const response = await request.post(`/api/games/${gameId}/hands`, {
      data: handData,
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.hand_id).toBeTruthy();
    expect(result.hand_number).toBe(1);
    expect(result.scores_after).toEqual({
      "player-josh": 29800, // 25000 - 1000 + 5800 + 1000
      "player-mikey": 19200, // 25000 - 5800
      "player-koki": 25000,
      "player-jo": 25000,
    });
    expect(result.next_dealer).toBe("player-josh"); // Dealer won, continues
    expect(result.riichi_pot).toBe(0);
  });

  test("POST /api/games/{gameId}/hands - records dealer tsumo with honba", async ({
    request,
  }) => {
    const handData = {
      wind_round: "east",
      round_number: 2,
      honba_count: 2,
      outcome_type: "tsumo",
      dealer_seat: "south",
      actions: [
        {
          player_id: "player-mikey", // South seat, dealer
          action_type: "win",
          action_order: 1,
          points_delta: 6600, // 2000×3 + 200×3 honba
          details: {
            han: 3,
            fu: 30,
          },
        },
        {
          player_id: "player-josh",
          action_type: "payment",
          action_order: 2,
          points_delta: -2200, // 2000 + 200 honba
        },
        {
          player_id: "player-koki",
          action_type: "payment",
          action_order: 3,
          points_delta: -2200,
        },
        {
          player_id: "player-jo",
          action_type: "payment",
          action_order: 4,
          points_delta: -2200,
        },
      ],
    };

    const response = await request.post(`/api/games/${gameId}/hands`, {
      data: handData,
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.next_dealer).toBe("player-mikey"); // Dealer won, continues
    expect(result.honba_count).toBe(3); // Increases due to dealer win
  });

  test("POST /api/games/{gameId}/hands - records exhaustive draw with tenpai", async ({
    request,
  }) => {
    const handData = {
      wind_round: "south",
      round_number: 3,
      honba_count: 0,
      outcome_type: "exhaustive_draw",
      dealer_seat: "west",
      actions: [
        {
          player_id: "player-josh",
          action_type: "riichi",
          action_order: 1,
          riichi_stick_delta: -1000,
        },
        {
          player_id: "player-mikey",
          action_type: "riichi",
          action_order: 2,
          riichi_stick_delta: -1000,
        },
        {
          player_id: "player-josh",
          action_type: "tenpai",
          action_order: 3,
          points_delta: 1500,
        },
        {
          player_id: "player-mikey",
          action_type: "tenpai",
          action_order: 4,
          points_delta: 1500,
        },
        {
          player_id: "player-koki",
          action_type: "not_tenpai",
          action_order: 5,
          points_delta: -1500,
        },
        {
          player_id: "player-jo",
          action_type: "not_tenpai",
          action_order: 6,
          points_delta: -1500,
        },
      ],
    };

    const response = await request.post(`/api/games/${gameId}/hands`, {
      data: handData,
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.riichi_pot).toBe(2000); // Riichi sticks remain on table
    expect(result.honba_count).toBe(1); // Increases on draw
    // Dealer continues if tenpai (based on renchan_type)
    expect(result.next_dealer).toBe("player-koki"); // Or same dealer if tenpai
  });

  test("POST /api/games/{gameId}/hands - validates point balance", async ({
    request,
  }) => {
    const invalidHandData = {
      wind_round: "east",
      round_number: 1,
      honba_count: 0,
      outcome_type: "ron",
      dealer_seat: "east",
      actions: [
        {
          player_id: "player-josh",
          action_type: "win",
          action_order: 1,
          points_delta: 5800,
        },
        {
          player_id: "player-mikey",
          action_type: "deal_in",
          action_order: 2,
          points_delta: -5000, // Incorrect! Should be -5800
        },
      ],
    };

    const response = await request.post(`/api/games/${gameId}/hands`, {
      data: invalidHandData,
    });

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.message).toContain("Points do not balance to zero");
  });

  test("POST /api/games/{gameId}/hands - handles double ron", async ({
    request,
  }) => {
    const handData = {
      wind_round: "east",
      round_number: 4,
      honba_count: 0,
      outcome_type: "double_ron",
      dealer_seat: "north",
      actions: [
        {
          player_id: "player-josh",
          action_type: "win",
          action_order: 1,
          points_delta: 12000,
        },
        {
          player_id: "player-koki",
          action_type: "win",
          action_order: 2,
          points_delta: 5200,
        },
        {
          player_id: "player-jo", // Dealer who dealt in
          action_type: "deal_in",
          action_order: 3,
          points_delta: -17200,
          target_player_id: null, // Multiple winners
        },
      ],
    };

    const response = await request.post(`/api/games/${gameId}/hands`, {
      data: handData,
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.next_dealer).toBe("player-josh"); // Rotates to East for South round
    expect(result.wind_round).toBe("south"); // New round begins
  });

  test("POST /api/games/{gameId}/hands - handles chombo penalty", async ({
    request,
  }) => {
    const handData = {
      wind_round: "south",
      round_number: 2,
      honba_count: 0,
      outcome_type: "chombo",
      dealer_seat: "south",
      actions: [
        {
          player_id: "player-josh", // Non-dealer chombo
          action_type: "chombo_penalty",
          action_order: 1,
          points_delta: -8000,
        },
        {
          player_id: "player-mikey", // Dealer gets 4000
          action_type: "payment",
          action_order: 2,
          points_delta: 4000,
        },
        {
          player_id: "player-koki", // Non-dealer gets 2000
          action_type: "payment",
          action_order: 3,
          points_delta: 2000,
        },
        {
          player_id: "player-jo", // Non-dealer gets 2000
          action_type: "payment",
          action_order: 4,
          points_delta: 2000,
        },
      ],
    };

    const response = await request.post(`/api/games/${gameId}/hands`, {
      data: handData,
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.replay_hand).toBe(true); // Hand is replayed
    expect(result.wind_round).toBe("south");
    expect(result.round_number).toBe(2); // Same round
  });

  test("POST /api/games/{gameId}/hands - enforces tobi (bankruptcy)", async ({
    request,
  }) => {
    // First, update a player's score to be low
    await request.put(`/api/games/${gameId}/scores`, {
      data: {
        "player-jo": 2000,
      },
    });

    const handData = {
      wind_round: "west",
      round_number: 1,
      honba_count: 0,
      outcome_type: "ron",
      dealer_seat: "west",
      actions: [
        {
          player_id: "player-josh",
          action_type: "win",
          action_order: 1,
          points_delta: 5800,
        },
        {
          player_id: "player-jo",
          action_type: "deal_in",
          action_order: 2,
          points_delta: -5800,
        },
      ],
    };

    const response = await request.post(`/api/games/${gameId}/hands`, {
      data: handData,
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.game_ended).toBe(true);
    expect(result.end_reason).toBe("tobi");
    expect(result.scores_after["player-jo"]).toBe(-3800); // Negative score
  });
});

test.describe("Hand Recording API - GET Endpoints", () => {
  let gameId: string;

  test.beforeAll(async ({ request }) => {
    // Create and populate a test game with hands
    const gameResponse = await request.post("/api/games", {
      data: {
        players: [
          { id: "player-1", seat: "east" },
          { id: "player-2", seat: "south" },
          { id: "player-3", seat: "west" },
          { id: "player-4", seat: "north" },
        ],
      },
    });

    const game = await gameResponse.json();
    gameId = game.id;

    // Add some hands
    await request.post(`/api/games/${gameId}/hands`, {
      data: {
        wind_round: "east",
        round_number: 1,
        honba_count: 0,
        outcome_type: "ron",
        dealer_seat: "east",
        actions: [
          {
            player_id: "player-1",
            action_type: "win",
            points_delta: 5800,
          },
          {
            player_id: "player-2",
            action_type: "deal_in",
            points_delta: -5800,
          },
        ],
      },
    });
  });

  test("GET /api/games/{gameId}/hands - retrieves all hands", async ({
    request,
  }) => {
    const response = await request.get(`/api/games/${gameId}/hands`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.hands).toBeInstanceOf(Array);
    expect(data.hands.length).toBeGreaterThan(0);

    const firstHand = data.hands[0];
    expect(firstHand).toHaveProperty("hand_id");
    expect(firstHand).toHaveProperty("hand_number");
    expect(firstHand).toHaveProperty("round");
    expect(firstHand).toHaveProperty("outcome");
    expect(firstHand).toHaveProperty("winner");
    expect(firstHand).toHaveProperty("points");
    expect(firstHand).toHaveProperty("scores_after");
  });

  test("GET /api/games/{gameId}/hands - returns empty for games without hands", async ({
    request,
  }) => {
    // Create a game without hands
    const gameResponse = await request.post("/api/games", {
      data: {
        players: [
          { id: "player-a", seat: "east" },
          { id: "player-b", seat: "south" },
          { id: "player-c", seat: "west" },
          { id: "player-d", seat: "north" },
        ],
      },
    });

    const newGame = await gameResponse.json();

    const response = await request.get(`/api/games/${newGame.id}/hands`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.hands).toEqual([]);
    expect(data.dataQuality).toBe("final_only");
  });
});

test.describe("Hand Recording API - Update/Delete", () => {
  let gameId: string;
  let handId: string;

  test.beforeEach(async ({ request }) => {
    // Create a game with a hand
    const gameResponse = await request.post("/api/games", {
      data: {
        players: [
          { id: "player-1", seat: "east" },
          { id: "player-2", seat: "south" },
          { id: "player-3", seat: "west" },
          { id: "player-4", seat: "north" },
        ],
      },
    });

    const game = await gameResponse.json();
    gameId = game.id;

    const handResponse = await request.post(`/api/games/${gameId}/hands`, {
      data: {
        wind_round: "east",
        round_number: 1,
        honba_count: 0,
        outcome_type: "ron",
        dealer_seat: "east",
        actions: [
          {
            player_id: "player-1",
            action_type: "win",
            points_delta: 5800,
          },
          {
            player_id: "player-2",
            action_type: "deal_in",
            points_delta: -5800,
          },
        ],
      },
    });

    const hand = await handResponse.json();
    handId = hand.hand_id;
  });

  test("PUT /api/games/{gameId}/hands/{handId} - updates hand within correction window", async ({
    request,
  }) => {
    const updateData = {
      actions: [
        {
          player_id: "player-1",
          action_type: "win",
          points_delta: 7700, // Corrected points
        },
        {
          player_id: "player-2",
          action_type: "deal_in",
          points_delta: -7700,
        },
      ],
    };

    const response = await request.put(`/api/games/${gameId}/hands/${handId}`, {
      data: updateData,
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.scores_after["player-1"]).toBe(32700); // 25000 + 7700
    expect(result.scores_after["player-2"]).toBe(17300); // 25000 - 7700
  });

  test("PUT /api/games/{gameId}/hands/{handId} - fails after correction window", async ({
    request,
  }) => {
    // Wait for correction window to expire (mock by setting created_at to past)
    // In real implementation, this would be handled by RLS policies

    // Attempt update after 5+ minutes
    const updateData = {
      actions: [
        {
          player_id: "player-1",
          action_type: "win",
          points_delta: 7700,
        },
        {
          player_id: "player-2",
          action_type: "deal_in",
          points_delta: -7700,
        },
      ],
    };

    // Mock expired correction window
    const response = await request.put(
      `/api/games/${gameId}/hands/${handId}?after_window=true`,
      {
        data: updateData,
      }
    );

    expect(response.status()).toBe(403);

    const error = await response.json();
    expect(error.message).toContain("Correction window expired");
  });

  test("DELETE /api/games/{gameId}/hands/{handId} - removes hand and recalculates", async ({
    request,
  }) => {
    // Add a second hand first
    await request.post(`/api/games/${gameId}/hands`, {
      data: {
        wind_round: "east",
        round_number: 1,
        honba_count: 1,
        outcome_type: "tsumo",
        dealer_seat: "east",
        actions: [
          {
            player_id: "player-1",
            action_type: "win",
            points_delta: 6000,
          },
          {
            player_id: "player-2",
            action_type: "payment",
            points_delta: -2000,
          },
          {
            player_id: "player-3",
            action_type: "payment",
            points_delta: -2000,
          },
          {
            player_id: "player-4",
            action_type: "payment",
            points_delta: -2000,
          },
        ],
      },
    });

    // Delete the first hand
    const response = await request.delete(
      `/api/games/${gameId}/hands/${handId}`
    );

    expect(response.ok()).toBeTruthy();

    // Verify scores were recalculated
    const gameResponse = await request.get(`/api/games/${gameId}`);
    const game = await gameResponse.json();

    // Should only have the second hand's effects
    expect(game.scores["player-1"]).toBe(31000); // 25000 + 6000
    expect(game.scores["player-2"]).toBe(23000); // 25000 - 2000
  });
});

test.describe("Hand Recording API - Incomplete Data", () => {
  test("POST /api/games/{gameId}/hands - accepts incomplete data with notes", async ({
    request,
  }) => {
    const gameResponse = await request.post("/api/games", {
      data: {
        players: [
          { id: "player-1", seat: "east" },
          { id: "player-2", seat: "south" },
          { id: "player-3", seat: "west" },
          { id: "player-4", seat: "north" },
        ],
      },
    });

    const game = await gameResponse.json();

    const incompleteHandData = {
      wind_round: "south",
      round_number: 1,
      honba_count: 2,
      outcome_type: "ron",
      dealer_seat: "east",
      completed_at: null, // Mark as incomplete
      actions: [
        {
          player_id: null, // Unknown winner
          action_type: "win",
          action_order: 1,
          points_delta: 2600,
          details: {
            uncertain: true,
            note: "Either mikey or josh won, need to verify from final scores",
            possible_winners: ["player-2", "player-3"],
          },
        },
      ],
    };

    const response = await request.post(`/api/games/${game.id}/hands`, {
      data: incompleteHandData,
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.incomplete).toBe(true);
    expect(result.validation_deferred).toBe(true);
  });

  test("POST /api/games/{gameId}/hands/reconcile - infers missing data from final scores", async ({
    request,
  }) => {
    const gameResponse = await request.post("/api/games", {
      data: {
        players: [
          { id: "player-1", seat: "east" },
          { id: "player-2", seat: "south" },
          { id: "player-3", seat: "west" },
          { id: "player-4", seat: "north" },
        ],
        finalScores: {
          "player-1": 42100,
          "player-2": 28300,
          "player-3": 21600,
          "player-4": 8000,
        },
      },
    });

    const game = await gameResponse.json();

    // Attempt to reconcile incomplete hands with final scores
    const response = await request.post(
      `/api/games/${game.id}/hands/reconcile`,
      {
        data: {
          finalScores: {
            "player-1": 42100,
            "player-2": 28300,
            "player-3": 21600,
            "player-4": 8000,
          },
        },
      }
    );

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.reconciled).toBe(true);
    expect(result.inferred_hands).toBeInstanceOf(Array);
  });
});
