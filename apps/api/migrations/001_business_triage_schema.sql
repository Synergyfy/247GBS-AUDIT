-- =============================================================================
-- 001 - Business Triage / Pre-Audit schema
-- =============================================================================
-- Target: PostgreSQL (Supabase) - run in the Supabase SQL editor or via psql.
--
-- WHY THIS FILE EXISTS
-- The API runs with `synchronize: false` in production
-- (apps/api/src/app.module.ts:46 -> `synchronize: process.env.NODE_ENV !== 'production'`),
-- so TypeORM never creates or alters tables in production. Every table and
-- column below was only ever created in development by `synchronize: true`.
-- Until this migration is applied, production requests to the Business Triage
-- and Pre-Audit endpoints fail with:
--     ERROR: relation "triage_questions" does not exist
--
-- This is a DELTA migration. It assumes the pre-existing tables are already in
-- production (audit_users, audit_sessions, audit_triage, invoices,
-- billing_profiles, notification_settings, external_plans) and only adds what
-- the Business Triage / Pre-Audit / Admin settings work introduced.
--
-- Every statement is guarded so the file is safe to re-run after a partial
-- failure. Run the whole file inside a single transaction.
--
-- One intentional deviation from dev: UUID primary keys default to
-- gen_random_uuid() instead of TypeORM's uuid_generate_v4(). gen_random_uuid()
-- is built into PostgreSQL 13+ core, whereas uuid_generate_v4() needs the
-- uuid-ossp extension, which on Supabase lives in the `extensions` schema and
-- is not on the default search_path for every role. The application never
-- supplies primary keys, so the two generators are interchangeable.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- triage_questions
-- The question bank behind the public Business Triage responder and the
-- admin question builder. Mirrors src/triage/entities/triage-question.entity.ts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "triage_questions" (
    "id"                          uuid NOT NULL DEFAULT gen_random_uuid(),
    "text"                        text NOT NULL,
    -- single_choice | short_text | number | ... (see src/triage/question-types.ts)
    "type"                        varchar(50) NOT NULL DEFAULT 'single_choice',
    "description"                 text,
    "hint"                        text,
    "icon"                        varchar(50),
    "required"                    boolean NOT NULL DEFAULT true,
    -- Type-specific settings (placeholder, min/max, scale labels, ...).
    "config"                      jsonb NOT NULL DEFAULT '{}',
    -- Question-level destination, used by option-less types and as a fallback.
    "defaultNextQuestionId"       uuid,
    "defaultAuditType"            varchar(50),
    "defaultDestinationType"      varchar(50),
    "defaultDestinationTarget"    varchar(255),
    -- "order" is a reserved word, so it must stay quoted.
    "order"                       integer NOT NULL DEFAULT 0,
    "isActive"                    boolean NOT NULL DEFAULT true,
    "createdAt"                   timestamp NOT NULL DEFAULT now(),
    "updatedAt"                   timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "PK_triage_questions" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- triage_answers
-- The options for each choice question, plus the edge each option routes to.
-- Mirrors src/triage/entities/triage-answer.entity.ts
--
-- Note: an answer points EITHER to "nextQuestionId" OR to a terminal
-- destination ("auditType" / "destinationType"), never both. Deliberately no
-- foreign key on "questionId"/"nextQuestionId" - the entities declare no
-- relations, so TypeORM created no constraints in development either.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "triage_answers" (
    "id"                  uuid NOT NULL DEFAULT gen_random_uuid(),
    "questionId"          varchar NOT NULL,
    "text"                text NOT NULL,
    "nextQuestionId"      uuid,
    -- Legacy terminal destination, still honoured via resolveDestination()
    -- in src/triage/destination-types.ts.
    "auditType"           varchar(50),
    -- Current terminal destination (SHORT_FORM | LONG_FORM | SECTOR | SUPPORT
    -- | FUND_OR_DONATE | MCOM | HUMAN_REVIEW | NO_ACTION | CUSTOM).
    "destinationType"     varchar(50),
    "destinationTarget"   varchar(255),
    -- Internal-only values, never exposed to the public responder.
    "internalValue"       varchar(255),
    "tag"                 varchar(255),
    "sortOrder"           integer NOT NULL DEFAULT 0,
    "isActive"            boolean NOT NULL DEFAULT true,
    "createdAt"           timestamp NOT NULL DEFAULT now(),
    "updatedAt"           timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "PK_triage_answers" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_triage_answers_questionId"
    ON "triage_answers" ("questionId");

-- -----------------------------------------------------------------------------
-- triage_forms
-- The single Business Triage form definition: publish state, public slug and
-- the behavioural settings for the public responder.
-- Mirrors src/triage/entities/triage-form.entity.ts
--
-- No row is inserted here on purpose. TriageFormService.getOrCreate()
-- (src/triage/triage-form.service.ts:50) creates the draft row on first admin
-- access and TriageFormService.publish() (line 154) assigns the slug after
-- validating the flow. That keeps the publish decision with the admin.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "triage_forms" (
    "id"            uuid NOT NULL DEFAULT gen_random_uuid(),
    "title"         varchar(200) NOT NULL DEFAULT 'Business Triage',
    "description"   text,
    -- Public identity of the responder, e.g. /audit/triage/{slug}.
    "slug"          varchar(120),
    -- draft | published
    "status"        varchar(20) NOT NULL DEFAULT 'draft',
    "settings"      jsonb NOT NULL DEFAULT '{}',
    "publishedAt"   timestamptz,
    "createdAt"     timestamp NOT NULL DEFAULT now(),
    "updatedAt"     timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "PK_triage_forms" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_triage_forms_slug" UNIQUE ("slug")
);

CREATE INDEX IF NOT EXISTS "IDX_triage_forms_slug" ON "triage_forms" ("slug");

-- -----------------------------------------------------------------------------
-- pre_audit_sessions
-- Server-side record of a public Pre-Audit submission. Answers are re-evaluated
-- server-side; "fingerprint" deduplicates repeat submissions.
-- Mirrors src/triage/entities/pre-audit-session.entity.ts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pre_audit_sessions" (
    "id"                     uuid NOT NULL DEFAULT gen_random_uuid(),
    "email"                  text,
    "answers"                jsonb NOT NULL DEFAULT '[]',
    -- Deterministic hash of (email + ordered answers).
    "fingerprint"            varchar(64) NOT NULL,
    -- SHORT_FORM | LONG_FORM | NONE
    "recommendedAuditType"   varchar(50),
    "destinationType"        varchar(50),
    "destinationTarget"      varchar(255),
    -- Consent is recorded server-authoritatively at submission time.
    "consentGrantedAt"       timestamptz,
    "consentVersion"         varchar(20) NOT NULL DEFAULT '1',
    "completedAt"            timestamptz,
    "createdAt"              timestamp NOT NULL DEFAULT now(),
    "updatedAt"              timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "PK_pre_audit_sessions" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_pre_audit_sessions_fingerprint" UNIQUE ("fingerprint")
);

CREATE INDEX IF NOT EXISTS "IDX_pre_audit_sessions_fingerprint"
    ON "pre_audit_sessions" ("fingerprint");

-- -----------------------------------------------------------------------------
-- platform_settings
-- Singleton configuration row (id = 'app') for landing/help content.
-- Mirrors src/admin/entities/platform-setting.entity.ts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "platform_settings" (
    "id"                  varchar(20) NOT NULL DEFAULT 'app',
    "platformName"        varchar(120) NOT NULL DEFAULT '247GBS Audit',
    "supportEmail"        varchar(160),
    "landingTitle"        varchar(160),
    "landingSubtitle"     text,
    "landingCtaLabel"     varchar(120),
    "landingCtaHref"      varchar(255),
    "landingShowPreAudit" boolean NOT NULL DEFAULT true,
    "updatedAt"           timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "PK_platform_settings" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- help_resources
-- Admin-curated support/service/funding resources shown on the public pages.
-- Mirrors src/admin/entities/help-resource.entity.ts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "help_resources" (
    "id"          uuid NOT NULL DEFAULT gen_random_uuid(),
    "title"       varchar(120) NOT NULL,
    "description" text,
    -- support | service | funding | guide
    "category"    varchar(60) NOT NULL DEFAULT 'support',
    "href"        varchar(255),
    "sortOrder"   integer NOT NULL DEFAULT 0,
    "isActive"    boolean NOT NULL DEFAULT true,
    "createdAt"   timestamp NOT NULL DEFAULT now(),
    "updatedAt"   timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "PK_help_resources" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_help_resources_category"
    ON "help_resources" ("category");

-- -----------------------------------------------------------------------------
-- audit_sessions.preAuditSessionId  (ALTER - table already exists)
-- Pre-Audit -> Audit handoff key. One audit session per pre-audit session, so a
-- repeat handoff never creates a duplicate audit. Mirrors
-- src/audit/entities/audit-session.entity.ts:69-73
--
-- Safe on a populated table: every pre-existing row gets NULL, and PostgreSQL
-- permits unlimited NULLs under a UNIQUE constraint.
-- -----------------------------------------------------------------------------
ALTER TABLE "audit_sessions"
    ADD COLUMN IF NOT EXISTS "preAuditSessionId" varchar(64);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'UQ_audit_sessions_preAuditSessionId'
          AND conrelid = '"audit_sessions"'::regclass
    ) THEN
        ALTER TABLE "audit_sessions"
            ADD CONSTRAINT "UQ_audit_sessions_preAuditSessionId"
            UNIQUE ("preAuditSessionId");
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "IDX_audit_sessions_preAuditSessionId"
    ON "audit_sessions" ("preAuditSessionId");

-- -----------------------------------------------------------------------------
-- Singleton platform_settings row.
-- Not strictly required: PublicService.getSettings() falls back to hard-coded
-- copy when the row is absent (src/public/public.service.ts:33-39) and
-- AdminService creates it on first write (src/admin/admin.service.ts:422-425).
-- Inserted so the admin settings screen shows the real defaults immediately.
-- -----------------------------------------------------------------------------
INSERT INTO "platform_settings" ("id")
VALUES ('app')
ON CONFLICT ("id") DO NOTHING;

COMMIT;

-- =============================================================================
-- Verification - expect 6 rows (triage_questions, triage_answers, triage_forms,
-- pre_audit_sessions, platform_settings, help_resources) plus the new
-- audit_sessions.preAuditSessionId column.
-- =============================================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'triage_questions', 'triage_answers', 'triage_forms',
      'pre_audit_sessions', 'platform_settings', 'help_resources'
  )
ORDER BY table_name;

SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'audit_sessions'
  AND column_name = 'preAuditSessionId';

-- =============================================================================
-- ROLLBACK (only safe while there is no live triage/pre-audit traffic - these
-- steps destroy data). Run manually, in this order.
--
--   DROP INDEX IF EXISTS "IDX_audit_sessions_preAuditSessionId";
--   ALTER TABLE "audit_sessions" DROP CONSTRAINT IF EXISTS "UQ_audit_sessions_preAuditSessionId";
--   ALTER TABLE "audit_sessions" DROP COLUMN IF EXISTS "preAuditSessionId";
--   DROP TABLE IF EXISTS "help_resources";
--   DROP TABLE IF EXISTS "platform_settings";
--   DROP TABLE IF EXISTS "pre_audit_sessions";
--   DROP TABLE IF EXISTS "triage_forms";
--   DROP TABLE IF EXISTS "triage_answers";
--   DROP TABLE IF EXISTS "triage_questions";
-- =============================================================================
