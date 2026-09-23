import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExternalPlan } from './entities/external-plan.entity';
import { CreateExternalPlanDto, UpdateExternalPlanDto, ExternalPlanResponseDto } from './dto/external-plan.dto';

@Injectable()
export class ExternalPlanService {
  constructor(
    @InjectRepository(ExternalPlan)
    private readonly planRepository: Repository<ExternalPlan>,
  ) {}

  async findAll(): Promise<ExternalPlanResponseDto[]> {
    const plans = await this.planRepository.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
    return plans.map(this.mapToResponse);
  }

  async findOne(id: string): Promise<ExternalPlanResponseDto> {
    const plan = await this.planRepository.findOne({ where: { id, isActive: true } });
    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }
    return this.mapToResponse(plan);
  }

  async create(dto: CreateExternalPlanDto): Promise<ExternalPlanResponseDto> {
    const planId = dto.planId || dto.name.toLowerCase().replace(/\s+/g, '-');
    
    const existing = await this.planRepository.findOne({ where: { id: planId } });
    if (existing) {
      throw new ConflictException(`Plan with id ${planId} already exists`);
    }

    const plan = this.planRepository.create({
      id: planId,
      name: dto.name,
      monthlyPrice: dto.monthlyPrice,
      annualPrice: dto.annualPrice,
      features: dto.features,
      quotas: dto.quotas || { maxProducts: 50, customFeatures: true },
      isActive: true,
    });

    const saved = await this.planRepository.save(plan);
    return this.mapToResponse(saved);
  }

  async update(id: string, dto: UpdateExternalPlanDto): Promise<ExternalPlanResponseDto> {
    const plan = await this.planRepository.findOne({ where: { id, isActive: true } });
    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }

    Object.assign(plan, {
      name: dto.name ?? plan.name,
      monthlyPrice: dto.monthlyPrice ?? plan.monthlyPrice,
      annualPrice: dto.annualPrice ?? plan.annualPrice,
      features: dto.features ?? plan.features,
      quotas: dto.quotas ?? plan.quotas,
    });

    const saved = await this.planRepository.save(plan);
    return this.mapToResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const plan = await this.planRepository.findOne({ where: { id, isActive: true } });
    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }

    plan.isActive = false;
    await this.planRepository.save(plan);
  }

  private mapToResponse(plan: ExternalPlan): ExternalPlanResponseDto {
    return {
      id: plan.id,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      features: plan.features,
      quotas: plan.quotas,
      isActive: plan.isActive,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }
}