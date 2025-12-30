

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."event_type" AS ENUM (
    'tsumo',
    'ron',
    'draw',
    'abortive_draw',
    'chombo'
);


ALTER TYPE "public"."event_type" OWNER TO "postgres";


CREATE TYPE "public"."game_format" AS ENUM (
    'hanchan',
    'tonpuusen'
);


ALTER TYPE "public"."game_format" OWNER TO "postgres";


CREATE TYPE "public"."game_status" AS ENUM (
    'scheduled',
    'ongoing',
    'finished',
    'cancelled'
);


ALTER TYPE "public"."game_status" OWNER TO "postgres";


CREATE TYPE "public"."hand_action_type" AS ENUM (
    'riichi',
    'win',
    'deal_in',
    'payment',
    'tenpai',
    'not_tenpai',
    'chombo_penalty',
    'honba_payment'
);


ALTER TYPE "public"."hand_action_type" OWNER TO "postgres";


CREATE TYPE "public"."hand_outcome" AS ENUM (
    'ron',
    'tsumo',
    'exhaustive_draw',
    'abortive_draw',
    'double_ron',
    'triple_ron',
    'chombo'
);


ALTER TYPE "public"."hand_outcome" OWNER TO "postgres";


CREATE TYPE "public"."riichi_seat" AS ENUM (
    'east',
    'south',
    'west',
    'north'
);


ALTER TYPE "public"."riichi_seat" OWNER TO "postgres";


CREATE TYPE "public"."table_type" AS ENUM (
    'automatic',
    'manual'
);


ALTER TYPE "public"."table_type" OWNER TO "postgres";


CREATE TYPE "public"."wind_round" AS ENUM (
    'east',
    'south',
    'west',
    'north'
);


ALTER TYPE "public"."wind_round" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_next_dealer"("current_dealer" "public"."riichi_seat", "outcome" "public"."hand_outcome", "dealer_won" boolean) RETURNS "public"."riichi_seat"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Dealer continues if they won or were tenpai in draw (based on rules)
  IF dealer_won OR outcome = 'chombo' THEN
    RETURN current_dealer;
  END IF;
  
  -- Otherwise rotate counter-clockwise
  RETURN CASE current_dealer
    WHEN 'east' THEN 'south'::riichi_seat
    WHEN 'south' THEN 'west'::riichi_seat
    WHEN 'west' THEN 'north'::riichi_seat
    WHEN 'north' THEN 'east'::riichi_seat
  END;
END;
$$;


