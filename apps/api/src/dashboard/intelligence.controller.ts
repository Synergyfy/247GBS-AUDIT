import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { IntelligenceService } from './intelligence.service';
import { IntelligenceResponseDto } from './dto/intelligence.dto';
import type { Request } from 'express';

@ApiTags('Dashboard')
@Controller('dashboard/intelligence')
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get Forensic Intelligence', description: 'Returns AI-driven cross-audit analysis and growth forecasting.' })
  @ApiResponse({ 
    status: 200, 
    description: 'Intelligence data retrieved successfully.',
    type: IntelligenceResponseDto
  })
  async getIntelligence(@Req() req: Request) {
    const user = (req as any).user;
    return this.intelligenceService.getIntelligenceData(user.sub);
  }
}
