import { MigrationInterface, QueryRunner } from 'typeorm';

// Mirrors migrations/004_diagnosis_engine.sql (idempotent) so
// `typeorm migration:run` works. See also the raw .sql for Supabase editor use.
export class DiagnosisEngine1739000000000 implements MigrationInterface {
  name = 'DiagnosisEngine1739000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE audit_sessions ADD COLUMN IF NOT EXISTS "auditFormId" VARCHAR(64) NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_sessions_audit_form_id ON audit_sessions ("auditFormId")`,
    );
    await queryRunner.query(
      `ALTER TABLE audit_sessions ADD COLUMN IF NOT EXISTS "diagnosis" JSONB NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE pre_audit_sessions ADD COLUMN IF NOT EXISTS "diagnosis" JSONB NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE pre_audit_sessions DROP COLUMN IF EXISTS "diagnosis"`,
    );
    await queryRunner.query(
      `ALTER TABLE audit_sessions DROP COLUMN IF EXISTS "diagnosis"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_audit_sessions_audit_form_id`,
    );
    await queryRunner.query(
      `ALTER TABLE audit_sessions DROP COLUMN IF EXISTS "auditFormId"`,
    );
  }
}
