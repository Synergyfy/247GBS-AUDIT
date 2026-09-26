import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * The single Business Triage form definition: its publish state, its public
 * responder identity (slug) and the behavioural settings that drive the public
 * responder experience (email collection, progress bar, confirmation copy...).
 *
 * Editing uses a simple publish gate: one live form, edits apply immediately.
 * The slug is stable once created so published links keep working as long as
 * the form stays published.
 */
@Entity('triage_forms')
export class TriageForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, default: 'Business Triage' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // Public identity of the responder, e.g. /audit/triage/{slug}.
  @Column({ type: 'varchar', length: 120, nullable: true, unique: true })
  @Index()
  slug: string | null;

  // draft | published — the form is public only when published.
  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string;

  // Behavioural settings for the public responder (JSONB, validated on write).
  @Column({ type: 'jsonb', default: () => "'{}'" })
  settings: Record<string, any>;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}