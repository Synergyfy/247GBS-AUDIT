import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DEFAULT_QUESTION_TYPE } from '../question-types';

@Entity('triage_questions')
export class TriageQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  // Answer type that drives rendering: single_choice, short_text, number, ...
  // Existing rows default to single_choice so nothing breaks.
  @Column({ type: 'varchar', length: 50, default: DEFAULT_QUESTION_TYPE })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  hint: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string | null;

  @Column({ default: true })
  required: boolean;

  // Type-specific settings (placeholder, min/max, file limits, scale labels...).
  @Column({ type: 'jsonb', default: () => "'{}'" })
  config: Record<string, any>;

  // Question-level destination for option-less types and as a fallback.
  @Column({ type: 'uuid', nullable: true })
  defaultNextQuestionId: string | null;

  // Question-level terminal destination (SHORT_FORM | LONG_FORM).
  @Column({ type: 'varchar', length: 50, nullable: true })
  defaultAuditType: string | null;

  // Question-level terminal destination in the extensible model.
  @Column({ type: 'varchar', length: 50, nullable: true })
  defaultDestinationType: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  defaultDestinationTarget: string | null;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}