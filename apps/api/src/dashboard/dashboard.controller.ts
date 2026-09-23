import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard.dto';
import type { Request } from 'express';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get Dashboard Data', description: 'Returns aggregated stats and recent audit history for the user.' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard data retrieved successfully.',
    type: DashboardResponseDto
  })
  async getDashboard(@Req() req: Request) {
    const user = (req as any).user;
    return this.dashboardService.getDashboardData(user.sub);
  }
}