ALTER FUNCTION "public"."get_next_dealer"("current_dealer" "public"."riichi_seat", "outcome" "public"."hand_outcome", "dealer_won" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_hand_data"("hand_data" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  total_points_delta INTEGER;
  total_riichi_delta INTEGER;
BEGIN
  -- Check that points balance to zero
  SELECT SUM((action->>'points_delta')::INTEGER)
  INTO total_points_delta
  FROM jsonb_array_elements(hand_data->'actions') AS action
  WHERE action->>'points_delta' IS NOT NULL;
  
  IF total_points_delta != 0 THEN
    RAISE EXCEPTION 'Points do not balance to zero: %', total_points_delta;
  END IF;
  
  -- Check riichi sticks balance (except for wins where pot is collected)
  -- This is more complex and would need full implementation
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."validate_hand_data"("hand_data" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cached_game_results" (
    "config_hash" "text" NOT NULL,
    "game_id" "uuid" NOT NULL,
    "player_id" "uuid" NOT NULL,
    "seat" "public"."riichi_seat" NOT NULL,
    "final_score" integer NOT NULL,
    "placement" integer NOT NULL,
    "plus_minus" integer NOT NULL,
    "rating_weight" numeric(4,2),
    "mu_before" numeric(8,4),
    "sigma_before" numeric(8,4),
    "mu_after" numeric(8,4),
    "sigma_after" numeric(8,4),
    "computed_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cached_game_results_placement_check" CHECK ((("placement" >= 1) AND ("placement" <= 4)))
);


ALTER TABLE "public"."cached_game_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."cached_game_results" IS 'Processed game outcomes with configuration-specific oka/uma - can be regenerated';



CREATE TABLE IF NOT EXISTS "public"."cached_player_ratings" (
    "config_hash" "text" NOT NULL,
    "player_id" "uuid" NOT NULL,
    "games_start_date" "date" NOT NULL,
    "games_end_date" "date" NOT NULL,
    "mu" numeric(8,4) NOT NULL,
    "sigma" numeric(8,4) NOT NULL,
    "display_rating" numeric(8,2) NOT NULL,
    "games_played" integer DEFAULT 0,
    "total_plus_minus" integer DEFAULT 0,
    "best_game_plus" integer,
    "worst_game_minus" integer,
    "longest_first_streak" integer DEFAULT 0,
    "longest_fourth_free_streak" integer DEFAULT 0,
    "last_game_date" timestamp with time zone,
    "last_decay_applied" timestamp with time zone,
    "tsumo_rate" numeric(5,4),
    "ron_rate" numeric(5,4),
    "riichi_rate" numeric(5,4),
    "deal_in_rate" numeric(5,4),
    "computed_at" timestamp with time zone DEFAULT "now"(),
    "source_data_hash" "text" NOT NULL
);


ALTER TABLE "public"."cached_player_ratings" OWNER TO "postgres";


COMMENT ON TABLE "public"."cached_player_ratings" IS 'Computed player ratings and statistics per configuration - can be regenerated';



COMMENT ON COLUMN "public"."cached_player_ratings"."source_data_hash" IS 'Hash of source game data for smart cache invalidation';



CREATE TABLE IF NOT EXISTS "public"."players" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "display_name" "text" NOT NULL,
    "auth_user_id" "uuid",
    "email" "text",
    "phone" "text",
    "timezone" "text" DEFAULT 'America/Los_Angeles'::"text",
    "notification_preferences" "jsonb" DEFAULT '{"push": true, "email": true}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."players" OWNER TO "postgres";


COMMENT ON TABLE "public"."players" IS 'Core player profiles - season agnostic';



COMMENT ON COLUMN "public"."players"."auth_user_id" IS 'Links to Supabase auth system, nullable for admin-created players';



CREATE TABLE IF NOT EXISTS "public"."rating_configurations" (
    "config_hash" "text" NOT NULL,
    "config_data" "jsonb" NOT NULL,
    "name" "text",
    "description" "text",
    "is_official" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_used_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."rating_configurations" OWNER TO "postgres";


COMMENT ON TABLE "public"."rating_configurations" IS 'Hash-based configuration storage for flexible rating system experiments';



COMMENT ON COLUMN "public"."rating_configurations"."config_hash" IS 'SHA-256 of normalized config JSON for cache invalidation';



CREATE OR REPLACE VIEW "public"."current_leaderboard" WITH ("security_invoker"='true') AS
 SELECT "p"."display_name",
    "cpr"."display_rating",
    "cpr"."games_played",
    ((("rc"."config_data" -> 'qualification'::"text") ->> 'minGames'::"text"))::integer AS "min_games_qualify",
    ("cpr"."games_played" >= ((("rc"."config_data" -> 'qualification'::"text") ->> 'minGames'::"text"))::integer) AS "qualified",
    "cpr"."total_plus_minus",
    "round"((("cpr"."total_plus_minus")::numeric / (GREATEST("cpr"."games_played", 1))::numeric), 1) AS "avg_plus_minus",
    "cpr"."tsumo_rate",
    "cpr"."ron_rate",
    "cpr"."riichi_rate",
    "cpr"."deal_in_rate",
    "cpr"."longest_first_streak",
    "cpr"."longest_fourth_free_streak",
    "cpr"."last_game_date",
        CASE
            WHEN ("cpr"."last_game_date" < ("now"() - '14 days'::interval)) THEN 'inactive'::"text"
            WHEN ("cpr"."last_game_date" < ("now"() - '7 days'::interval)) THEN 'declining'::"text"
            ELSE 'active'::"text"
        END AS "activity_status",
    "cpr"."config_hash",
    "cpr"."computed_at"
   FROM (("public"."cached_player_ratings" "cpr"
     JOIN "public"."players" "p" ON (("cpr"."player_id" = "p"."id")))
     JOIN "public"."rating_configurations" "rc" ON (("cpr"."config_hash" = "rc"."config_hash")))
  WHERE ("rc"."is_official" = true)
  ORDER BY "cpr"."display_rating" DESC;


ALTER VIEW "public"."current_leaderboard" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."current_ratings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "config_hash" "text" NOT NULL,
    "player_id" "uuid" NOT NULL,
    "player_name" "text" NOT NULL,
    "rating" numeric(8,2) NOT NULL,
    "uncertainty" numeric(8,2) NOT NULL,
    "mu" numeric(8,2) NOT NULL,
    "sigma" numeric(8,2) NOT NULL,
    "games_played" integer DEFAULT 0 NOT NULL,
    "total_plus_minus" integer DEFAULT 0 NOT NULL,
    "best_game_plus" integer,
    "worst_game_minus" integer,
    "longest_first_streak" integer DEFAULT 0,
    "longest_fourth_free_streak" integer DEFAULT 0,
    "tsumo_rate" numeric(5,2) DEFAULT 0,
    "ron_rate" numeric(5,2) DEFAULT 0,
    "riichi_rate" numeric(5,2) DEFAULT 0,
    "deal_in_rate" numeric(5,2) DEFAULT 0,
    "last_game_date" timestamp with time zone,
    "computed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."current_ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."games" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "started_at" timestamp with time zone NOT NULL,
    "finished_at" timestamp with time zone,
    "status" "public"."game_status" DEFAULT 'ongoing'::"public"."game_status",
    "scheduled_at" timestamp with time zone,
    "table_type" "public"."table_type" DEFAULT 'automatic'::"public"."table_type",
    "location" "text" DEFAULT 'Host House'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "game_format" "public"."game_format" DEFAULT 'hanchan'::"public"."game_format"
);


ALTER TABLE "public"."games" OWNER TO "postgres";


COMMENT ON TABLE "public"."games" IS 'Game sessions without embedded season configuration';



COMMENT ON COLUMN "public"."games"."started_at" IS 'Game start time - used for season determination via configuration time ranges';



COMMENT ON COLUMN "public"."games"."game_format" IS 'Game length format: hanchan (East+South) or tonpuusen (East only)';



CREATE TABLE IF NOT EXISTS "public"."hands" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "game_id" "uuid" NOT NULL,
    "hand_number" integer NOT NULL,
    "wind_round" "public"."wind_round" NOT NULL,
    "round_number" integer NOT NULL,
    "honba_count" integer DEFAULT 0 NOT NULL,
    "riichi_pot_before" integer DEFAULT 0 NOT NULL,
    "outcome_type" "public"."hand_outcome" NOT NULL,
    "dealer_seat" "public"."riichi_seat" NOT NULL,
    "scores_after" "jsonb" NOT NULL,
    "completed_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "hands_hand_number_check" CHECK (("hand_number" > 0)),
    CONSTRAINT "hands_honba_count_check" CHECK (("honba_count" >= 0)),
    CONSTRAINT "hands_riichi_pot_before_check" CHECK (("riichi_pot_before" >= 0)),
    CONSTRAINT "hands_round_number_check" CHECK ((("round_number" >= 1) AND ("round_number" <= 4)))
);


