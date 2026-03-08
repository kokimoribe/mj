-- Drop unused tables and views
-- The app uses hand_events for game recording; hands/hand_actions were a legacy attempt.
-- current_ratings and rating_histories are unused (rating-engine uses materialization_cache).

-- Drop views first (depend on hands/hand_actions)
DROP VIEW IF EXISTS "public"."hand_summaries";
DROP VIEW IF EXISTS "public"."game_hand_stats";

-- Drop hand_actions before hands (FK: hand_actions.hand_id -> hands.id)
DROP TABLE IF EXISTS "public"."hand_actions";

-- Drop hands (FK: hands.game_id -> games.id)
DROP TABLE IF EXISTS "public"."hands";

-- Drop rating tables
DROP TABLE IF EXISTS "public"."current_ratings";
DROP TABLE IF EXISTS "public"."rating_histories";
