import { Controller, Get, Param, UseGuards, Req, NotFoundException, Patch, Put, Body, Post, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AuditService } from './audit.service';
import { AuditVaultStatsDto } from './dto/audit-stats.dto';
import type { Request } from 'express';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('stats')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get Vault Statistics', description: 'Returns aggregated stats for the audit vault.' })
  @ApiResponse({ 
    status: 200, 
    description: 'Vault stats retrieved successfully.',
    type: AuditVaultStatsDto
  })
  async getVaultStats(@Req() req: Request) {
    const user = (req as any).user;
    return this.auditService.getVaultStats(user.sub);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get User Audit History', description: 'Retrieves all audit sessions belonging to the authenticated user.' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of audit sessions.',
    schema: {
      example: [
        {
          id: 'uuid-5678',
          status: 'COMPLETED',
          auditType: 'LONG_FORM',
          sectorId: 'hospitality-food',
          createdAt: '2026-02-03T10:00:00Z',
          calculatedMetrics: { capacityDrainPct: 25, annualRecovery: 12000 }
        }
      ]
    }
  })
  async findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.auditService.findAllByUser(user.sub);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get Audit Session', description: 'Retrieves the current state of an audit session.' })
  @ApiResponse({ 
    status: 200, 
    description: 'Audit session details.',
    schema: {
      example: {
        id: 'uuid-5678',
        status: 'IN_PROGRESS',
        auditType: 'LONG_FORM',
        calculatedMetrics: { capacityDrainPct: 25, totalStockImpact: 15000, annualRecovery: 12000, impactScore: 65 }
      }
    }
  })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    const session = await this.auditService.findOne(id, user.sub);
    if (!session) throw new NotFoundException('Audit session not found');
    return session;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete Audit', description: 'Removes an audit from the vault.' })
  @ApiResponse({ status: 200, description: 'Audit deleted successfully.' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.auditService.remove(id, user.sub);
  }

  @Patch(':id/sector')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Select Sector', description: 'Sets the business sector for the audit. Supported sectorId: hospitality-food, retail-wholesale, professional-services, manufacturing.' })
  @ApiBody({ 
    schema: { 
      example: { 
        sectorId: 'retail-wholesale', 
        groupId: 'inventory', 
        businessTypeId: 'warehouse' 
      } 
    } 
  })
  @ApiResponse({ status: 200, description: 'Sector updated.', schema: { example: { id: 'uuid-5678', status: 'SECTOR_SELECTED', sectorId: 'retail-wholesale' } } })
  async updateSector(
    @Param('id') id: string,
    @Body() body: { sectorId: string; groupId: string; businessTypeId: string },
    @Req() req: Request
  ) {
    const user = (req as any).user;
    return this.auditService.updateSector(id, user.sub, body.sectorId, body.groupId, body.businessTypeId);
  }

  @Put(':id/answers')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ 
    summary: 'Submit Answers', 
    description: 'Updates audit answers and triggers real-time recalculation. Payload keys depend on the selected sector (see Appendix in ENDPOINTS.md).' 
  })
  @ApiBody({ 
    schema: { 
      example: { 
        "retail-inventory-shrink-deep-01": 1500, 
        "retail-logistics-delay-trigger-01": 12,
        "stock_value_excess": 25000 
      } 
    } 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Answers saved and metrics recalculated.',
    schema: {
      example: {
        calculatedMetrics: { capacityDrainPct: 15, totalStockImpact: 8500, annualRecovery: 24000, impactScore: 40 }
      }
    }
  })
  async updateAnswers(
    @Param('id') id: string,
    @Body() answers: Record<string, any>,
    @Req() req: Request
  ) {
    const user = (req as any).user;
    return this.auditService.updateAnswers(id, user.sub, answers);
  }

  @Post(':id/ai/generate-questions')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Generate AI Follow-up Questions', description: 'Uses Gemini to generate custom forensic follow-up questions.' })
  @ApiResponse({ status: 201, description: 'Follow-up questions generated.', schema: { example: { followUpQuestions: [{ id: 'q1', text: 'Why?' }] } } })
  async generateFollowUp(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.auditService.generateFollowUp(id, user.sub);
  }

  @Post(':id/ai/generate-insight')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Generate AI Strategic Insight', description: 'Uses Gemini to generate a personalized strategic pivot and summary.' })
  @ApiResponse({ status: 201, description: 'Insight generated.', schema: { example: { aiInsight: { summary: 'Fix waste', actionablePivot: 'Sell bundles' } } } })
  async generateInsight(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.auditService.generateInsight(id, user.sub);
  }
}
