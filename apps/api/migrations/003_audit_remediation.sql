-- =============================================================================
-- 003 - Audit remediation: lastLoginAt + slug uniqueness
-- =============================================================================
-- Run in Supabase SQL editor or via psql. All statements are idempotent.
-- =============================================================================

-- M-6/I-3: real last-login timestamp (replaces hardcoded "now" in API response)
ALTER TABLE audit_users
  ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMPTZ NULL;

-- L-2: enforce slug uniqueness at the DB layer (read-then-write race guard).
-- TypeORM synchronize in dev will also create these, but production runs with
-- synchronize=false so they must exist as a migration.
CREATE UNIQUE INDEX IF NOT EXISTS uq_audit_forms_slug ON audit_forms (slug);
CREATE UNIQUE INDEX IF NOT EXISTS uq_triage_forms_slug ON triage_forms (slug);
