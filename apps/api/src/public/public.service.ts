import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../admin/entities/platform-setting.entity';
import { HelpResource } from '../admin/entities/help-resource.entity';

export interface PublicSettings {
  platformName: string;
  supportEmail: string | null;
  landingTitle: string | null;
  landingSubtitle: string | null;
  landingCtaLabel: string | null;
  landingCtaHref: string | null;
  landingShowPreAudit: boolean;
}

/**
 * Non-sensitive read access to admin-configured content for the public pages.
 * Never exposes internal flags — only what the landing/support screens render.
 */
@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingsRepository: Repository<PlatformSetting>,
    @InjectRepository(HelpResource)
    private readonly helpRepository: Repository<HelpResource>,
  ) {}

  async getSettings(): Promise<PublicSettings> {
    const row = await this.settingsRepository.findOne({ where: { id: 'app' } });
    return {
      platformName: row?.platformName || '247GBS Audit',
      supportEmail: row?.supportEmail ?? null,
      landingTitle: row?.landingTitle ?? null,
      landingSubtitle: row?.landingSubtitle ?? null,
      landingCtaLabel: row?.landingCtaLabel ?? 'Start your business audit',
      landingCtaHref: row?.landingCtaHref ?? '/audit/pre-audit/flow',
      landingShowPreAudit: row?.landingShowPreAudit ?? true,
    };
  }

  async getHelpResources(category?: string): Promise<HelpResource[]> {
    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    return this.helpRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }
}