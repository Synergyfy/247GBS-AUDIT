import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('triage_answers')
export class TriageAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  questionId: string;

  @Column({ type: 'text' })
  text: string;

  // Destination: an answer points EITHER to the next question OR to an audit type.
  @Column({ type: 'uuid', nullable: true })
  nextQuestionId: string | null;

  // Audit types are reused from the existing audit model: SHORT_FORM | LONG_FORM
  @Column({ type: 'varchar', length: 50, nullable: true })
  auditType: string | null;

  // Controls option display order in the builder / public flow.
  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}