import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TriageForm } from './entities/triage-form.entity';
import { BusinessTriageService } from './business-triage.service';
import {
  PublicTriageFormDto,
  PublishTriageFormResultDto,
  TRIAGE_FORM_SETTINGS_KEYS,
  TriageFormDto,
  TriageFormSettingsDto,
  UpdateTriageFormDto,
} from './dto/triage-form.dto';

const DEFAULT_TRIAGE_FORM_SETTINGS: Record<string, any> = {
  acceptResponses: true,
  collectEmail: true,
  requireEmail: false,
  allowEditing: true,
  showProgressBar: true,
  showConfirmation: true,
  confirmationMessage: '',
};

/** The subset of settings the public responder is allowed to see. */
const RESPONDER_SETTINGS_KEYS: string[] = [
  'acceptResponses',
  'collectEmail',
  'requireEmail',
  'allowEditing',
  'showProgressBar',
  'showConfirmation',
  'confirmationMessage',
];

function booleanOr(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

@Injectable()
export class TriageFormService {
  constructor(
    @InjectRepository(TriageForm)
    private readonly formRepository: Repository<TriageForm>,
    private readonly businessTriageService: BusinessTriageService,
  ) {}

  /** Returns the single form row, creating it (with defaults) on first access. */
  private async getOrCreate(): Promise<TriageForm> {
    const existing = await this.formRepository.findOne({
      order: { createdAt: 'ASC' },
    });
    if (existing) return existing;

    const created = this.formRepository.create({
      title: 'Business Triage',
      description: null,
      slug: null,
      status: 'draft',
      settings: {},
      publishedAt: null,
    });
    return this.formRepository.save(created);
  }

  private normalizeSettings(input: TriageFormSettingsDto): Record<string, any> {
    const settings: Record<string, any> = { ...DEFAULT_TRIAGE_FORM_SETTINGS };
    for (const key of TRIAGE_FORM_SETTINGS_KEYS) {
      const value = (input as any)[key];
      if (value === undefined) continue;
      if (key === 'confirmationMessage') {
        settings[key] = typeof value === 'string' ? value.slice(0, 2000) : '';
      } else {
        settings[key] = booleanOr(value, DEFAULT_TRIAGE_FORM_SETTINGS[key]);
      }
    }
    return settings;
  }

  private resolveResponderSettings(settings: Record<string, any>): Record<string, any> {
    const merged = { ...DEFAULT_TRIAGE_FORM_SETTINGS, ...(settings ?? {}) };
    const out: Record<string, any> = {};
    for (const key of RESPONDER_SETTINGS_KEYS) {
      out[key] = merged[key];
    }
    return out;
  }

  private toFormDto(form: TriageForm): TriageFormDto {
    return {
      id: form.id,
      title: form.title,
      description: form.description,
      slug: form.slug,
      status: form.status,
      settings: { ...DEFAULT_TRIAGE_FORM_SETTINGS, ...(form.settings ?? {}) },
      publishedAt: form.publishedAt ? form.publishedAt.toISOString() : null,
    };
  }

  private toPublishResult(form: TriageForm): PublishTriageFormResultDto {
    return {
      id: form.id,
      status: form.status,
      slug: form.slug,
      publicUrl: this.publicUrlOf(form.slug),
      publishedAt: form.publishedAt ? form.publishedAt.toISOString() : null,
    };
  }

  private publicUrlOf(slug: string | null): string | null {
    if (!slug) return null;
    return `/audit/triage/${slug}`;
  }

  private makeSlug(title: string): string {
    const base =
      (title || 'business-triage')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'business-triage';
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${base}-${suffix}`;
  }

  // ============================================================
  // Admin
  // ============================================================

  async getForm(): Promise<TriageFormDto> {
    return this.toFormDto(await this.getOrCreate());
  }

  async updateForm(dto: UpdateTriageFormDto): Promise<TriageFormDto> {
    const form = await this.getOrCreate();
    if (dto.title !== undefined) {
      form.title = dto.title.trim() || 'Business Triage';
    }
    if (dto.description !== undefined) {
      form.description = dto.description?.trim() ? dto.description.trim() : null;
    }
    if (dto.settings !== undefined) {
      form.settings = this.normalizeSettings(dto.settings);
    }
    return this.toFormDto(await this.formRepository.save(form));
  }

  /**
   * Validates the whole active flow, then flips the form live and assigns a
   * stable public slug (when one does not exist yet).
   */
  async publish(): Promise<PublishTriageFormResultDto> {
    const validation = await this.businessTriageService.validateFlowForPublish();
    if (!validation.ok) {
      throw new BadRequestException({
        message:
          'This form cannot be published yet. Fix the issues below first (' +
          `${validation.issues.length} problem${validation.issues.length === 1 ? '' : 's'}).`,
        issues: validation.issues,
        warnings: validation.warnings,
      });
    }

    const form = await this.getOrCreate();
    if (!form.slug) {
      form.slug = this.makeSlug(form.title);
      const clash = await this.formRepository.findOne({ where: { slug: form.slug } });
      if (clash && clash.id !== form.id) {
        form.slug = `${form.slug}-${Math.random().toString(36).slice(2, 6)}`;
      }
    }
    form.status = 'published';
    form.publishedAt = new Date();
    return this.toPublishResult(await this.formRepository.save(form));
  }

  async unpublish(): Promise<PublishTriageFormResultDto> {
    const form = await this.getOrCreate();
    form.status = 'draft';
    return this.toPublishResult(await this.formRepository.save(form));
  }

  // ============================================================
  // Public responder
  // ============================================================

  async getPublicForm(slug: string): Promise<PublicTriageFormDto> {
    const form = await this.formRepository.findOne({ where: { slug } });
    if (!form || form.status !== 'published') {
      throw new NotFoundException('This Business Triage form is not available.');
    }
    if (form.settings?.acceptResponses === false) {
      return {
        title: form.title,
        description: form.description,
        status: form.status,
        settings: this.resolveResponderSettings(form.settings),
        startQuestion: null,
      };
    }
    const startQuestion = await this.businessTriageService.getStartQuestion();
    return {
      title: form.title,
      description: form.description,
      status: form.status,
      settings: this.resolveResponderSettings(form.settings),
      startQuestion,
    };
  }
}