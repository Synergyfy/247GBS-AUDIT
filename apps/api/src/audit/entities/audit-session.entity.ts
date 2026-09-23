import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AuditStatus {
  TRIAGE_COMPLETED = 'TRIAGE_COMPLETED',
  SECTOR_SELECTED = 'SECTOR_SELECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

@Entity('audit_sessions')
export class AuditSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: AuditStatus, default: AuditStatus.TRIAGE_COMPLETED })
  status: AuditStatus;

  @Column({ nullable: true })
  auditType: string; // LONG_FORM | SHORT_FORM

  @Column('simple-array', { nullable: true })
  scopes: string[]; // ['EXCESS_STOCK', 'SPARE_CAPACITY']

  // Sector Configuration
  @Column({ nullable: true })
  sectorId: string;

  @Column({ nullable: true })
  groupId: string;

  @Column({ nullable: true })
  businessTypeId: string;

  @Column({ nullable: true })
  assignee: string;

  @Column({ nullable: true })
  dueDate: Date;

  // Dynamic Answers Store
  @Column({ type: 'jsonb', default: {} })
  answers: Record<string, any>;

  // AI & Follow-up Data
  @Column({ type: 'jsonb', nullable: true })
  followUpQuestions: any[];

  @Column({ type: 'jsonb', nullable: true })
  aiInsight: any;

  // Final Calculated Results
  @Column({ type: 'jsonb', nullable: true })
  calculatedMetrics: {
    capacityDrainPct: number;
    totalStockImpact: number;
    annualRecovery: number;
    impactScore: number;
  };

  // Pre-Audit -> Audit handoff. One audit session per pre-audit session, so a
  // repeat handoff never creates a duplicate audit.
  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true, unique: true })
  preAuditSessionId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
