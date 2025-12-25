-- Migration: Remove SECURITY DEFINER from views to address security advisor warnings
--
-- Context: These views were created with SECURITY DEFINER, which bypasses Row Level Security.
-- Since all underlying tables already have "viewable by everyone" RLS policies,
-- SECURITY DEFINER is unnecessary and creates a security risk.
--
-- This migration recreates the views without SECURITY DEFINER while maintaining
-- identical functionality.

-- 1. Recreate current_leaderboard without SECURITY DEFINER
CREATE OR REPLACE VIEW current_leaderboard AS
SELECT
  p.display_name,
  cpr.display_rating,
  cpr.games_played,
  (rc.config_data->'qualification'->>'minGames')::INTEGER AS min_games_qualify,
  cpr.games_played >= (rc.config_data->'qualification'->>'minGames')::INTEGER AS qualified,
  cpr.total_plus_minus,
  ROUND(cpr.total_plus_minus::NUMERIC / GREATEST(cpr.games_played, 1), 1) AS avg_plus_minus,
  cpr.tsumo_rate,
  cpr.ron_rate,
  cpr.riichi_rate,
  cpr.deal_in_rate,
  cpr.longest_first_streak,
  cpr.longest_fourth_free_streak,
  cpr.last_game_date,

  -- Activity status (computed real-time)
  CASE
    WHEN cpr.last_game_date < NOW() - INTERVAL '14 days' THEN 'inactive'
    WHEN cpr.last_game_date < NOW() - INTERVAL '7 days' THEN 'declining'
    ELSE 'active'
  END AS activity_status,

  -- Metadata
  cpr.config_hash,
  cpr.computed_at
FROM cached_player_ratings cpr
JOIN players p ON cpr.player_id = p.id
JOIN rating_configurations rc ON cpr.config_hash = rc.config_hash
WHERE rc.is_official = true
ORDER BY cpr.display_rating DESC;

-- 2. Recreate hand_summaries without SECURITY DEFINER
CREATE OR REPLACE VIEW hand_summaries AS
SELECT
  h.id,
  h.game_id,
  h.hand_number,
  h.wind_round,
  h.round_number,
  h.honba_count,
  h.outcome_type,
  h.dealer_seat,
  h.scores_after,
  h.completed_at,

  -- Extract winner(s) and key information
  CASE
    WHEN h.outcome_type IN ('ron', 'tsumo') THEN
      (SELECT jsonb_build_object(
        'winner_id', ha.player_id,
        'winner_name', p.display_name,
        'points', ha.points_delta,
        'han', ha.details->>'han',
        'fu', ha.details->>'fu',
        'yaku', ha.details->'yaku'
      )
      FROM hand_actions ha
      JOIN players p ON ha.player_id = p.id
      WHERE ha.hand_id = h.id AND ha.action_type = 'win'
      LIMIT 1)
    WHEN h.outcome_type IN ('double_ron', 'triple_ron') THEN
      (SELECT jsonb_agg(jsonb_build_object(
        'winner_id', ha.player_id,
        'winner_name', p.display_name,
        'points', ha.points_delta
      ))
      FROM hand_actions ha
      JOIN players p ON ha.player_id = p.id
      WHERE ha.hand_id = h.id AND ha.action_type = 'win')
    ELSE NULL
  END AS winner_info,

  -- Riichi declarations
  (SELECT jsonb_agg(ha.player_id)
   FROM hand_actions ha
   WHERE ha.hand_id = h.id AND ha.action_type = 'riichi') AS riichi_players,

  -- Tenpai players (for draws)
  (SELECT jsonb_agg(ha.player_id)
   FROM hand_actions ha
   WHERE ha.hand_id = h.id AND ha.action_type = 'tenpai') AS tenpai_players,

  h.created_at,
  h.updated_at
FROM hands h;

-- 3. Recreate game_hand_stats without SECURITY DEFINER
CREATE OR REPLACE VIEW game_hand_stats AS
SELECT
  g.id AS game_id,
  COUNT(h.id) AS total_hands,
  COUNT(CASE WHEN h.outcome_type = 'ron' THEN 1 END) AS ron_count,
  COUNT(CASE WHEN h.outcome_type = 'tsumo' THEN 1 END) AS tsumo_count,
  COUNT(CASE WHEN h.outcome_type = 'exhaustive_draw' THEN 1 END) AS draw_count,
  COUNT(CASE WHEN h.outcome_type = 'chombo' THEN 1 END) AS chombo_count,
  MAX(h.hand_number) AS last_hand_number,
  MAX(h.wind_round) AS last_wind_round,
  MAX(h.round_number) AS last_round_number,
  CASE
    WHEN COUNT(h.id) = 0 THEN 'no_hands'
    WHEN COUNT(h.id) < 8 THEN 'partial'
    ELSE 'complete'
  END AS data_quality
FROM games g
LEFT JOIN hands h ON g.id = h.game_id
GROUP BY g.id;

-- Add comments explaining the security model
COMMENT ON VIEW current_leaderboard IS
  'Public leaderboard view. Access controlled by RLS policies on underlying tables (players, cached_player_ratings, rating_configurations).';

COMMENT ON VIEW hand_summaries IS
  'Summarized hand information. Access controlled by RLS policies on underlying tables (hands, hand_actions, players).';

COMMENT ON VIEW game_hand_stats IS
  'Aggregated game statistics. Access controlled by RLS policies on underlying tables (games, hands).';
