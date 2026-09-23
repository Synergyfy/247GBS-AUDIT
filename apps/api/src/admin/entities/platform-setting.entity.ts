import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

/**
 * Singleton platform configuration row. Admins edit landing/help content that
 * the public pages + confirmation screens render. There is exactly one row
 * (id = 'app'), upserted on read when missing.
 */
@Entity('platform_settings')
export class PlatformSetting {
  @PrimaryColumn({ type: 'varchar', length: 20, default: 'app' })
  id: string;

  @Column({ type: 'varchar', length: 120, default: '247GBS Audit' })
  platformName: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  supportEmail: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  landingTitle: string | null;

  @Column({ type: 'text', nullable: true })
  landingSubtitle: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  landingCtaLabel: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  landingCtaHref: string | null;

  @Column({ type: 'boolean', default: true })
  landingShowPreAudit: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}