ALTER TABLE "public"."hands" OWNER TO "postgres";


COMMENT ON TABLE "public"."hands" IS 'Hand-by-hand game records for detailed game history';



COMMENT ON COLUMN "public"."hands"."scores_after" IS 'Snapshot of all player scores after this hand';



COMMENT ON COLUMN "public"."hands"."completed_at" IS 'NULL for incomplete/unverified hands';



CREATE OR REPLACE VIEW "public"."game_hand_stats" WITH ("security_invoker"='true') AS
 SELECT "g"."id" AS "game_id",
    "count"("h"."id") AS "total_hands",
    "count"(
        CASE
            WHEN ("h"."outcome_type" = 'ron'::"public"."hand_outcome") THEN 1
            ELSE NULL::integer
        END) AS "ron_count",
    "count"(
        CASE
            WHEN ("h"."outcome_type" = 'tsumo'::"public"."hand_outcome") THEN 1
            ELSE NULL::integer
        END) AS "tsumo_count",
    "count"(
        CASE
            WHEN ("h"."outcome_type" = 'exhaustive_draw'::"public"."hand_outcome") THEN 1
            ELSE NULL::integer
        END) AS "draw_count",
    "count"(
        CASE
            WHEN ("h"."outcome_type" = 'chombo'::"public"."hand_outcome") THEN 1
            ELSE NULL::integer
        END) AS "chombo_count",
    "max"("h"."hand_number") AS "last_hand_number",
    "max"("h"."wind_round") AS "last_wind_round",
    "max"("h"."round_number") AS "last_round_number",
        CASE
            WHEN ("count"("h"."id") = 0) THEN 'no_hands'::"text"
            WHEN ("count"("h"."id") < 8) THEN 'partial'::"text"
            ELSE 'complete'::"text"
        END AS "data_quality"
   FROM ("public"."games" "g"
     LEFT JOIN "public"."hands" "h" ON (("g"."id" = "h"."game_id")))
  GROUP BY "g"."id";


