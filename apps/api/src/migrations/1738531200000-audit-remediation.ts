import { MigrationInterface, QueryRunner } from 'typeorm';

// Mirrors migrations/003_audit_remediation.sql (idempotent) so
// `typeorm migration:run` works. See also the raw .sql for Supabase editor use.
export class AuditRemediation1738531200000 implements MigrationInterface {
  name = 'AuditRemediation1738531200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE audit_users ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMPTZ NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS uq_audit_forms_slug ON audit_forms (slug)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS uq_triage_forms_slug ON triage_forms (slug)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS uq_triage_forms_slug`);
    await queryRunner.query(`DROP INDEX IF EXISTS uq_audit_forms_slug`);
    await queryRunner.query(`ALTER TABLE audit_users DROP COLUMN IF EXISTS "lastLoginAt"`);
  }
}
