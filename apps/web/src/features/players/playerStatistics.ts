export type Seat = "east" | "south" | "west" | "north";

export type HandEventType =
  | "tsumo"
  | "ron"
  | "draw"
  | "abortive_draw"
  | "chombo";

export interface PlayerGameForStats {
  gameId: string;
  startedAt?: string;
  finishedAt?: string | null;
  seat: Seat;
  finalScore: number;
  placement: 1 | 2 | 3 | 4;
}

export interface PlayerHandEventForStats {
  gameId: string;
  handSeq: number;
  seat: Seat;
  eventType: HandEventType | string;
  riichiDeclared: boolean;
  pointsDelta: number;
  roundKanji?: string; // E, S, W, N
  kyoku?: number; // 1-4
  details?: {
    winnerSeat?: Seat;
    loserSeat?: Seat;
    dealerSeat?: Seat;
    pointsWon?: number;
    han?: number;
    fu?: number;
    riichiSticks?: number;
  } | null;
}

export interface PlayerStatisticsResult {
  totals: {
    gamesPlayed: number;
    totalHands: number;
    totalWins: number;
    totalDealIns: number;
  };
  gameStats: {
    bustedGameRate: number | null; // percent
    averageFinalScore: number | null;
    placementRates: Record<"1" | "2" | "3" | "4", number | null>; // percent
    seatAssignmentRates: Record<Seat, number | null>; // percent
    longestGameWinStreak: number;
    comebackRate: number | null; // percent of games won after being in last place at some point
    perfectGames: number; // games with zero deal-ins
    currentStreak: number; // positive = wins, negative = non-wins, from most recent
    longestLosingStreak: number; // consecutive games without 1st
    scoreConsistency: number | null; // standard deviation of final scores
    highestFinalScore: { gameId: string; score: number } | null;
    lowestFinalScore: { gameId: string; score: number } | null;
    comebackFactor: number | null; // avg points recovered when starting negative (from lowest point)
  };
  handStats: {
    winRate: number | null; // percent of hands
    tsumoRate: number | null; // percent of wins
    dealInRate: number | null; // percent of hands
    riichiRate: number | null; // percent of hands
    winWithRiichiRate: number | null; // percent of wins
    winWithoutRiichiRate: number | null; // percent of wins
    dealerWinRate: number | null; // percent of hands as dealer
    nonDealerWinRate: number | null; // percent of hands as non-dealer
    seatWinRates: Record<Seat, number | null>; // percent of hands, conditioned on seat assignment
    bestSeatByWinRate: Seat | null;
    worstSeatByWinRate: Seat | null;
    longestHandWinStreakInSingleGame: number;
    biggestWinningHand: {
      gameId: string;
      handSeq: number;
      value: number;
    } | null;
    biggestLosingHand: {
      gameId: string;
      handSeq: number;
      value: number;
    } | null;
    averageWinValue: number | null;
    medianWinValue: number | null;
    averageDealInValue: number | null;
    medianDealInValue: number | null;
    averageHanOnWins: number | null;
    averageFuOnWins: number | null;
    highestHanAchieved: { gameId: string; handSeq: number; han: number } | null;
    riichiEfficiencyWinRate: number | null; // win rate when riichi declared (on that hand)
    riichiEfficiencyNoRiichiWinRate: number | null; // win rate when riichi not declared
    riichiSticksCollectedPerGame: number | null; // average riichi sticks collected per game
    dealerRetentionRate: number | null; // % of dealer hands where dealer stayed dealer (dealer won)
    averagePointsPerTsumo: number | null;
    averagePointsPerRon: number | null;
    dealInRateEastRound: number | null; // percent
    dealInRateSouthRound: number | null;
    winRateEastRound: number | null;
    winRateSouthRound: number | null;
    clutchFactor: number | null; // win rate in South 4 (round S, kyoku 4)
    earlyGameDominance: number | null; // win rate in first 2 hands (handSeq 1-2) or E1/E2
    comebackSpecialist: number | null; // win rate when seat is East (seatWinRates.east, displayed as fun stat)
  };
}

function safePercent(numerator: number, denominator: number): number | null {
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator <= 0
  )
    return null;
  return (numerator / denominator) * 100;
}

