import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { DashboardResponseDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly auditService: AuditService,
    private readonly usersService: UsersService,
  ) {}

  async getDashboardData(userId: string): Promise<DashboardResponseDto> {
    const [user, audits] = await Promise.all([
      this.usersService.findById(userId),
      this.auditService.findAllByUser(userId)
    ]);

    // Calculate aggregated stats
    let totalRecovery = 0;
    let totalDrain = 0;
    const completedAudits = audits.filter(a => a.calculatedMetrics);

    completedAudits.forEach(audit => {
      totalRecovery += audit.calculatedMetrics?.annualRecovery || 0;
      totalDrain += audit.calculatedMetrics?.capacityDrainPct || 0;
    });

    const avgEfficiencyGain = completedAudits.length > 0 
      ? parseFloat((totalDrain / completedAudits.length).toFixed(1)) 
      : 0;

    // AI Advisor Dynamic Suggestion (Logic based on highest leak)
    let aiSuggestion = "Initialize a new forensic audit to receive personalized strategic recommendations.";
    if (completedAudits.length > 0) {
      const lastAudit = completedAudits[0];
      if (lastAudit.calculatedMetrics.capacityDrainPct > 20) {
        aiSuggestion = `Based on your recent ${lastAudit.sectorId} audit, you are leaking significant capacity. I recommend the Inventory Rotation Engine.`;
      } else {
        aiSuggestion = "Your operations are stabilizing. I recommend a Seasonal Benchmarking refresh.";
      }
    }

    // Calculate next audit date (e.g., 3 months from now)
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 3);

    return {
      userName: user?.firstName || 'Analyst',
      tokenBalance: user?.tokens || 0,
      aiAdvisorSuggestion: aiSuggestion,
      stats: {
        totalAudits: audits.length,
        activeRecovery: totalRecovery,
        efficiencyGain: avgEfficiencyGain,
        nextAuditDate: nextDate.toISOString().split('T')[0],
      },
      recentAudits: audits.map(audit => ({
        id: audit.id,
        date: audit.createdAt.toISOString(),
        type: audit.auditType,
        sector: audit.sectorId || 'Unspecified',
        metrics: {
          capacityDrain: audit.calculatedMetrics?.capacityDrainPct || 0,
          annualRecovery: audit.calculatedMetrics?.annualRecovery || 0,
          impactScore: audit.calculatedMetrics?.impactScore || 0,
        },
        status: audit.status === 'COMPLETED' ? 'completed' : 'draft',
      })),
    };
  }
}