ALTER VIEW "public"."game_hand_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_seats" (
    "game_id" "uuid" NOT NULL,
    "seat" "public"."riichi_seat" NOT NULL,
    "player_id" "uuid",
    "final_score" integer
);


ALTER TABLE "public"."game_seats" OWNER TO "postgres";


COMMENT ON TABLE "public"."game_seats" IS 'Player seating assignments and final scores';



COMMENT ON COLUMN "public"."game_seats"."final_score" IS 'Raw final score (e.g., 48100) - oka/uma applied per configuration';



CREATE TABLE IF NOT EXISTS "public"."hand_actions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "hand_id" "uuid" NOT NULL,
    "player_id" "uuid" NOT NULL,
    "action_type" "public"."hand_action_type" NOT NULL,
    "action_order" integer NOT NULL,
    "points_delta" integer,
    "riichi_stick_delta" integer DEFAULT 0,
    "honba_stick_delta" integer DEFAULT 0,
    "target_player_id" "uuid",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "hand_actions_action_order_check" CHECK (("action_order" > 0))
);


ALTER TABLE "public"."hand_actions" OWNER TO "postgres";


COMMENT ON TABLE "public"."hand_actions" IS 'Individual player actions within each hand';



COMMENT ON COLUMN "public"."hand_actions"."target_player_id" IS 'Used for deal_in to specify who won';



COMMENT ON COLUMN "public"."hand_actions"."details" IS 'Flexible JSON for han, fu, yaku, notes, etc.';



CREATE TABLE IF NOT EXISTS "public"."hand_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "game_id" "uuid",
    "hand_seq" smallint NOT NULL,
    "seat" "public"."riichi_seat" NOT NULL,
    "event_type" "public"."event_type" NOT NULL,
    "riichi_declared" boolean DEFAULT false NOT NULL,
    "points_delta" integer NOT NULL,
    "pot_delta" integer DEFAULT 0 NOT NULL,
    "round_kanji" character(1) NOT NULL,
    "kyoku" smallint NOT NULL,
    "honba" smallint DEFAULT 0 NOT NULL,
    "details" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "hand_events_kyoku_check" CHECK ((("kyoku" >= 1) AND ("kyoku" <= 4))),
    CONSTRAINT "hand_events_round_kanji_check" CHECK (("round_kanji" = ANY (ARRAY['E'::"bpchar", 'S'::"bpchar", 'W'::"bpchar", 'N'::"bpchar"])))
);


ALTER TABLE "public"."hand_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."hand_events" IS 'Hand-by-hand game logs for detailed tracking';



