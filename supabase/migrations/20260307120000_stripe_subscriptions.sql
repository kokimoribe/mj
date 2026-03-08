-- Stripe Subscriptions Migration
-- Creates organizations and subscriptions tables for RiichiHub billing

-- Organizations: multi-tenant orgs linked to Stripe customers
CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "name" text NOT NULL,
    "stripe_customer_id" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "organizations_stripe_customer_id_key" UNIQUE ("stripe_customer_id")
);

ALTER TABLE "public"."organizations" OWNER TO "postgres";

COMMENT ON TABLE "public"."organizations" IS 'Multi-tenant organizations; links to Stripe Customer';
COMMENT ON COLUMN "public"."organizations"."stripe_customer_id" IS 'Stripe Customer ID from checkout';

CREATE INDEX IF NOT EXISTS "idx_organizations_stripe_customer_id" ON "public"."organizations"("stripe_customer_id");

-- Subscriptions: Stripe subscription state (single source of truth for entitlements)
CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "stripe_customer_id" text NOT NULL,
    "stripe_subscription_id" text,
    "stripe_price_id" text,
    "tier" text NOT NULL,
    "interval" text NOT NULL,
    "status" text NOT NULL,
    "current_period_end" timestamp with time zone,
    "trial_ends_at" timestamp with time zone,
    "scheduled_tier" text,
    "scheduled_interval" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscriptions_stripe_customer_id_key" UNIQUE ("stripe_customer_id")
);

ALTER TABLE "public"."subscriptions" OWNER TO "postgres";

COMMENT ON TABLE "public"."subscriptions" IS 'Stripe subscription state; synced via webhooks';
COMMENT ON COLUMN "public"."subscriptions"."tier" IS 'club | studio | professional';
COMMENT ON COLUMN "public"."subscriptions"."interval" IS 'monthly | annual';
COMMENT ON COLUMN "public"."subscriptions"."status" IS 'trial | trialing | active | past_due | canceled | unpaid';
COMMENT ON COLUMN "public"."subscriptions"."scheduled_tier" IS 'For downgrade-at-period-end';
COMMENT ON COLUMN "public"."subscriptions"."scheduled_interval" IS 'For downgrade-at-period-end';

CREATE INDEX IF NOT EXISTS "idx_subscriptions_stripe_customer_id" ON "public"."subscriptions"("stripe_customer_id");
CREATE INDEX IF NOT EXISTS "idx_subscriptions_status" ON "public"."subscriptions"("status");

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER "update_organizations_updated_at"
    BEFORE UPDATE ON "public"."organizations"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_subscriptions_updated_at"
    BEFORE UPDATE ON "public"."subscriptions"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- RLS (service_role bypasses RLS; webhooks use service_role key)
ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read orgs/subscriptions (app will use for entitlement checks)
CREATE POLICY "Authenticated can read organizations" ON "public"."organizations"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can read subscriptions" ON "public"."subscriptions"
    FOR SELECT USING (auth.role() = 'authenticated');

-- Grants
GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";

GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";