function safeAverage(values: number[]): number | null {
  const v = values.filter(x => Number.isFinite(x));
  if (v.length === 0) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function median(values: number[]): number | null {
  const v = values.filter(x => Number.isFinite(x)).sort((a, b) => a - b);
  if (v.length === 0) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 === 1 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

function computeLongestStreak(flags: boolean[]): number {
  let best = 0;
  let current = 0;
  for (const f of flags) {
    if (f) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

function standardDeviation(values: number[]): number | null {
  const v = values.filter(x => Number.isFinite(x));
  if (v.length < 2) return null;
  const avg = v.reduce((a, b) => a + b, 0) / v.length;
  const variance = v.reduce((sum, x) => sum + (x - avg) ** 2, 0) / v.length;
  return Math.sqrt(variance);
}

const STARTING_SCORE = 25000;

export function calculatePlayerStatistics(input: {
  games: PlayerGameForStats[];
  handEvents: PlayerHandEventForStats[];
}): PlayerStatisticsResult {
  const games = input.games ?? [];
  const handEvents = input.handEvents ?? [];

  const gamesPlayed = games.length;
  const bustedGames = games.filter(
    g => Number.isFinite(g.finalScore) && g.finalScore < 0
  ).length;
  const averageFinalScore = safeAverage(games.map(g => g.finalScore));

  const placementCounts: Record<"1" | "2" | "3" | "4", number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
  };
  for (const g of games) {
    placementCounts[String(g.placement) as "1" | "2" | "3" | "4"] += 1;
  }

  const seatCounts: Record<Seat, number> = {
    east: 0,
    south: 0,
    west: 0,
    north: 0,
  };
  for (const g of games) {
    seatCounts[g.seat] += 1;
  }

  // Total hands: count unique (gameId, handSeq) for this player.
  const uniqueHands = new Set<string>();
  for (const e of handEvents) {
    uniqueHands.add(`${e.gameId}:${e.handSeq}`);
  }
  const totalHands = uniqueHands.size;

  // Identify wins and deal-ins using details.{winnerSeat,loserSeat}
  const wins = handEvents.filter(
    e =>
      (e.eventType === "tsumo" || e.eventType === "ron") &&
      e.details?.winnerSeat &&
      e.seat === e.details.winnerSeat
  );

  const dealIns = handEvents.filter(
    e =>
      e.eventType === "ron" &&
      e.details?.loserSeat &&
      e.seat === e.details.loserSeat
  );

  const winValues = wins
    .map(e =>
      typeof e.details?.pointsWon === "number"
        ? e.details?.pointsWon
        : e.pointsDelta
    )
    .filter(v => Number.isFinite(v) && v > 0);

  const dealInValues = dealIns
    .map(e => Math.abs(e.pointsDelta))
    .filter(v => Number.isFinite(v) && v > 0);

  // Riichi rate per hand (player declared riichi on that hand)
  const riichiHands = handEvents.filter(e => e.riichiDeclared).length;

  // Win-with-riichi vs win-without-riichi (among wins)
  const winsWithRiichi = wins.filter(e => e.riichiDeclared).length;
  const winsWithoutRiichi = wins.length - winsWithRiichi;

  // Tsumo rate (among wins)
  const tsumoWins = wins.filter(e => e.eventType === "tsumo").length;

  // Dealer/non-dealer win rates (per-hand)
  const dealerHands = handEvents.filter(
    e => e.details?.dealerSeat && e.seat === e.details.dealerSeat
  );
  const dealerWins = dealerHands.filter(
    e =>
      (e.eventType === "tsumo" || e.eventType === "ron") &&
      e.details?.winnerSeat &&
      e.seat === e.details.winnerSeat
  );
  const nonDealerHands = handEvents.filter(
    e => e.details?.dealerSeat && e.seat !== e.details.dealerSeat
  );
  const nonDealerWins = nonDealerHands.filter(
    e =>
      (e.eventType === "tsumo" || e.eventType === "ron") &&
      e.details?.winnerSeat &&
      e.seat === e.details.winnerSeat
  );

  // Seat-specific hand win rates depend on having game seat assignment data.
  const seatByGameId = new Map<string, Seat>();
  for (const g of games) seatByGameId.set(g.gameId, g.seat);

  const seatHandCounts: Record<Seat, number> = {
    east: 0,
    south: 0,
    west: 0,
    north: 0,
  };
  const seatWinCounts: Record<Seat, number> = {
    east: 0,
    south: 0,
    west: 0,
    north: 0,
  };
  for (const e of handEvents) {
    const seat = seatByGameId.get(e.gameId);
    if (!seat) continue;
    seatHandCounts[seat] += 1;
    if (
      (e.eventType === "tsumo" || e.eventType === "ron") &&
      e.details?.winnerSeat &&
      e.seat === e.details.winnerSeat
    ) {
      seatWinCounts[seat] += 1;
    }
  }

  const seatWinRates: Record<Seat, number | null> = {
    east: safePercent(seatWinCounts.east, seatHandCounts.east),
    south: safePercent(seatWinCounts.south, seatHandCounts.south),
    west: safePercent(seatWinCounts.west, seatHandCounts.west),
    north: safePercent(seatWinCounts.north, seatHandCounts.north),
  };

  const seatsWithRates = (Object.keys(seatWinRates) as Seat[]).filter(
    s => seatWinRates[s] !== null
  );
  const bestSeatByWinRate =
    seatsWithRates.length === 0
      ? null
      : seatsWithRates.reduce((best, s) =>
          (seatWinRates[s] ?? -Infinity) > (seatWinRates[best] ?? -Infinity)
            ? s
            : best
        );
  const worstSeatByWinRate =
    seatsWithRates.length === 0
      ? null
      : seatsWithRates.reduce((worst, s) =>
          (seatWinRates[s] ?? Infinity) < (seatWinRates[worst] ?? Infinity)
            ? s
            : worst
        );

  // Longest game win streak: consecutive games where placement==1, ordered by startedAt/finishedAt
  const sortedGames = [...games].sort((a, b) => {
    const aDate = a.finishedAt || a.startedAt || "";
    const bDate = b.finishedAt || b.startedAt || "";
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });
  const gameWinFlags = sortedGames.map(g => g.placement === 1);
  const longestGameWinStreak = computeLongestStreak(gameWinFlags);

  // Current streak (from most recent game: positive = consecutive 1st, negative = consecutive non-1st)
  let currentStreak = 0;
  for (let i = sortedGames.length - 1; i >= 0; i--) {
    if (gameWinFlags[i]) {
      if (currentStreak >= 0) currentStreak += 1;
      else break;
    } else {
      if (currentStreak <= 0) currentStreak -= 1;
      else break;
    }
  }

  // Longest losing streak (consecutive games without 1st place)
  const longestLosingStreak = computeLongestStreak(gameWinFlags.map(f => !f));

  // Score consistency (standard deviation of final scores)
  const scoreConsistency = standardDeviation(games.map(g => g.finalScore));

  // Highest / lowest final score with gameId
  let highestFinalScore: { gameId: string; score: number } | null = null;
  let lowestFinalScore: { gameId: string; score: number } | null = null;
  for (const g of games) {
    if (!Number.isFinite(g.finalScore)) continue;
    if (!highestFinalScore || g.finalScore > highestFinalScore.score)
      highestFinalScore = { gameId: g.gameId, score: g.finalScore };
    if (!lowestFinalScore || g.finalScore < lowestFinalScore.score)
      lowestFinalScore = { gameId: g.gameId, score: g.finalScore };
  }

  // Per-game: running score (25000 + cumulative points_delta) and deal-in count for comeback/perfect
  const dealInGameIds = new Set(dealIns.map(d => d.gameId));
  const eventsByGame = new Map<string, PlayerHandEventForStats[]>();
  for (const e of handEvents) {
    if (!eventsByGame.has(e.gameId)) eventsByGame.set(e.gameId, []);
    eventsByGame.get(e.gameId)!.push(e);
  }
  for (const arr of eventsByGame.values()) {
    arr.sort((a, b) => a.handSeq - b.handSeq);
  }

  let comebackWins = 0;
  const comebackRecoveries: number[] = [];
  let perfectGames = 0;
  for (const g of games) {
    const evs = eventsByGame.get(g.gameId) || [];
    let running = STARTING_SCORE;
    let minRunning = STARTING_SCORE;
    for (const e of evs) {
      running += e.pointsDelta;
      if (Number.isFinite(running)) minRunning = Math.min(minRunning, running);
    }
    const hadDealIn = dealInGameIds.has(g.gameId);
    if (evs.length > 0 && !hadDealIn) perfectGames += 1;
    if (g.placement === 1 && minRunning < STARTING_SCORE) {
      comebackWins += 1;
      comebackRecoveries.push(g.finalScore - minRunning);
    }
  }
  const comebackRate = safePercent(comebackWins, gamesPlayed);
  const comebackFactor = safeAverage(comebackRecoveries);

  // Longest hand win streak within a single game (wins in consecutive handSeq)
  const winsByGame = new Map<string, Set<number>>();
  for (const w of wins) {
    if (!winsByGame.has(w.gameId)) winsByGame.set(w.gameId, new Set());
    winsByGame.get(w.gameId)!.add(w.handSeq);
  }
  let longestHandWinStreakInSingleGame = 0;
  for (const winSeqs of winsByGame.values()) {
    const seqs = [...winSeqs].sort((a, b) => a - b);
    let current = 0;
    let best = 0;
    let prev: number | null = null;
    for (const s of seqs) {
      if (prev === null || s === prev + 1) {
        current += 1;
      } else {
        current = 1;
      }
      best = Math.max(best, current);
      prev = s;
    }
    longestHandWinStreakInSingleGame = Math.max(
      longestHandWinStreakInSingleGame,
      best
    );
  }

  const biggestWinningHand = (() => {
    let best: { gameId: string; handSeq: number; value: number } | null = null;
    for (const e of wins) {
      const value =
        typeof e.details?.pointsWon === "number" &&
        Number.isFinite(e.details.pointsWon)
          ? e.details.pointsWon
          : e.pointsDelta;
      if (!Number.isFinite(value) || value <= 0) continue;
      if (!best || value > best.value)
        best = { gameId: e.gameId, handSeq: e.handSeq, value };
    }
    return best;
  })();

  const biggestLosingHand = (() => {
    let worst: { gameId: string; handSeq: number; value: number } | null = null;
    for (const e of dealIns) {
      const value = Math.abs(e.pointsDelta);
      if (!Number.isFinite(value) || value <= 0) continue;
      if (!worst || value > worst.value)
        worst = { gameId: e.gameId, handSeq: e.handSeq, value };
    }
    return worst;
  })();

  // Han/fu on wins
  const hanOnWins = wins
    .map(e =>
      typeof e.details?.han === "number" && Number.isFinite(e.details.han)
        ? e.details.han
        : null
    )
    .filter((h): h is number => h !== null);
  const fuOnWins = wins
    .map(e =>
      typeof e.details?.fu === "number" && Number.isFinite(e.details.fu)
        ? e.details.fu
        : null
    )
    .filter((f): f is number => f !== null);
  const averageHanOnWins = safeAverage(hanOnWins);
  const averageFuOnWins = safeAverage(fuOnWins);
  let highestHanAchieved: {
    gameId: string;
    handSeq: number;
    han: number;
  } | null = null;
  for (const e of wins) {
    const han =
      typeof e.details?.han === "number" && Number.isFinite(e.details.han)
        ? e.details.han
        : 0;
    if (han > 0 && (!highestHanAchieved || han > highestHanAchieved.han))
      highestHanAchieved = { gameId: e.gameId, handSeq: e.handSeq, han };
  }

  // Riichi efficiency: win rate when riichi declared vs not (on that hand)
  const riichiHandCount = handEvents.filter(e => e.riichiDeclared).length;
  const riichiHandWins = handEvents.filter(
    e =>
      e.riichiDeclared &&
      (e.eventType === "tsumo" || e.eventType === "ron") &&
      e.details?.winnerSeat &&
      e.seat === e.details.winnerSeat
  ).length;
  const noRiichiHandCount = totalHands - riichiHandCount;
  const noRiichiHandWins = wins.length - riichiHandWins;
  const riichiEfficiencyWinRate = safePercent(riichiHandWins, riichiHandCount);
  const riichiEfficiencyNoRiichiWinRate =
    noRiichiHandCount > 0
      ? safePercent(noRiichiHandWins, noRiichiHandCount)
      : null;

  // Riichi sticks collected per game (from win events details.riichiSticks)
  const riichiSticksByGame = new Map<string, number>();
  for (const e of wins) {
    const sticks =
      typeof e.details?.riichiSticks === "number" && e.details.riichiSticks >= 0
        ? e.details.riichiSticks
        : 0;
    riichiSticksByGame.set(
      e.gameId,
      (riichiSticksByGame.get(e.gameId) ?? 0) + sticks
    );
  }
  const riichiSticksPerGameValues = [...games].map(
    g => riichiSticksByGame.get(g.gameId) ?? 0
  );
  const riichiSticksCollectedPerGame =
    gamesPlayed > 0
      ? riichiSticksPerGameValues.reduce((a, b) => a + b, 0) / gamesPlayed
      : null;

  // Dealer retention = dealer win rate (when dealer wins they retain)
  const dealerRetentionRate = safePercent(
    dealerWins.length,
    dealerHands.length
  );

  // Average points per tsumo vs per ron
  const tsumoWinValues = wins
    .filter(e => e.eventType === "tsumo")
    .map(e => e.details?.pointsWon ?? e.pointsDelta)
    .filter(v => Number.isFinite(v) && v > 0);
  const ronWinValues = wins
    .filter(e => e.eventType === "ron")
    .map(e => e.details?.pointsWon ?? e.pointsDelta)
    .filter(v => Number.isFinite(v) && v > 0);
  const averagePointsPerTsumo = safeAverage(tsumoWinValues);
  const averagePointsPerRon = safeAverage(ronWinValues);

  // Round-based: East (E) vs South (S)
  const eastHands = handEvents.filter(e => e.roundKanji === "E");
  const southHands = handEvents.filter(e => e.roundKanji === "S");
  const eastDealIns = dealIns.filter(e => e.roundKanji === "E");
  const southDealIns = dealIns.filter(e => e.roundKanji === "S");
  const eastWins = wins.filter(e => e.roundKanji === "E");
  const southWins = wins.filter(e => e.roundKanji === "S");
  const dealInRateEastRound = safePercent(eastDealIns.length, eastHands.length);
  const dealInRateSouthRound = safePercent(
    southDealIns.length,
    southHands.length
  );
  const winRateEastRound = safePercent(eastWins.length, eastHands.length);
  const winRateSouthRound = safePercent(southWins.length, southHands.length);

  // Clutch factor: South 4 (round S, kyoku 4)
  const south4Hands = handEvents.filter(
    e => e.roundKanji === "S" && e.kyoku === 4
  );
  const south4Wins = wins.filter(e => e.roundKanji === "S" && e.kyoku === 4);
  const clutchFactor = safePercent(south4Wins.length, south4Hands.length);

  // Early game dominance: first 2 hands (handSeq 1 and 2)
  const earlyHands = handEvents.filter(e => e.handSeq === 1 || e.handSeq === 2);
  const earlyWins = wins.filter(e => e.handSeq === 1 || e.handSeq === 2);
  const earlyGameDominance = safePercent(earlyWins.length, earlyHands.length);

  // Comeback specialist = East seat win rate (seatWinRates.east)
  const comebackSpecialist = seatWinRates.east;

  const placementRates: Record<"1" | "2" | "3" | "4", number | null> = {
    "1": safePercent(placementCounts["1"], gamesPlayed),
    "2": safePercent(placementCounts["2"], gamesPlayed),
    "3": safePercent(placementCounts["3"], gamesPlayed),
    "4": safePercent(placementCounts["4"], gamesPlayed),
  };

  const seatAssignmentRates: Record<Seat, number | null> = {
    east: safePercent(seatCounts.east, gamesPlayed),
    south: safePercent(seatCounts.south, gamesPlayed),
    west: safePercent(seatCounts.west, gamesPlayed),
    north: safePercent(seatCounts.north, gamesPlayed),
  };

  return {
    totals: {
      gamesPlayed,
      totalHands,
      totalWins: wins.length,
      totalDealIns: dealIns.length,
    },
    gameStats: {
      bustedGameRate: safePercent(bustedGames, gamesPlayed),
      averageFinalScore,
      placementRates,
      seatAssignmentRates,
      longestGameWinStreak,
      comebackRate,
      perfectGames,
      currentStreak,
      longestLosingStreak,
      scoreConsistency,
      highestFinalScore,
      lowestFinalScore,
      comebackFactor,
    },
    handStats: {
      winRate: safePercent(wins.length, totalHands),
      tsumoRate: safePercent(tsumoWins, wins.length),
      dealInRate: safePercent(dealIns.length, totalHands),
      riichiRate: safePercent(riichiHands, totalHands),
      winWithRiichiRate: safePercent(winsWithRiichi, wins.length),
      winWithoutRiichiRate: safePercent(winsWithoutRiichi, wins.length),
      dealerWinRate: safePercent(dealerWins.length, dealerHands.length),
      nonDealerWinRate: safePercent(
        nonDealerWins.length,
        nonDealerHands.length
      ),
      seatWinRates,
      bestSeatByWinRate,
      worstSeatByWinRate,
      longestHandWinStreakInSingleGame,
      biggestWinningHand,
      biggestLosingHand,
      averageWinValue: safeAverage(winValues),
      medianWinValue: median(winValues),
      averageDealInValue: safeAverage(dealInValues),
      medianDealInValue: median(dealInValues),
      averageHanOnWins,
      averageFuOnWins,
      highestHanAchieved,
      riichiEfficiencyWinRate,
      riichiEfficiencyNoRiichiWinRate,
      riichiSticksCollectedPerGame,
      dealerRetentionRate,
      averagePointsPerTsumo,
      averagePointsPerRon,
      dealInRateEastRound,
      dealInRateSouthRound,
      winRateEastRound,
      winRateSouthRound,
      clutchFactor,
      earlyGameDominance,
      comebackSpecialist,
    },
  };
}
