import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditForm, AuditFormType } from './entities/audit-form.entity';
import { AuditFormQuestion } from './entities/audit-form-question.entity';
import { AuditFormAnswer } from './entities/audit-form-answer.entity';
import {
  AuditFormDto,
  AuditFormQuestionDto,
  CreateAuditFormAnswerDto,
  CreateAuditFormDto,
  CreateAuditFormQuestionDto,
  UpdateAuditFormAnswerDto,
  UpdateAuditFormDto,
  UpdateAuditFormQuestionDto,
} from './dto/audit-form.dto';

@Injectable()
export class AuditFormService implements OnModuleInit {
  constructor(
    @InjectRepository(AuditForm)
    private readonly formRepository: Repository<AuditForm>,
    @InjectRepository(AuditFormQuestion)
    private readonly questionRepository: Repository<AuditFormQuestion>,
    @InjectRepository(AuditFormAnswer)
    private readonly answerRepository: Repository<AuditFormAnswer>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaults();
  }

  private makeSlug(title: string): string {
    const base =
      (title || 'audit')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'audit';
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${base}-${suffix}`;
  }

  /**
   * Ensures at least one default Short Audit and one default Long Audit exist.
   */
  private async ensureDefaults() {
    // 1. Default Short Audit
    let defaultShort = await this.formRepository.findOne({
      where: { auditType: 'SHORT_FORM', isDefault: true },
    });
    if (!defaultShort) {
      const anyShort = await this.formRepository.findOne({ where: { auditType: 'SHORT_FORM' } });
      if (anyShort) {
        anyShort.isDefault = true;
        await this.formRepository.save(anyShort);
      } else {
        const created = this.formRepository.create({
          title: 'Standard Short Audit',
          description: 'Fast, high-level business capacity & stock health audit.',
          auditType: 'SHORT_FORM',
          slug: 'default-short-audit',
          isDefault: true,
          status: 'published',
          publishedAt: new Date(),
          settings: {},
        });
        const saved = await this.formRepository.save(created);

        // Seed some initial questions for short audit
        const q1 = await this.questionRepository.save(
          this.questionRepository.create({
            formId: saved.id,
            text: 'What is your current estimated daily operating capacity utilization?',
            type: 'single_choice',
            category: 'SPARE_CAPACITY',
            order: 1,
            required: true,
          }),
        );
        await this.answerRepository.save([
          this.answerRepository.create({ questionId: q1.id, text: 'Under 50% (High idle capacity)', scoreImpact: 3, sortOrder: 1 }),
          this.answerRepository.create({ questionId: q1.id, text: '50% - 75% (Moderate capacity)', scoreImpact: 2, sortOrder: 2 }),
          this.answerRepository.create({ questionId: q1.id, text: 'Over 75% (Near full capacity)', scoreImpact: 1, sortOrder: 3 }),
        ]);

        const q2 = await this.questionRepository.save(
          this.questionRepository.create({
            formId: saved.id,
            text: 'Do you hold slow-moving or excess inventory?',
            type: 'single_choice',
            category: 'EXCESS_STOCK',
            order: 2,
            required: true,
          }),
        );
        await this.answerRepository.save([
          this.answerRepository.create({ questionId: q2.id, text: 'Yes, significant excess stock', scoreImpact: 3, sortOrder: 1 }),
          this.answerRepository.create({ questionId: q2.id, text: 'Some seasonal or periodic stock', scoreImpact: 2, sortOrder: 2 }),
          this.answerRepository.create({ questionId: q2.id, text: 'No, inventory moves rapidly', scoreImpact: 1, sortOrder: 3 }),
        ]);
      }
    }

    // 2. Default Long Audit
    let defaultLong = await this.formRepository.findOne({
      where: { auditType: 'LONG_FORM', isDefault: true },
    });
    if (!defaultLong) {
      const anyLong = await this.formRepository.findOne({ where: { auditType: 'LONG_FORM' } });
      if (anyLong) {
        anyLong.isDefault = true;
        await this.formRepository.save(anyLong);
      } else {
        const created = this.formRepository.create({
          title: 'Comprehensive Forensic Audit',
          description: 'In-depth diagnostic examining capacity, excess stock, operational leakages, and recovery roadmap.',
          auditType: 'LONG_FORM',
          slug: 'default-long-audit',
          isDefault: true,
          status: 'published',
          publishedAt: new Date(),
          settings: {},
        });
        const saved = await this.formRepository.save(created);

        // Seed initial questions for long audit
        const q1 = await this.questionRepository.save(
          this.questionRepository.create({
            formId: saved.id,
            text: 'How much total potential weekly revenue do you lose to unbooked hours or idle tables/slots?',
            type: 'single_choice',
            category: 'SPARE_CAPACITY',
            order: 1,
            required: true,
          }),
        );
        await this.answerRepository.save([
          this.answerRepository.create({ questionId: q1.id, text: 'Over £5,000 / week', scoreImpact: 4, sortOrder: 1 }),
          this.answerRepository.create({ questionId: q1.id, text: '£2,000 - £5,000 / week', scoreImpact: 3, sortOrder: 2 }),
          this.answerRepository.create({ questionId: q1.id, text: '£500 - £2,000 / week', scoreImpact: 2, sortOrder: 3 }),
          this.answerRepository.create({ questionId: q1.id, text: 'Less than £500 / week', scoreImpact: 1, sortOrder: 4 }),
        ]);

        const q2 = await this.questionRepository.save(
          this.questionRepository.create({
            formId: saved.id,
            text: 'What is the estimated wholesale value of unsold stock currently tied up in storage?',
            type: 'single_choice',
            category: 'EXCESS_STOCK',
            order: 2,
            required: true,
          }),
        );
        await this.answerRepository.save([
          this.answerRepository.create({ questionId: q2.id, text: 'Over £50,000', scoreImpact: 4, sortOrder: 1 }),
          this.answerRepository.create({ questionId: q2.id, text: '£15,000 - £50,000', scoreImpact: 3, sortOrder: 2 }),
          this.answerRepository.create({ questionId: q2.id, text: '£5,000 - £15,000', scoreImpact: 2, sortOrder: 3 }),
          this.answerRepository.create({ questionId: q2.id, text: 'Under £5,000', scoreImpact: 1, sortOrder: 4 }),
        ]);
      }
    }
  }

  async listForms(type?: AuditFormType): Promise<AuditFormDto[]> {
    await this.ensureDefaults();
    const qb = this.formRepository.createQueryBuilder('f');
    if (type) {
      qb.where('f.auditType = :type', { type });
    }
    qb.orderBy('f.isDefault', 'DESC').addOrderBy('f.createdAt', 'ASC');
    const forms = await qb.getMany();

    const dtos: AuditFormDto[] = [];
    for (const form of forms) {
      const count = await this.questionRepository.count({ where: { formId: form.id } });
      dtos.push({
        id: form.id,
        title: form.title,
        description: form.description,
        auditType: form.auditType,
        slug: form.slug,
        isDefault: Boolean(form.isDefault),
        status: form.status,
        sectorId: form.sectorId ?? null,
        sectorName: form.sectorName ?? null,
        categoryId: form.categoryId ?? null,
        categoryName: form.categoryName ?? null,
        subcategoryId: form.subcategoryId ?? null,
        subcategoryName: form.subcategoryName ?? null,
        questionCount: count,
        settings: form.settings ?? {},
        publishedAt: form.publishedAt ? form.publishedAt.toISOString() : null,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
      });
    }
    return dtos;
  }

  async getForm(id: string): Promise<AuditFormDto> {
    const form = await this.formRepository.findOne({ where: { id } });
    if (!form) throw new NotFoundException(`Audit form with ID "${id}" not found.`);

    const questions = await this.questionRepository.find({
      where: { formId: form.id },
      order: { order: 'ASC', createdAt: 'ASC' },
    });

    const answers = await this.answerRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    const answersByQ = new Map<string, any[]>();
    for (const a of answers) {
      const bucket = answersByQ.get(a.questionId) ?? [];
      bucket.push({
        id: a.id,
        questionId: a.questionId,
        text: a.text,
        scoreImpact: a.scoreImpact,
        sortOrder: a.sortOrder,
        isActive: a.isActive,
        createdAt: a.createdAt,
      });
      answersByQ.set(a.questionId, bucket);
    }

    const questionDtos: AuditFormQuestionDto[] = questions.map((q) => ({
      id: q.id,
      formId: q.formId,
      text: q.text,
      type: q.type,
      description: q.description,
      hint: q.hint,
      required: q.required,
      category: q.category,
      config: q.config ?? {},
      order: q.order,
      isActive: q.isActive,
      answers: answersByQ.get(q.id) ?? [],
      createdAt: q.createdAt,
    }));

    return {
      id: form.id,
      title: form.title,
      description: form.description,
      auditType: form.auditType,
      slug: form.slug,
      isDefault: Boolean(form.isDefault),
      status: form.status,
      sectorId: form.sectorId ?? null,
      sectorName: form.sectorName ?? null,
      categoryId: form.categoryId ?? null,
      categoryName: form.categoryName ?? null,
      subcategoryId: form.subcategoryId ?? null,
      subcategoryName: form.subcategoryName ?? null,
      questionCount: questions.length,
      questions: questionDtos,
      settings: form.settings ?? {},
      publishedAt: form.publishedAt ? form.publishedAt.toISOString() : null,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    };
  }

  async createForm(dto: CreateAuditFormDto): Promise<AuditFormDto> {
    const title = dto.title.trim();
    let slug = this.makeSlug(title);
    const existing = await this.formRepository.findOne({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    if (dto.isDefault) {
      await this.formRepository.update({ auditType: dto.auditType }, { isDefault: false });
    }

    const created = this.formRepository.create({
      title,
      description: dto.description?.trim() ? dto.description.trim() : null,
      auditType: dto.auditType,
      slug,
      isDefault: Boolean(dto.isDefault),
      status: 'published',
      publishedAt: new Date(),
      sectorId: dto.sectorId ?? null,
      sectorName: dto.sectorName ?? null,
      categoryId: dto.categoryId ?? null,
      categoryName: dto.categoryName ?? null,
      subcategoryId: dto.subcategoryId ?? null,
      subcategoryName: dto.subcategoryName ?? null,
      settings: dto.settings ?? {},
    });

    const saved = await this.formRepository.save(created);
    return this.getForm(saved.id);
  }

  async updateForm(id: string, dto: UpdateAuditFormDto): Promise<AuditFormDto> {
    const form = await this.formRepository.findOne({ where: { id } });
    if (!form) throw new NotFoundException(`Audit form with ID "${id}" not found.`);

    if (dto.title !== undefined) form.title = dto.title.trim();
    if (dto.description !== undefined) form.description = dto.description?.trim() ? dto.description.trim() : null;
    if (dto.status !== undefined) form.status = dto.status;
    if (dto.settings !== undefined) form.settings = dto.settings;
    if (dto.sectorId !== undefined) form.sectorId = dto.sectorId;
    if (dto.sectorName !== undefined) form.sectorName = dto.sectorName;
    if (dto.categoryId !== undefined) form.categoryId = dto.categoryId;
    if (dto.categoryName !== undefined) form.categoryName = dto.categoryName;
    if (dto.subcategoryId !== undefined) form.subcategoryId = dto.subcategoryId;
    if (dto.subcategoryName !== undefined) form.subcategoryName = dto.subcategoryName;

    if (dto.isDefault !== undefined) {
      if (dto.isDefault) {
        await this.formRepository.update({ auditType: form.auditType }, { isDefault: false });
        form.isDefault = true;
      } else if (form.isDefault) {
        const count = await this.formRepository.count({
          where: { auditType: form.auditType, isDefault: true },
        });
        if (count <= 1) {
          form.isDefault = true; // One must always be default
        } else {
          form.isDefault = false;
        }
      }
    }

    await this.formRepository.save(form);
    return this.getForm(form.id);
  }

  async setDefault(id: string): Promise<AuditFormDto> {
    const form = await this.formRepository.findOne({ where: { id } });
    if (!form) throw new NotFoundException(`Audit form with ID "${id}" not found.`);

    await this.formRepository.update({ auditType: form.auditType }, { isDefault: false });
    form.isDefault = true;
    await this.formRepository.save(form);
    return this.getForm(form.id);
  }

  async deleteForm(id: string): Promise<{ message: string }> {
    const form = await this.formRepository.findOne({ where: { id } });
    if (!form) throw new NotFoundException(`Audit form with ID "${id}" not found.`);
    if (form.isDefault) {
      throw new BadRequestException(
        `Cannot delete the default ${form.auditType === 'SHORT_FORM' ? 'Short' : 'Long'} Audit form. Please set another form as default first.`,
      );
    }
    const count = await this.formRepository.count({ where: { auditType: form.auditType } });
    if (count <= 1) {
      throw new BadRequestException('Cannot delete the only audit form for this audit type.');
    }

    // Remove questions and answers
    const questions = await this.questionRepository.find({ where: { formId: form.id } });
    for (const q of questions) {
      await this.answerRepository.delete({ questionId: q.id });
    }
    await this.questionRepository.delete({ formId: form.id });
    await this.formRepository.remove(form);

    return { message: 'Audit form deleted successfully.' };
  }

  // --- Questions & Answers ---

  async createQuestion(formId: string, dto: CreateAuditFormQuestionDto): Promise<AuditFormQuestionDto> {
    const form = await this.formRepository.findOne({ where: { id: formId } });
    if (!form) throw new NotFoundException('Audit form not found.');

    const created = this.questionRepository.create({
      formId,
      text: dto.text.trim(),
      type: dto.type ?? 'single_choice',
      description: dto.description?.trim() ? dto.description.trim() : null,
      hint: dto.hint?.trim() ? dto.hint.trim() : null,
      required: dto.required ?? true,
      category: dto.category ?? null,
      config: dto.config ?? {},
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.questionRepository.save(created);
    return {
      ...saved,
      answers: [],
      createdAt: saved.createdAt,
    };
  }

  async updateQuestion(id: string, dto: UpdateAuditFormQuestionDto): Promise<AuditFormQuestion> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Question not found.');

    if (dto.text !== undefined) question.text = dto.text.trim();
    if (dto.type !== undefined) question.type = dto.type;
    if (dto.description !== undefined) question.description = dto.description?.trim() ? dto.description.trim() : null;
    if (dto.hint !== undefined) question.hint = dto.hint?.trim() ? dto.hint.trim() : null;
    if (dto.required !== undefined) question.required = dto.required;
    if (dto.category !== undefined) question.category = dto.category;
    if (dto.config !== undefined) question.config = dto.config;
    if (dto.order !== undefined) question.order = dto.order;
    if (dto.isActive !== undefined) question.isActive = dto.isActive;

    return this.questionRepository.save(question);
  }

  async deleteQuestion(id: string): Promise<{ message: string }> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Question not found.');

    await this.answerRepository.delete({ questionId: id });
    await this.questionRepository.remove(question);
    return { message: 'Question deleted successfully.' };
  }

  async createAnswer(questionId: string, dto: CreateAuditFormAnswerDto): Promise<AuditFormAnswer> {
    const question = await this.questionRepository.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found.');

    const created = this.answerRepository.create({
      questionId,
      text: dto.text.trim(),
      scoreImpact: dto.scoreImpact ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
    return this.answerRepository.save(created);
  }

  async updateAnswer(id: string, dto: UpdateAuditFormAnswerDto): Promise<AuditFormAnswer> {
    const answer = await this.answerRepository.findOne({ where: { id } });
    if (!answer) throw new NotFoundException('Answer option not found.');

    if (dto.text !== undefined) answer.text = dto.text.trim();
    if (dto.scoreImpact !== undefined) answer.scoreImpact = dto.scoreImpact;
    if (dto.sortOrder !== undefined) answer.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) answer.isActive = dto.isActive;

    return this.answerRepository.save(answer);
  }

  async deleteAnswer(id: string): Promise<{ message: string }> {
    const answer = await this.answerRepository.findOne({ where: { id } });
    if (!answer) throw new NotFoundException('Answer option not found.');

    await this.answerRepository.remove(answer);
    return { message: 'Answer option deleted successfully.' };
  }

  // --- Public ---

  async getPublicForm(slugOrId?: string, type?: AuditFormType): Promise<AuditFormDto> {
    await this.ensureDefaults();
    let form: AuditForm | null = null;
    if (!slugOrId || slugOrId === 'default') {
      const targetType = type || 'SHORT_FORM';
      form = await this.formRepository.findOne({
        where: { auditType: targetType, isDefault: true },
      });
      if (!form) {
        form = await this.formRepository.findOne({
          where: { auditType: targetType, status: 'published' },
        });
      }
    } else {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      form = await this.formRepository.findOne({
        where: isUuid ? [{ id: slugOrId }, { slug: slugOrId }] : { slug: slugOrId },
      });
    }

    if (!form) throw new NotFoundException('Audit template not found or not published.');
    return this.getForm(form.id);
  }
}
