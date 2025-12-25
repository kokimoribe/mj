import { useMemo } from "react";
import { type Seat, type Round } from "@/lib/mahjong";

/**
 * Game format types
 * - hanchan: East + South rounds (8 hands minimum, ends after South 4)
 * - tonpuusen: East round only (4 hands minimum, ends after East 4)
 */
export type GameFormat = "hanchan" | "tonpuusen";

/**
 * Reasons why a game should end
 * - bust: A player's score went below 0
 * - natural_end: Game reached its natural conclusion (S4 for hanchan, E4 for tonpuusen)
 * - enchousen_end: Game ended during overtime (West round for hanchan, South round for tonpuusen)
 */
export type GameEndReason = "bust" | "natural_end" | "enchousen_end" | null;

/**
 * Result of game end detection
 */
export interface GameEndDetectionResult {
  /** Whether the game should end */
  shouldEnd: boolean;
  /** The reason for ending, if applicable */
  reason: GameEndReason;
  /** Whether the game is currently in enchousen (overtime) */
  inEnchousen: boolean;
  /** Which player busted, if applicable */
  bustedSeat: Seat | null;
  /** Whether the current round is the final round before potential end */
  isFinalRound: boolean;
  /** Message to display to user */
  endMessage: string | null;
}

/**
 * Parameters for game end detection
 */
export interface GameEndDetectionParams {
  /** Current scores for each seat */
  scores: Record<Seat, number>;
  /** Current round (E, S, W, N) */
  round: Round;
  /** Current kyoku (1-4) */
  kyoku: number;
  /** Game format (hanchan or tonpuusen) */
  gameFormat: GameFormat;
  /** Whether the dealer won the last hand */
  lastEventWasDealerWin: boolean;
  /** Map of seat to player name for messages */
  playerNames?: Record<Seat, string>;
}

/** Minimum points required for leader to end a hanchan without enchousen */
const ENCHOUSEN_THRESHOLD = 30000;

/** Round order for comparison */
const ROUND_ORDER: Record<Round, number> = {
  E: 0,
  S: 1,
  W: 2,
  N: 3,
};

/**
 * Check if a round is after the specified final round
 */
function isAfterRound(current: Round, final: Round): boolean {
  return ROUND_ORDER[current] > ROUND_ORDER[final];
}

/**
 * Get the final round for a game format
 */
function getFinalRound(gameFormat: GameFormat): Round {
  return gameFormat === "hanchan" ? "S" : "E";
}

/**
 * Get the dealer seat from kyoku
 * kyoku 1 = east, kyoku 2 = south, kyoku 3 = west, kyoku 4 = north
 */
function getDealerSeat(kyoku: number): Seat {
  const SEATS: Seat[] = ["east", "south", "west", "north"];
  return SEATS[kyoku - 1];
}

/**
 * Check if a seat is the leader (has the highest score)
 */
function isLeader(seat: Seat, scores: Record<Seat, number>): boolean {
  const seatScore = scores[seat];
  const allScores = Object.values(scores);
  const maxScore = Math.max(...allScores);
  return seatScore === maxScore;
}

/**
 * Check game end conditions and return detection result
 */
