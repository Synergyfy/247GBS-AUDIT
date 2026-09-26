-- =============================================================================
-- 002 - Business Triage question bank
-- =============================================================================
-- Target: PostgreSQL (Supabase) - run AFTER 001_business_triage_schema.sql.
--
-- Ports the Business Triage demo flow that currently only exists as a manual,
-- undocumented ts-node script (apps/api/src/scripts/seed-business-triage.ts)
-- into a migration, so production gets a working question bank on deploy
-- instead of an empty builder.
--
-- The flow is a 5-question branching tree where every path terminates in an
-- audit. It sets only the legacy "auditType" column, exactly like the script
-- does. That is intentional: resolveDestination()
-- (src/triage/destination-types.ts:75) falls back to "auditType", and both
-- pre-audit.service.ts:184 and business-triage.service.ts:709 accept
-- `auditType || destinationType`. Writing it this way keeps production
-- byte-identical to a development database seeded by the script.
--
-- Safe to re-run: questions are matched on "text" and answers on
-- ("questionId", "text"), mirroring the script's own dedupe keys.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Questions (5)
-- -----------------------------------------------------------------------------
INSERT INTO "triage_questions" ("text", "type", "order", "required", "config", "isActive")
SELECT v.text, v.type, v."order", true, '{}'::jsonb, true
FROM (
    VALUES
        ('How would you describe your business performance today?',
         'single_choice', 1),
        ('Do you currently have excess or slow-moving stock?',
         'single_choice', 2),
        ('Do you have unused operational capacity (staff, equipment or space sitting idle)?',
         'single_choice', 3),
        ('How much recovery potential do you estimate this represents each month?',
         'single_choice', 4),
        ('Would you like a full in-depth assessment of your entire business?',
         'single_choice', 5)
) AS v(text, type, "order")
WHERE NOT EXISTS (
    SELECT 1 FROM "triage_questions" q WHERE q."text" = v.text
);

-- -----------------------------------------------------------------------------
-- Answers (16) with their routing edges
--
-- next_question_text NULL  -> terminal answer, "audit_type" carries the
--                             destination (SHORT_FORM | LONG_FORM)
-- next_question_text set   -> branch to that question
--
-- The LATERAL lookups pick one row per text so a pre-existing duplicate
-- question text can never fan out into duplicated answers.
-- -----------------------------------------------------------------------------
INSERT INTO "triage_answers" (
    "questionId", "text", "nextQuestionId", "auditType",
    "destinationType", "destinationTarget", "sortOrder", "isActive"
)
SELECT
    -- "questionId" is varchar while q.id is uuid, so the cast is required.
    q.id::text,
    v.answer_text,
    nq.id,
    v.audit_type,
    NULL,
    NULL,
    v.sort_order,
    true
