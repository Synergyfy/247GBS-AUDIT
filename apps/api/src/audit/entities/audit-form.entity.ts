import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type AuditFormType = 'SHORT_FORM' | 'LONG_FORM';

@Entity('audit_forms')
export class AuditForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, default: 'Standard Audit' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50, default: 'SHORT_FORM' })
  @Index()
  auditType: AuditFormType;

  @Column({ type: 'varchar', length: 120, nullable: true, unique: true })
  @Index()
  slug: string | null;

  @Column({ type: 'boolean', default: false })
  @Index()
  isDefault: boolean;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  @Index()
  sectorId: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  sectorName: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  @Index()
  categoryId: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  categoryName: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  @Index()
  subcategoryId: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  subcategoryName: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  settings: Record<string, any>;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
