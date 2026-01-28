-- Achievement System Migration
-- Creates tables for achievements and player achievements

-- Create achievements table to define achievement types
CREATE TABLE IF NOT EXISTS "public"."achievements" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "code" text NOT NULL,
    "name" text NOT NULL,
    "description" text NOT NULL,
    "icon_name" text NOT NULL,
    "category" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "achievements_code_key" UNIQUE ("code")
);

ALTER TABLE "public"."achievements" OWNER TO "postgres";

COMMENT ON TABLE "public"."achievements" IS 'Defines achievement types that can be earned by players';

COMMENT ON COLUMN "public"."achievements"."code" IS 'Machine-readable identifier (e.g., "regular_season_champion", "tournament_champion")';
COMMENT ON COLUMN "public"."achievements"."name" IS 'Display name shown to users (e.g., "Regular Season Champion")';
COMMENT ON COLUMN "public"."achievements"."description" IS 'Full description shown in expanded view';
COMMENT ON COLUMN "public"."achievements"."icon_name" IS 'Icon identifier for frontend (e.g., "trophy", "crown")';
COMMENT ON COLUMN "public"."achievements"."category" IS 'Optional category for grouping (e.g., "season", "tournament")';

-- Create player_achievements table to link players to achievements
CREATE TABLE IF NOT EXISTS "public"."player_achievements" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "player_id" uuid NOT NULL,
    "achievement_id" uuid NOT NULL,
    "season_name" text NOT NULL,
    "earned_at" timestamp with time zone DEFAULT now(),
    "granted_by" uuid,
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "player_achievements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "player_achievements_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE CASCADE,
    CONSTRAINT "player_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE,
    CONSTRAINT "player_achievements_unique" UNIQUE ("player_id", "achievement_id", "season_name")
);

ALTER TABLE "public"."player_achievements" OWNER TO "postgres";

COMMENT ON TABLE "public"."player_achievements" IS 'Links players to achievements they have earned';

COMMENT ON COLUMN "public"."player_achievements"."season_name" IS 'Which season this achievement is for (e.g., "Season 3", "Season 4")';
COMMENT ON COLUMN "public"."player_achievements"."earned_at" IS 'When the achievement was granted';
COMMENT ON COLUMN "public"."player_achievements"."granted_by" IS 'Admin user who granted it (for audit trail)';
COMMENT ON COLUMN "public"."player_achievements"."metadata" IS 'Flexible storage for achievement-specific data';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_player_achievements_player_id" ON "public"."player_achievements"("player_id");
CREATE INDEX IF NOT EXISTS "idx_player_achievements_achievement_id" ON "public"."player_achievements"("achievement_id");
CREATE INDEX IF NOT EXISTS "idx_player_achievements_season_name" ON "public"."player_achievements"("season_name");

-- Insert initial achievement definitions
INSERT INTO "public"."achievements" ("code", "name", "description", "icon_name", "category")
VALUES
    ('regular_season_champion', 'Season Champion', 'Achieved the highest rating at the end of a regular season', 'crown', 'season'),
    ('tournament_champion', 'Tournament Champion', 'Won the end-of-season tournament', 'trophy', 'tournament')
ON CONFLICT ("code") DO NOTHING;
