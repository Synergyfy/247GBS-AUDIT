import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from '../audit/audit.service';
import { AIService } from '../ai/ai.service';
import { AuditSession } from '../audit/entities/audit-session.entity';
import { IntelligenceResponseDto } from './dto/intelligence.dto';

@Injectable()
export class IntelligenceService {
  constructor(
    private readonly auditService: AuditService,
    private readonly aiService: AIService,
    @InjectRepository(AuditSession)
    private auditRepository: Repository<AuditSession>,
  ) {}

  async getIntelligenceData(userId: string): Promise<IntelligenceResponseDto> {
    const audits = await this.auditService.findAllByUser(userId);
    const completedAudits = audits.filter((a) => a.calculatedMetrics);

    // 1. Get AI Strategic Insight based on history
    const historyData = completedAudits.map(a => ({
        date: a.createdAt,
        sector: a.sectorId,
        recovery: a.calculatedMetrics.annualRecovery,
        drain: a.calculatedMetrics.capacityDrainPct
    }));
    const strategicInsight = await this.aiService.generateAggregatedInsight(historyData);

    // 2. Calculate Real Trajectory (last 12 months)
    const trajectoryPoints = new Array(12).fill(0);
    const now = new Date();
    completedAudits.forEach(audit => {
        const monthsAgo = (now.getFullYear() - audit.createdAt.getFullYear()) * 12 + (now.getMonth() - audit.createdAt.getMonth());
        if (monthsAgo >= 0 && monthsAgo < 12) {
            // Map to index (0 is 11 months ago, 11 is this month)
            trajectoryPoints[11 - monthsAgo] += audit.calculatedMetrics.annualRecovery;
        }
    });

    // 3. Aggregate Efficiency Breakdown
    // We average the specific leak points across all audits
    let staffLeak = 0, stockLeak = 0, spaceLeak = 0;
    completedAudits.forEach(a => {
        staffLeak += a.calculatedMetrics.capacityDrainPct;
        stockLeak += Math.min((a.calculatedMetrics.totalStockImpact / 5000) * 100, 100);
        spaceLeak += (a.calculatedMetrics.capacityDrainPct * 0.4); // Proxy for space
    });
    
    const count = completedAudits.length || 1;

    // 4. Benchmarking (Market Rank)
    // Compare this user's avg recovery against all other users
    const userAvg = completedAudits.reduce((acc, a) => acc + a.calculatedMetrics.annualRecovery, 0) / count;
    const globalAvgRow = await this.auditRepository
      .createQueryBuilder('audit')
      .select('AVG((audit.calculatedMetrics->>\'annualRecovery\')::numeric)', 'avg')
      .where('audit.calculatedMetrics IS NOT NULL')
      .getRawOne();
    const globalAvg = parseFloat(globalAvgRow?.avg || '0');
    const marketRank = globalAvg > 0
      ? Math.max(1, Math.min(100, Math.round((userAvg / globalAvg) * 50)))
      : 50;

    return {
      strategicInsight,
      keyMetrics: [
        { label: "Audit Accuracy", value: "High", color: "green" },
        { label: "Data Points", value: audits.length.toString(), color: "blue" },
        { label: "Risk Level", value: userAvg > 50000 ? "Critical" : "Standard", color: "orange" },
        { label: "Rank", value: `Top ${marketRank}%`, color: "orange" },
      ],
      trajectory: {
        dataPoints: trajectoryPoints
      },
      efficiencyBreakdown: [
        { label: "Idle Staff Capacity", value: Math.round(staffLeak / count), color: "bg-orange-500" },
        { label: "Stock Inefficiency", value: Math.round(stockLeak / count), color: "bg-slate-900" },
        { label: "Operational Gaps", value: Math.round(spaceLeak / count), color: "bg-slate-200" },
      ],
      maxRecoveryTarget: Math.round(userAvg * count * 1.2),
      marketRank,
    };
  }
}
