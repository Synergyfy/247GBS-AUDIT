import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TriageForm } from './entities/triage-form.entity';
import { TriageQuestion } from './entities/triage-question.entity';
import { TriageFlowValidatorService } from './triage-flow-validator.service';
import { TriageQuestionService } from './triage-question.service';
import {
  PublicTriageFormDto,
  PublishTriageFormResultDto,
  TRIAGE_FORM_SETTINGS_KEYS,
  TriageFormDto,
  TriageFormSettingsDto,
  UpdateTriageFormDto,
} from './dto/triage-form.dto';

export const DEFAULT_TRIAGE_FORM_ID = '00000000-0000-0000-0000-000000000001';

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
export class TriageFormService implements OnModuleInit {
  private activeFormId: string = DEFAULT_TRIAGE_FORM_ID;

  constructor(
    @InjectRepository(TriageForm)
    private readonly formRepository: Repository<TriageForm>,
    @InjectRepository(TriageQuestion)
    private readonly questionRepository: Repository<TriageQuestion>,
    private readonly validatorService: TriageFlowValidatorService,
    private readonly questionService: TriageQuestionService,
  ) {}

  async onModuleInit() {
    await this.ensureInitialized();
  }

  /**
   * Deterministically ensures at least one default form row exists on startup,
   * migrating existing legacy rows if present without generating duplicates.
   */
  private async ensureInitialized(): Promise<TriageForm> {
    const defaultForm = await this.formRepository.findOne({ where: { isDefault: true } });
    if (defaultForm) {
      this.activeFormId = defaultForm.id;
      return defaultForm;
    }

    const existingById = await this.formRepository.findOne({ where: { id: this.activeFormId } });
    if (existingById) {
      existingById.isDefault = true;
      await this.formRepository.save(existingById);
      return existingById;
    }

    const [legacy] = await this.formRepository.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });
    if (legacy) {
      legacy.isDefault = true;
      await this.formRepository.save(legacy);
      this.activeFormId = legacy.id;
      return legacy;
    }

    const created = this.formRepository.create({
      id: DEFAULT_TRIAGE_FORM_ID,
      title: 'Business Triage',
      description: 'Default pre-audit business triage flow.',
      slug: 'default-business-triage',
      isDefault: true,
      status: 'draft',
      settings: DEFAULT_TRIAGE_FORM_SETTINGS,
      publishedAt: null,
    });
    const saved = await this.formRepository.save(created);
    this.activeFormId = saved.id;
    return saved;
  }

  private async getDefaultForm(): Promise<TriageForm> {
    let form = await this.formRepository.findOne({ where: { isDefault: true } });
    if (!form) {
      form = await this.ensureInitialized();
    }
    return form;
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

  private toFormDto(form: TriageForm, questionCount?: number): TriageFormDto {
    return {
      id: form.id,
      title: form.title,
      description: form.description,
      slug: form.slug,
      isDefault: Boolean(form.isDefault),
      questionCount: questionCount ?? 0,
      status: form.status,
      settings: { ...DEFAULT_TRIAGE_FORM_SETTINGS, ...(form.settings ?? {}) },
      publishedAt: form.publishedAt ? form.publishedAt.toISOString() : null,
      createdAt: form.createdAt ? form.createdAt.toISOString() : null,
      updatedAt: form.updatedAt ? form.updatedAt.toISOString() : null,
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
  // Admin: Multi-Form management
  // ============================================================

  async listForms(): Promise<TriageFormDto[]> {
    await this.ensureInitialized();
    const forms = await this.formRepository.find({
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });

    const defaultForm = forms.find((f) => f.isDefault);

    // Compute question count per form
    const results: TriageFormDto[] = [];
    for (const form of forms) {
      const qb = this.questionRepository.createQueryBuilder('q').where('q.formId = :formId', { formId: form.id });
      if (defaultForm && form.id === defaultForm.id) {
        qb.orWhere('q.formId IS NULL');
      }
      const count = await qb.getCount();
      results.push(this.toFormDto(form, count));
    }
    return results;
  }

  async getForm(id?: string): Promise<TriageFormDto> {
    if (!id) {
      const defaultForm = await this.getDefaultForm();
      const count = await this.questionRepository.count();
      return this.toFormDto(defaultForm, count);
    }
    const form = await this.formRepository.findOne({ where: { id } });
    if (!form) throw new NotFoundException(`Triage form with ID "${id}" not found.`);
    const count = await this.questionRepository.count({ where: { formId: id } });
    return this.toFormDto(form, count);
  }

  async createForm(dto: {
    title: string;
    description?: string | null;
    isDefault?: boolean;
    settings?: TriageFormSettingsDto;
  }): Promise<TriageFormDto> {
    const title = dto.title?.trim() || 'New Pre-Audit Triage';
    let slug = this.makeSlug(title);
    const existingSlug = await this.formRepository.findOne({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const isDefault = Boolean(dto.isDefault);
    if (isDefault) {
      await this.formRepository.update({ isDefault: true }, { isDefault: false });
    }

    const created = this.formRepository.create({
      title,
      description: dto.description?.trim() ? dto.description.trim() : null,
      slug,
      isDefault,
      status: 'draft',
      settings: dto.settings ? this.normalizeSettings(dto.settings) : DEFAULT_TRIAGE_FORM_SETTINGS,
      publishedAt: null,
    });

    const saved = await this.formRepository.save(created);
    return this.toFormDto(saved, 0);
  }

  async updateForm(id: string, dto: UpdateTriageFormDto): Promise<TriageFormDto> {
    const form = await this.formRepository.findOne({ where: { id } });
    if (!form) throw new NotFoundException(`Triage form with ID "${id}" not found.`);

    if (dto.title !== undefined) {
      form.title = dto.title.trim() || 'Business Triage';
    }
    if (dto.description !== undefined) {
      form.description = dto.description?.trim() ? dto.description.trim() : null;
    }
    if (dto.settings !== undefined) {
      form.settings = this.normalizeSettings(dto.settings);
    }
    if (dto.isDefault !== undefined) {
      if (dto.isDefault) {
        await this.formRepository.update({ isDefault: true }, { isDefault: false });
        form.isDefault = true;
      } else if (form.isDefault) {
        // Form was default, verify there is another default
        const count = await this.formRepository.count({ where: { isDefault: true } });
        if (count <= 1) {
          // Keep as default since at least one must be default
          form.isDefault = true;
        } else {
          form.isDefault = false;
        }
      }
    }

    const saved = await this.formRepository.save(form);
    const count = await this.questionRepository.count({ where: { formId: form.id } });
    return this.toFormDto(saved, count);
  }

  async setDefault(id: string): Promise<TriageFormDto> {
    const form = await this.formRepository.findOne({ where: { id } });
    if (!form) throw new NotFoundException(`Triage form with ID "${id}" not found.`);

    await this.formRepository.update({ isDefault: true }, { isDefault: false });
    form.isDefault = true;
    const saved = await this.formRepository.save(form);
    const count = await this.questionRepository.count({ where: { formId: form.id } });
    return this.toFormDto(saved, count);
  }

  async deleteForm(id: string): Promise<{ message: string }> {
    const form = await this.formRepository.findOne({ where: { id } });
    if (!form) throw new NotFoundException(`Triage form with ID "${id}" not found.`);
    if (form.isDefault) {
      throw new BadRequestException('Cannot delete the default triage form. Please set another triage form as default first.');
    }
    const totalCount = await this.formRepository.count();
    if (totalCount <= 1) {
      throw new BadRequestException('Cannot delete the only triage form in the system.');
    }

    await this.formRepository.remove(form);
    return { message: 'Triage form deleted successfully.' };
  }

  /**
   * Validates the flow for the target form, then flips the form live and assigns a
   * stable public slug (when one does not exist yet).
   */
  async publish(id?: string): Promise<PublishTriageFormResultDto> {
    const form = id
      ? await this.formRepository.findOne({ where: { id } })
      : await this.getDefaultForm();

    if (!form) throw new NotFoundException('Triage form not found.');

    const validation = await this.validatorService.validateFlowForPublish(form.id);
    if (!validation.ok) {
      throw new BadRequestException({
        message:
          'This form cannot be published yet. Fix the issues below first (' +
          `${validation.issues.length} problem${validation.issues.length === 1 ? '' : 's'}).`,
        issues: validation.issues,
        warnings: validation.warnings,
      });
    }

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

  async unpublish(id?: string): Promise<PublishTriageFormResultDto> {
    const form = id
      ? await this.formRepository.findOne({ where: { id } })
      : await this.getDefaultForm();

    if (!form) throw new NotFoundException('Triage form not found.');

    form.status = 'draft';
    return this.toPublishResult(await this.formRepository.save(form));
  }

  // ============================================================
  // Public responder
  // ============================================================

  async getPublicForm(slugOrId?: string): Promise<PublicTriageFormDto> {
    let form: TriageForm | null = null;
    if (!slugOrId || slugOrId === 'default') {
      form = await this.formRepository.findOne({ where: { isDefault: true } });
      if (!form) {
        form = await this.formRepository.findOne({ where: { status: 'published' } });
      }
    } else {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      form = await this.formRepository.findOne({
        where: isUuid ? [{ id: slugOrId }, { slug: slugOrId }] : { slug: slugOrId },
      });
    }

    if (!form) {
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

    let startQuestion: any = null;
    try {
      startQuestion = await this.questionService.getStartQuestion(form.id);
    } catch {
      startQuestion = null;
    }

    return {
      title: form.title,
      description: form.description,
      status: form.status,
      settings: this.resolveResponderSettings(form.settings),
      startQuestion,
    };
  }
}