CREATE OR REPLACE VIEW "public"."hand_summaries" WITH ("security_invoker"='true') AS
 SELECT "id",
    "game_id",
    "hand_number",
    "wind_round",
    "round_number",
    "honba_count",
    "outcome_type",
    "dealer_seat",
    "scores_after",
    "completed_at",
        CASE
            WHEN ("outcome_type" = ANY (ARRAY['ron'::"public"."hand_outcome", 'tsumo'::"public"."hand_outcome"])) THEN ( SELECT "jsonb_build_object"('winner_id', "ha"."player_id", 'winner_name', "p"."display_name", 'points', "ha"."points_delta", 'han', ("ha"."details" ->> 'han'::"text"), 'fu', ("ha"."details" ->> 'fu'::"text"), 'yaku', ("ha"."details" -> 'yaku'::"text")) AS "jsonb_build_object"
               FROM ("public"."hand_actions" "ha"
                 JOIN "public"."players" "p" ON (("ha"."player_id" = "p"."id")))
              WHERE (("ha"."hand_id" = "h"."id") AND ("ha"."action_type" = 'win'::"public"."hand_action_type"))
             LIMIT 1)
            WHEN ("outcome_type" = ANY (ARRAY['double_ron'::"public"."hand_outcome", 'triple_ron'::"public"."hand_outcome"])) THEN ( SELECT "jsonb_agg"("jsonb_build_object"('winner_id', "ha"."player_id", 'winner_name', "p"."display_name", 'points', "ha"."points_delta")) AS "jsonb_agg"
               FROM ("public"."hand_actions" "ha"
                 JOIN "public"."players" "p" ON (("ha"."player_id" = "p"."id")))
              WHERE (("ha"."hand_id" = "h"."id") AND ("ha"."action_type" = 'win'::"public"."hand_action_type")))
            ELSE NULL::"jsonb"
        END AS "winner_info",
    ( SELECT "jsonb_agg"("ha"."player_id") AS "jsonb_agg"
           FROM "public"."hand_actions" "ha"
          WHERE (("ha"."hand_id" = "h"."id") AND ("ha"."action_type" = 'riichi'::"public"."hand_action_type"))) AS "riichi_players",
    ( SELECT "jsonb_agg"("ha"."player_id") AS "jsonb_agg"
           FROM "public"."hand_actions" "ha"
          WHERE (("ha"."hand_id" = "h"."id") AND ("ha"."action_type" = 'tenpai'::"public"."hand_action_type"))) AS "tenpai_players",
    "created_at",
    "updated_at"
   FROM "public"."hands" "h";


ALTER VIEW "public"."hand_summaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."materialization_cache" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "config_hash" "text" NOT NULL,
    "source_data_hash" "text" NOT NULL,
    "players_count" integer NOT NULL,
    "games_count" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."materialization_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rating_histories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "config_hash" "text" NOT NULL,
    "player_id" "uuid" NOT NULL,
    "player_name" "text" NOT NULL,
    "game_id" "uuid" NOT NULL,
    "game_date" timestamp with time zone NOT NULL,
    "game_count" integer NOT NULL,
    "rating" numeric(8,2) NOT NULL,
    "uncertainty" numeric(8,2) NOT NULL,
    "mu" numeric(8,2) NOT NULL,
    "sigma" numeric(8,2) NOT NULL,
    "placement" integer NOT NULL,
    "plus_minus" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "rating_histories_placement_check" CHECK ((("placement" >= 1) AND ("placement" <= 4)))
);


ALTER TABLE "public"."rating_histories" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cached_game_results"
    ADD CONSTRAINT "cached_game_results_config_hash_game_id_seat_key" UNIQUE ("config_hash", "game_id", "seat");



ALTER TABLE ONLY "public"."cached_game_results"
    ADD CONSTRAINT "cached_game_results_pkey" PRIMARY KEY ("config_hash", "game_id", "player_id");



ALTER TABLE ONLY "public"."cached_player_ratings"
    ADD CONSTRAINT "cached_player_ratings_pkey" PRIMARY KEY ("config_hash", "player_id", "games_start_date", "games_end_date");



ALTER TABLE ONLY "public"."current_ratings"
    ADD CONSTRAINT "current_ratings_config_player_key" UNIQUE ("config_hash", "player_id");



ALTER TABLE ONLY "public"."current_ratings"
    ADD CONSTRAINT "current_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."game_seats"
    ADD CONSTRAINT "game_seats_game_id_player_id_key" UNIQUE ("game_id", "player_id");



ALTER TABLE ONLY "public"."game_seats"
    ADD CONSTRAINT "game_seats_pkey" PRIMARY KEY ("game_id", "seat");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hand_actions"
    ADD CONSTRAINT "hand_actions_hand_id_action_order_key" UNIQUE ("hand_id", "action_order");



ALTER TABLE ONLY "public"."hand_actions"
    ADD CONSTRAINT "hand_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hand_events"
    ADD CONSTRAINT "hand_events_game_id_hand_seq_seat_key" UNIQUE ("game_id", "hand_seq", "seat");



ALTER TABLE ONLY "public"."hand_events"
    ADD CONSTRAINT "hand_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hands"
    ADD CONSTRAINT "hands_game_id_hand_number_key" UNIQUE ("game_id", "hand_number");



