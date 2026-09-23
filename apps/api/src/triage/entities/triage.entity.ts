import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TriageDecision {
  CRITICAL = 'CRITICAL',
  FULL_AUDIT = 'FULL_AUDIT',
  PARTIAL_AUDIT = 'PARTIAL_AUDIT',
  NO_AUDIT = 'NO_AUDIT',
}

export enum AuditType {
  LONG_FORM = 'LONG_FORM',
  SHORT_FORM = 'SHORT_FORM',
  NONE = 'NONE',
}

@Entity('audit_triage')
export class AuditTriage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column({ nullable: true })
  hasExcessStock: string;

  @Column({ type: 'int', default: 0 })
  stockExtent: number;

  @Column({ nullable: true })
  stockImpact: string;

  @Column({ nullable: true })
  hasSpareCapacity: string;

  @Column({ type: 'int', default: 0 })
  capacityExtent: number;

  @Column({ nullable: true })
  capacityImpact: string;

  @Column({ nullable: true })
  confidenceStock: string;

  @Column({ nullable: true })
  confidenceCapacity: string;

  @Column({ nullable: true })
  staffCost: string;

  @Column({ nullable: true })
  monthlyTurnover: string;

  @Column({ nullable: true })
  stockValue: string;

  @Column({ nullable: true })
  isReady: string;

  @Column({ type: 'enum', enum: TriageDecision, default: TriageDecision.NO_AUDIT })
  decision: TriageDecision;

  @Column({ type: 'enum', enum: AuditType, default: AuditType.NONE })
  recommendedAuditType: AuditType;

  @CreateDateColumn()
  createdAt: Date;
}