export function checkGameEnd(
  params: GameEndDetectionParams
): GameEndDetectionResult {
  const {
    scores,
    round,
    kyoku,
    gameFormat,
    lastEventWasDealerWin,
    playerNames = {
      east: "East",
      south: "South",
      west: "West",
      north: "North",
    },
  } = params;

  const scoreValues = Object.values(scores);
  const leaderScore = Math.max(...scoreValues);
  const finalRound = getFinalRound(gameFormat);

  // Default result
  const result: GameEndDetectionResult = {
    shouldEnd: false,
    reason: null,
    inEnchousen: false,
    bustedSeat: null,
    isFinalRound: false,
    endMessage: null,
  };

  // 1. Bust check - highest priority (immediate game end)
  const bustedSeat = (Object.entries(scores) as [Seat, number][]).find(
    ([, score]) => score < 0
  );

  if (bustedSeat) {
    const [seat, score] = bustedSeat;
    const playerName = playerNames[seat];
    return {
      shouldEnd: true,
      reason: "bust",
      inEnchousen: false,
      bustedSeat: seat,
      isFinalRound: false,
      endMessage: `${playerName} has busted with ${score.toLocaleString()} points! Game Over.`,
    };
  }

  // 2. Check if we're at or past the final round
  // Note: round/kyoku represent the NEXT hand to be played, not the last completed hand.
  // So if round === "W", it means we just completed S4 and are about to enter West.
  // If round === "S" && kyoku === 4, we could be:
  //   - About to play S4 (just completed S3)
  //   - Just completed S4 (dealer won, so we stay at S4)
  const isAtFinalRound = round === finalRound && kyoku === 4;
  const isPastFinalRound = isAfterRound(round, finalRound);

  // Check if we just completed the final round with a non-dealer win:
  // - For hanchan: we're about to enter West (round === "W" && kyoku === 1)
  //   This means a non-dealer won S4, so we moved to West
  // - For tonpuusen: we're about to enter South (round === "S" && kyoku === 1)
  //   This means a non-dealer won E4, so we moved to South
  // Note: Dealer wins at final round are handled separately in step 5
  const justCompletedFinalRound =
    gameFormat === "hanchan"
      ? round === "W" && kyoku === 1
      : round === "S" && kyoku === 1;

  // Mark if we're approaching the final round (for UI indicators)
  // Show "Final Round" indicator when we're at the last kyoku of the final round
  result.isFinalRound = isAtFinalRound;

  // 3. Check if we're in enchousen
  // - For hanchan: West or North rounds (after S4)
  // - For tonpuusen: South round (after E4)
  // Note: We're only "in enchousen" if we've actually entered it (not just about to enter)
  // If we just completed the final round (justCompletedFinalRound), we haven't entered enchousen yet
  const isInEnchousen =
    gameFormat === "hanchan"
      ? round === "W" || round === "N"
      : round === "S" || round === "W" || round === "N";
  // Only mark as in enchousen if we've actually played hands in enchousen
  // (not just about to enter it after completing final round)
  const actuallyInEnchousen = isInEnchousen && !justCompletedFinalRound;
  result.inEnchousen = actuallyInEnchousen;

  // 4. Sudden death check - if we're actually in enchousen (have played hands) and someone reaches 30k+, game ends immediately
  if (actuallyInEnchousen && leaderScore >= ENCHOUSEN_THRESHOLD) {
    return {
      shouldEnd: true,
      reason: "enchousen_end",
      inEnchousen: true,
      bustedSeat: null,
      isFinalRound: false,
      endMessage: `Sudden death! Leader has ${leaderScore.toLocaleString()} points. Enchousen complete!`,
    };
  }

  // 5. Dealer repeat check - if dealer won on final round, check if dealer is leader with 30k+
  // This applies to both hanchan (S4) and tonpuusen (E4)
  // When dealer wins on the final round:
  // - If dealer is NOT the leader: game continues with dealer repeat (honba increases)
  // - If dealer IS the leader but dealer < 30k: game continues with dealer repeat
  // - If dealer IS the leader AND dealer >= 30k: game ends immediately
  if (isAtFinalRound && lastEventWasDealerWin) {
    const dealerSeat = getDealerSeat(kyoku);
    const dealerIsLeader = isLeader(dealerSeat, scores);
    const dealerScore = scores[dealerSeat];
    const dealerName = playerNames[dealerSeat];

    if (!dealerIsLeader) {
      // Dealer won but isn't leader - game continues with dealer repeat
      return {
        shouldEnd: false,
        reason: null,
        inEnchousen: false,
        bustedSeat: null,
        isFinalRound: true,
        endMessage: `${dealerName} (dealer) won but is not the leader. Game continues with dealer repeat.`,
      };
    }

    // Dealer is leader - check if dealer has 30k+
    if (dealerScore >= ENCHOUSEN_THRESHOLD) {
      // Dealer is leader and has 30k+ - game ends immediately
      const formatName = gameFormat === "hanchan" ? "Hanchan" : "Tonpuusen";
      return {
        shouldEnd: true,
        reason: "natural_end",
        inEnchousen: false,
        bustedSeat: null,
        isFinalRound: true,
        endMessage: `${formatName} complete! ${dealerName} (dealer) is the leader with ${dealerScore.toLocaleString()} points.`,
      };
    }

    // Dealer is leader but doesn't have 30k+ - game continues with dealer repeat
    return {
      shouldEnd: false,
      reason: null,
      inEnchousen: false,
      bustedSeat: null,
      isFinalRound: true,
      endMessage: `${dealerName} (dealer) is the leader but doesn't have ${ENCHOUSEN_THRESHOLD.toLocaleString()} points. Game continues with dealer repeat.`,
    };
  }

  // 6. If we're past the final round but leader doesn't have 30k+, continue in enchousen
  // This handles the case where we just completed the final round and are entering enchousen
  if (isPastFinalRound && leaderScore < ENCHOUSEN_THRESHOLD) {
    const enchousenRound = gameFormat === "hanchan" ? "West" : "South";
    return {
      shouldEnd: false,
      reason: null,
      inEnchousen: isInEnchousen, // Use isInEnchousen (not actuallyInEnchousen) to show we're entering enchousen
      bustedSeat: null,
      isFinalRound: false,
      endMessage: `No player has ${ENCHOUSEN_THRESHOLD.toLocaleString()} points. Game continues in ${enchousenRound} round (延長戦 Enchousen).`,
    };
  }

  // 7. Natural end check - game can end when:
  // a) We've PASSED the final round (e.g., entered West for hanchan, or entered South for tonpuusen)
  //    AND leader has 30k+ points
  // b) We just COMPLETED the final round (e.g., just finished S4 for hanchan, or E4 for tonpuusen)
  //    AND leader has 30k+ points
  // Note: We don't end when we're ABOUT to play the final round - only after it's completed.
  const shouldEndNaturally =
    (isPastFinalRound || justCompletedFinalRound) &&
    leaderScore >= ENCHOUSEN_THRESHOLD;

  if (shouldEndNaturally) {
    const formatName = gameFormat === "hanchan" ? "Hanchan" : "Tonpuusen";

    // 8. For hanchan: check if enchousen is needed
    if (gameFormat === "hanchan") {
      // We've reached this point because leader has 30k+ and we've completed or passed S4
      // Use enchousen_end reason if we actually played hands in enchousen (we were in overtime)
      // Use natural_end if we never entered enchousen (ended right after completing S4)
      // Note: If we're actually in enchousen, we should have already been caught by step 4 (sudden death)
      const reason = actuallyInEnchousen ? "enchousen_end" : "natural_end";
      const endMsg = actuallyInEnchousen
        ? `Enchousen complete! Leader has ${leaderScore.toLocaleString()} points.`
        : `${formatName} complete! Leader has ${leaderScore.toLocaleString()} points.`;

      return {
        shouldEnd: true,
        reason,
        inEnchousen: actuallyInEnchousen,
        bustedSeat: null,
        isFinalRound: !actuallyInEnchousen,
        endMessage: endMsg,
      };
    }

    // 9. Tonpuusen ends
    // If we're actually in enchousen, step 4 should have caught this already
    // This handles the case where we just completed E4 (dealer won, still at E4) with 30k+
    // Note: If dealer won but wasn't leader, step 5 should have caught it already
    if (actuallyInEnchousen) {
      // Should have been caught by step 4, but handle it here as fallback
      return {
        shouldEnd: true,
        reason: "enchousen_end",
        inEnchousen: true,
        bustedSeat: null,
        isFinalRound: false,
        endMessage: `Enchousen complete! Leader has ${leaderScore.toLocaleString()} points.`,
      };
    }

    // Natural end: just completed E4 with 30k+ (dealer won, so we're still at E4)
    return {
      shouldEnd: true,
      reason: "natural_end",
      inEnchousen: false,
      bustedSeat: null,
      isFinalRound: isAtFinalRound,
      endMessage: `${formatName} complete! Final round finished.`,
    };
  }

  return result;
}

/**
 * React hook for game end detection
 *
 * @example
 * ```tsx
 * const { shouldEnd, reason, inEnchousen, endMessage } = useGameEndDetection({
 *   scores: currentScores,
 *   round,
 *   kyoku,
 *   gameFormat: game.game_format,
 *   lastEventWasDealerWin: dealerWon,
 *   playerNames,
 * });
 *
 * useEffect(() => {
 *   if (shouldEnd) {
 *     setShowEndDialog(true);
 *   }
 * }, [shouldEnd]);
 * ```
 */
export function useGameEndDetection(
  params: GameEndDetectionParams
): GameEndDetectionResult {
  return useMemo(() => checkGameEnd(params), [params]);
}

/**
 * Get display name for a game format
 */
export function getGameFormatDisplayName(format: GameFormat): string {
  return format === "hanchan" ? "Hanchan (半荘)" : "Tonpuusen (東風戦)";
}

/**
 * Get description for a game format
 */
export function getGameFormatDescription(format: GameFormat): string {
  return format === "hanchan"
    ? "East + South rounds (8 hands minimum)"
    : "East round only (4 hands minimum)";
}