ALTER TABLE ONLY "public"."hands"
    ADD CONSTRAINT "hands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."materialization_cache"
    ADD CONSTRAINT "materialization_cache_config_hash_key" UNIQUE ("config_hash");



ALTER TABLE ONLY "public"."materialization_cache"
    ADD CONSTRAINT "materialization_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_display_name_key" UNIQUE ("display_name");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rating_configurations"
    ADD CONSTRAINT "rating_configurations_pkey" PRIMARY KEY ("config_hash");



ALTER TABLE ONLY "public"."rating_histories"
    ADD CONSTRAINT "rating_histories_config_player_game_key" UNIQUE ("config_hash", "player_id", "game_id");



ALTER TABLE ONLY "public"."rating_histories"
    ADD CONSTRAINT "rating_histories_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_cached_game_results_config" ON "public"."cached_game_results" USING "btree" ("config_hash", "game_id");



CREATE INDEX "idx_cached_game_results_player" ON "public"."cached_game_results" USING "btree" ("config_hash", "player_id", "computed_at");



CREATE INDEX "idx_cached_player_ratings_config" ON "public"."cached_player_ratings" USING "btree" ("config_hash");



CREATE INDEX "idx_cached_ratings_config" ON "public"."cached_player_ratings" USING "btree" ("config_hash", "display_rating" DESC);



CREATE INDEX "idx_cached_ratings_hash" ON "public"."cached_player_ratings" USING "btree" ("source_data_hash");



CREATE INDEX "idx_cached_ratings_player" ON "public"."cached_player_ratings" USING "btree" ("player_id", "computed_at");



CREATE INDEX "idx_current_ratings_config" ON "public"."current_ratings" USING "btree" ("config_hash");



CREATE INDEX "idx_current_ratings_rating" ON "public"."current_ratings" USING "btree" ("rating" DESC);



CREATE INDEX "idx_game_seats_game" ON "public"."game_seats" USING "btree" ("game_id");



CREATE INDEX "idx_game_seats_player" ON "public"."game_seats" USING "btree" ("player_id");



CREATE INDEX "idx_games_finished_at" ON "public"."games" USING "btree" ("finished_at");



CREATE INDEX "idx_games_format" ON "public"."games" USING "btree" ("game_format");



CREATE INDEX "idx_games_started_at" ON "public"."games" USING "btree" ("started_at");



CREATE INDEX "idx_games_status" ON "public"."games" USING "btree" ("status");



CREATE INDEX "idx_hand_actions_hand_id" ON "public"."hand_actions" USING "btree" ("hand_id", "action_order");



CREATE INDEX "idx_hand_actions_player_id" ON "public"."hand_actions" USING "btree" ("player_id");



CREATE INDEX "idx_hand_actions_type" ON "public"."hand_actions" USING "btree" ("action_type");



CREATE INDEX "idx_hand_events_game" ON "public"."hand_events" USING "btree" ("game_id");



CREATE INDEX "idx_hand_events_game_seq" ON "public"."hand_events" USING "btree" ("game_id", "hand_seq");



CREATE INDEX "idx_hand_events_seat" ON "public"."hand_events" USING "btree" ("seat");



CREATE INDEX "idx_hands_created_at" ON "public"."hands" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_hands_dealer" ON "public"."hands" USING "btree" ("dealer_seat");



CREATE INDEX "idx_hands_game_id" ON "public"."hands" USING "btree" ("game_id", "hand_number");



CREATE INDEX "idx_hands_outcome" ON "public"."hands" USING "btree" ("outcome_type");



CREATE INDEX "idx_players_auth_user" ON "public"."players" USING "btree" ("auth_user_id");



CREATE INDEX "idx_players_display_name" ON "public"."players" USING "btree" ("display_name");



CREATE INDEX "idx_rating_configs_creator" ON "public"."rating_configurations" USING "btree" ("created_by", "created_at");



CREATE INDEX "idx_rating_configs_official" ON "public"."rating_configurations" USING "btree" ("is_official", "last_used_at");



CREATE INDEX "idx_rating_histories_config_player" ON "public"."rating_histories" USING "btree" ("config_hash", "player_id");



