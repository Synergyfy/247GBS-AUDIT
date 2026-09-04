import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditTriage, TriageDecision, AuditType } from './entities/triage.entity';
import { CreateTriageDto } from './dto/create-triage.dto';
import { User } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TriageService {
  constructor(
    @InjectRepository(AuditTriage)
    private triageRepository: Repository<AuditTriage>,
    private auditService: AuditService,
  ) { }

  async create(createTriageDto: CreateTriageDto, user: User) {
    // 1. Calculate Decision Logic (The Henry Model)
    const { decision, auditType } = this.calculateDecision(createTriageDto);

    // 2. Save Triage Result
    const triage = this.triageRepository.create({
      ...createTriageDto,
      userId: user.id,
      decision,
      recommendedAuditType: auditType,
    });
    await this.triageRepository.save(triage);

    // 3. Determine Scopes based on Inputs
    const scopes: string[] = [];
    if (createTriageDto.hasExcessStock === 'yes' || (createTriageDto.stockExtent || 0) > 0) {
      scopes.push('EXCESS_STOCK');
    }
    if (createTriageDto.hasSpareCapacity === 'yes' || (createTriageDto.capacityExtent || 0) > 0) {
      scopes.push('SPARE_CAPACITY');
    }

    // 4. Create Audit Session automatically if an audit is recommended
    let auditSessionId: string | null = null;
    if (auditType !== AuditType.NONE) {
      const session = await this.auditService.createFromTriage(user, auditType, scopes);
      auditSessionId = session.id;
    }

    return {
      triageId: triage.id,
      decision,
      auditType,
      auditSessionId,
    };
  }

  private calculateDecision(data: CreateTriageDto): { decision: TriageDecision; auditType: AuditType } {
    const stock = data.stockExtent || 0;
    const capacity = data.capacityExtent || 0;
    const impactSerious = data.stockImpact === 'serious' || data.capacityImpact === 'serious';
    const highCosts = data.monthlyTurnover === '50k+' || data.stockValue === '50k+'; // Simple check for "high costs"

    // Rule 1: CRITICAL PATH
    // Triggered if: >= 31% OR (>= 16% + serious impact + high costs)
    if (stock >= 31 || capacity >= 31) {
      if (impactSerious) {
        return { decision: TriageDecision.CRITICAL, auditType: AuditType.LONG_FORM };
      }
      return { decision: TriageDecision.FULL_AUDIT, auditType: AuditType.LONG_FORM };
    }

    if ((stock >= 16 || capacity >= 16) && impactSerious && highCosts) {
      return { decision: TriageDecision.CRITICAL, auditType: AuditType.LONG_FORM };
    }

    // Rule 2: FULL AUDIT PATH
    // Triggered if: Any area >= 16% OR impact = "serious"
    if (stock >= 16 || capacity >= 16 || impactSerious) {
      return { decision: TriageDecision.FULL_AUDIT, auditType: AuditType.LONG_FORM };
    }

    // Rule 3: PARTIAL AUDIT PATH
    // Triggered if: Any area >= 7%
    if (stock >= 7 || capacity >= 7) {
      return { decision: TriageDecision.PARTIAL_AUDIT, auditType: AuditType.SHORT_FORM };
    }

    // Rule 4: NO AUDIT PATH
    // Triggered if: Stock < 7% AND Capacity < 7%
    return { decision: TriageDecision.NO_AUDIT, auditType: AuditType.NONE };
  }

}
