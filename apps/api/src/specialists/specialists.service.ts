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
    if (specialists.length === 0) {
        return [];
    }
    return specialists;
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