CREATE INDEX "idx_rating_histories_game_date" ON "public"."rating_histories" USING "btree" ("game_date");



CREATE OR REPLACE TRIGGER "update_games_updated_at" BEFORE UPDATE ON "public"."games" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_hands_updated_at" BEFORE UPDATE ON "public"."hands" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_players_updated_at" BEFORE UPDATE ON "public"."players" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."cached_game_results"
    ADD CONSTRAINT "cached_game_results_config_hash_fkey" FOREIGN KEY ("config_hash") REFERENCES "public"."rating_configurations"("config_hash");



ALTER TABLE ONLY "public"."cached_game_results"
    ADD CONSTRAINT "cached_game_results_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id");



ALTER TABLE ONLY "public"."cached_game_results"
    ADD CONSTRAINT "cached_game_results_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id");



ALTER TABLE ONLY "public"."cached_player_ratings"
    ADD CONSTRAINT "cached_player_ratings_config_hash_fkey" FOREIGN KEY ("config_hash") REFERENCES "public"."rating_configurations"("config_hash");



ALTER TABLE ONLY "public"."cached_player_ratings"
    ADD CONSTRAINT "cached_player_ratings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id");



ALTER TABLE ONLY "public"."current_ratings"
    ADD CONSTRAINT "current_ratings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_seats"
    ADD CONSTRAINT "game_seats_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_seats"
    ADD CONSTRAINT "game_seats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."hand_actions"
    ADD CONSTRAINT "hand_actions_hand_id_fkey" FOREIGN KEY ("hand_id") REFERENCES "public"."hands"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hand_actions"
    ADD CONSTRAINT "hand_actions_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id");



ALTER TABLE ONLY "public"."hand_actions"
    ADD CONSTRAINT "hand_actions_target_player_id_fkey" FOREIGN KEY ("target_player_id") REFERENCES "public"."players"("id");



ALTER TABLE ONLY "public"."hand_events"
    ADD CONSTRAINT "hand_events_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hands"
    ADD CONSTRAINT "hands_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."players"("id");



ALTER TABLE ONLY "public"."hands"
    ADD CONSTRAINT "hands_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."rating_configurations"
    ADD CONSTRAINT "rating_configurations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."players"("id");



ALTER TABLE ONLY "public"."rating_histories"
    ADD CONSTRAINT "rating_histories_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rating_histories"
    ADD CONSTRAINT "rating_histories_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can create games" ON "public"."games" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can create players" ON "public"."players" FOR INSERT WITH CHECK (true);



COMMENT ON POLICY "Anyone can create players" ON "public"."players" IS 'Allows player creation without authentication. -jmoon';



CREATE POLICY "Anyone can delete hands" ON "public"."hand_events" FOR DELETE USING (true);



CREATE POLICY "Anyone can insert game seats" ON "public"."game_seats" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can record hands" ON "public"."hand_events" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can update game seats" ON "public"."game_seats" FOR UPDATE USING (true);



CREATE POLICY "Anyone can update games" ON "public"."games" FOR UPDATE USING (true);



CREATE POLICY "Anyone can update hands" ON "public"."hand_events" FOR UPDATE USING (true);



CREATE POLICY "Authenticated users can create configs" ON "public"."rating_configurations" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can create hand actions" ON "public"."hand_actions" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can create hands" ON "public"."hands" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Cached ratings are viewable by everyone" ON "public"."cached_player_ratings" FOR SELECT USING (true);



CREATE POLICY "Cached results are viewable by everyone" ON "public"."cached_game_results" FOR SELECT USING (true);



CREATE POLICY "Game seats are viewable by everyone" ON "public"."game_seats" FOR SELECT USING (true);



CREATE POLICY "Games are viewable by everyone" ON "public"."games" FOR SELECT USING (true);



CREATE POLICY "Hand actions are viewable by everyone" ON "public"."hand_actions" FOR SELECT USING (true);



CREATE POLICY "Hand events are viewable by everyone" ON "public"."hand_events" FOR SELECT USING (true);



CREATE POLICY "Hands are viewable by everyone" ON "public"."hands" FOR SELECT USING (true);



CREATE POLICY "Players are viewable by everyone" ON "public"."players" FOR SELECT USING (true);



CREATE POLICY "Rating configs are viewable by everyone" ON "public"."rating_configurations" FOR SELECT USING (true);



