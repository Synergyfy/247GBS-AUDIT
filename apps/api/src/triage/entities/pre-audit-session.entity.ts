import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * Server-side record of a public pre-audit submission. Answers are re-evaluated
 * by the server; the fingerprint column deduplicates repeat submissions.
 */
@Entity('pre_audit_sessions')
export class PreAuditSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  email: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  answers: any[];

  // Deterministic hash of (email + ordered answers) used to detect duplicates.
  @Column({ type: 'varchar', length: 64, unique: true })
  @Index()
  fingerprint: string;

  // SHORT_FORM | LONG_FORM | NONE
  @Column({ type: 'varchar', length: 50, nullable: true })
  recommendedAuditType: string | null;

  // Terminal destination of the evaluated flow, in the extensible model.
  @Column({ type: 'varchar', length: 50, nullable: true })
  destinationType: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  destinationTarget: string | null;

  // Consent is recorded server-authoritatively at submission time.
  @Column({ type: 'timestamptz', nullable: true })
  consentGrantedAt: Date | null;

  @Column({ type: 'varchar', length: 20, default: '1' })
  consentVersion: string;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}