FROM (
    VALUES
        -- Q1 - business performance
        ('How would you describe your business performance today?',
         'Good — we''re growing and hitting targets',
         'Do you have unused operational capacity (staff, equipment or space sitting idle)?',
         NULL, 1),
        ('How would you describe your business performance today?',
         'Stable — holding steady but not growing',
         'Do you currently have excess or slow-moving stock?',
         NULL, 2),
        ('How would you describe your business performance today?',
         'Declining — sales or profit are falling',
         'How much recovery potential do you estimate this represents each month?',
         NULL, 3),
        ('How would you describe your business performance today?',
         'Not sure — I don''t regularly track performance',
         'Would you like a full in-depth assessment of your entire business?',
         NULL, 4),

        -- Q2 - excess stock
        ('Do you currently have excess or slow-moving stock?',
         'Yes — we have stock that is not selling',
         'How much recovery potential do you estimate this represents each month?',
         NULL, 1),
        ('Do you currently have excess or slow-moving stock?',
         'No — our stock moves quickly',
         'Do you have unused operational capacity (staff, equipment or space sitting idle)?',
         NULL, 2),
        ('Do you currently have excess or slow-moving stock?',
         'Not sure — I haven''t checked recently',
         'Would you like a full in-depth assessment of your entire business?',
         NULL, 3),

        -- Q3 - spare capacity
        ('Do you have unused operational capacity (staff, equipment or space sitting idle)?',
         'Yes — staff, equipment, or space sit idle',
         'How much recovery potential do you estimate this represents each month?',
         NULL, 1),
        ('Do you have unused operational capacity (staff, equipment or space sitting idle)?',
         'No — we run at full capacity',
         NULL,
         'SHORT_FORM', 2),
        ('Do you have unused operational capacity (staff, equipment or space sitting idle)?',
         'Not sure — I haven''t measured this',
         'Would you like a full in-depth assessment of your entire business?',
         NULL, 3),

        -- Q4 - recovery potential
        ('How much recovery potential do you estimate this represents each month?',
         'Under £1,000',
         'Would you like a full in-depth assessment of your entire business?',
         NULL, 1),
        ('How much recovery potential do you estimate this represents each month?',
         '£1,000 – £5,000',
         NULL,
         'LONG_FORM', 2),
        ('How much recovery potential do you estimate this represents each month?',
         'More than £5,000',
         NULL,
         'LONG_FORM', 3),
        ('How much recovery potential do you estimate this represents each month?',
         'Not sure',
         'Would you like a full in-depth assessment of your entire business?',
         NULL, 4),

        -- Q5 - full assessment
        ('Would you like a full in-depth assessment of your entire business?',
         'Yes',
         NULL,
         'LONG_FORM', 1),
        ('Would you like a full in-depth assessment of your entire business?',
         'No',
         NULL,
         'SHORT_FORM', 2)
) AS v(question_text, answer_text, next_question_text, audit_type, sort_order)
JOIN LATERAL (
    SELECT id
    FROM "triage_questions"
    WHERE "text" = v.question_text
    ORDER BY "order" ASC, "createdAt" ASC
    LIMIT 1
) q ON true
LEFT JOIN LATERAL (
    SELECT id
    FROM "triage_questions"
    WHERE "text" = v.next_question_text
    ORDER BY "order" ASC, "createdAt" ASC
    LIMIT 1
) nq ON true
WHERE NOT EXISTS (
    SELECT 1
    FROM "triage_answers" a
    WHERE a."questionId" = q.id::text
      AND a."text" = v.answer_text
);

COMMIT;

-- =============================================================================
-- Verification
--
-- Expect 5 questions and 16 answers. Every question must have options, and
-- every answer must be either a branch to a live question or a terminal
-- destination - that is what BusinessTriageService.validateFlowForPublish()
-- (src/triage/business-triage.service.ts:605) checks before the form can be
-- published, so this output confirms the admin Publish button will work.
-- =============================================================================
SELECT q."order",
       q."text",
       count(a.id) AS answers,
       count(*) FILTER (WHERE a."auditType" IS NOT NULL) AS terminal,
       count(*) FILTER (WHERE a."nextQuestionId" IS NOT NULL) AS branching
FROM "triage_questions" q
LEFT JOIN "triage_answers" a
       ON a."questionId" = q.id::text
      AND a."isActive" = true
WHERE q."isActive" = true
GROUP BY q."order", q."text"
ORDER BY q."order";

-- Dangling routes - must return zero rows.
SELECT a."text" AS dangling_answer
FROM "triage_answers" a
LEFT JOIN "triage_questions" nq ON nq.id = a."nextQuestionId"
WHERE a."nextQuestionId" IS NOT NULL
  AND nq.id IS NULL;

-- Next step (admin-only, picks the public slug):
--   POST /api/v1/admin/triage/form/publish
-- =============================================================================
-- ROLLBACK (destroys the seeded question bank; safe only if no responses have
-- been collected yet):
--
--   DELETE FROM "triage_answers" a
--    USING "triage_questions" q
--    WHERE a."questionId" = q.id
--      AND q."text" IN (
--          'How would you describe your business performance today?',
--          'Do you currently have excess or slow-moving stock?',
--          'Do you have unused operational capacity (staff, equipment or space sitting idle)?',
--          'How much recovery potential do you estimate this represents each month?',
--          'Would you like a full in-depth assessment of your entire business?'
--      );
--   DELETE FROM "triage_questions" WHERE "text" IN ( ... same list ... );
-- =============================================================================