CREATE POLICY "Users can update own profile" ON "public"."players" FOR UPDATE USING (("auth"."uid"() = "auth_user_id"));



CREATE POLICY "Users can update recent hand actions" ON "public"."hand_actions" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND ("created_at" > ("now"() - '00:05:00'::interval))));



CREATE POLICY "Users can update recent hands" ON "public"."hands" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND ("created_at" > ("now"() - '00:05:00'::interval))));



ALTER TABLE "public"."cached_game_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cached_player_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_seats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hand_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hand_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hands" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rating_configurations" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_next_dealer"("current_dealer" "public"."riichi_seat", "outcome" "public"."hand_outcome", "dealer_won" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_next_dealer"("current_dealer" "public"."riichi_seat", "outcome" "public"."hand_outcome", "dealer_won" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_next_dealer"("current_dealer" "public"."riichi_seat", "outcome" "public"."hand_outcome", "dealer_won" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_hand_data"("hand_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_hand_data"("hand_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_hand_data"("hand_data" "jsonb") TO "service_role";


















GRANT ALL ON TABLE "public"."cached_game_results" TO "anon";
GRANT ALL ON TABLE "public"."cached_game_results" TO "authenticated";
GRANT ALL ON TABLE "public"."cached_game_results" TO "service_role";



GRANT ALL ON TABLE "public"."cached_player_ratings" TO "anon";
GRANT ALL ON TABLE "public"."cached_player_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."cached_player_ratings" TO "service_role";



GRANT ALL ON TABLE "public"."players" TO "anon";
GRANT ALL ON TABLE "public"."players" TO "authenticated";
GRANT ALL ON TABLE "public"."players" TO "service_role";



GRANT ALL ON TABLE "public"."rating_configurations" TO "anon";
GRANT ALL ON TABLE "public"."rating_configurations" TO "authenticated";
GRANT ALL ON TABLE "public"."rating_configurations" TO "service_role";



GRANT ALL ON TABLE "public"."current_leaderboard" TO "anon";
GRANT ALL ON TABLE "public"."current_leaderboard" TO "authenticated";
GRANT ALL ON TABLE "public"."current_leaderboard" TO "service_role";



GRANT ALL ON TABLE "public"."current_ratings" TO "anon";
GRANT ALL ON TABLE "public"."current_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."current_ratings" TO "service_role";



GRANT ALL ON TABLE "public"."games" TO "anon";
GRANT ALL ON TABLE "public"."games" TO "authenticated";
GRANT ALL ON TABLE "public"."games" TO "service_role";



GRANT ALL ON TABLE "public"."hands" TO "anon";
GRANT ALL ON TABLE "public"."hands" TO "authenticated";
GRANT ALL ON TABLE "public"."hands" TO "service_role";



GRANT ALL ON TABLE "public"."game_hand_stats" TO "anon";
GRANT ALL ON TABLE "public"."game_hand_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."game_hand_stats" TO "service_role";



GRANT ALL ON TABLE "public"."game_seats" TO "anon";
GRANT ALL ON TABLE "public"."game_seats" TO "authenticated";
GRANT ALL ON TABLE "public"."game_seats" TO "service_role";



GRANT ALL ON TABLE "public"."hand_actions" TO "anon";
GRANT ALL ON TABLE "public"."hand_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."hand_actions" TO "service_role";



GRANT ALL ON TABLE "public"."hand_events" TO "anon";
GRANT ALL ON TABLE "public"."hand_events" TO "authenticated";
GRANT ALL ON TABLE "public"."hand_events" TO "service_role";



GRANT ALL ON TABLE "public"."hand_summaries" TO "anon";
GRANT ALL ON TABLE "public"."hand_summaries" TO "authenticated";
GRANT ALL ON TABLE "public"."hand_summaries" TO "service_role";



GRANT ALL ON TABLE "public"."materialization_cache" TO "anon";
GRANT ALL ON TABLE "public"."materialization_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."materialization_cache" TO "service_role";



GRANT ALL ON TABLE "public"."rating_histories" TO "anon";
GRANT ALL ON TABLE "public"."rating_histories" TO "authenticated";
GRANT ALL ON TABLE "public"."rating_histories" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























drop extension if exists "pg_net";


