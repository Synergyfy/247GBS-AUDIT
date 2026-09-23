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

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}