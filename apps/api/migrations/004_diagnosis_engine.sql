-- =============================================================================
-- 004 - Diagnosis + recommendation engine persistence
-- =============================================================================
-- Adds the server-computed diagnosis output and links an audit session to the
-- template whose admin-configured diagnosis model produced it.
-- All statements are idempotent.
-- =============================================================================

ALTER TABLE audit_sessions
  ADD COLUMN IF NOT EXISTS "auditFormId" VARCHAR(64) NULL;

CREATE INDEX IF NOT EXISTS idx_audit_sessions_audit_form_id
  ON audit_sessions ("auditFormId");

ALTER TABLE audit_sessions
  ADD COLUMN IF NOT EXISTS "diagnosis" JSONB NULL;

ALTER TABLE pre_audit_sessions
  ADD COLUMN IF NOT EXISTS "diagnosis" JSONB NULL;
