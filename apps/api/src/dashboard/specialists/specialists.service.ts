import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialist } from './entities/specialist.entity';
import { SpecialistDto, SpecialistStatsDto } from './dto/specialist.dto';

@Injectable()
export class SpecialistsService {
  constructor(
    @InjectRepository(Specialist)
    private readonly specialistRepository: Repository<Specialist>,
  ) {}

  async findAll(): Promise<Specialist[]> {
    const specialists = await this.specialistRepository.find();
    return specialists;
  }

  async create(createDto: Partial<Specialist>): Promise<Specialist> {
    const specialist = this.specialistRepository.create(createDto);
    return this.specialistRepository.save(specialist);
  }

  async getStats(): Promise<SpecialistStatsDto> {
    const totalCount = await this.specialistRepository.count();
    const availableCount = await this.specialistRepository.count({ where: { status: 'Available' } });
    
    return {
      verifiedExperts: `${totalCount}+`,
      successfulDeployments: `${availableCount}`,
      globalReach: `${totalCount} Regions`,
      avgResponseTime: `${Math.max(1, Math.round(totalCount / 5))} mins`,
    };
  }
}
