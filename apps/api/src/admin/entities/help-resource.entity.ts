import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * Admin-curated help/service/funding resources surfaced on the public support
 * pages and as post-pre-audit destinations.
 */
@Entity('help_resources')
export class HelpResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // 'support' | 'service' | 'funding' | 'guide'
  @Index()
  @Column({ type: 'varchar', length: 60, default: 'support' })
  category: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  href: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}