import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { SpecialistsService } from './specialists.service';
import { SpecialistDto, SpecialistStatsDto } from './dto/specialist.dto';

@ApiTags('Specialists')
@Controller('specialists')
export class SpecialistsController {
  constructor(private readonly specialistsService: SpecialistsService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get Specialist Network', description: 'Returns a list of verified specialists.' })
  @ApiResponse({ type: [SpecialistDto] })
  async getSpecialists() {
    return this.specialistsService.findAll();
  }

  @Get('stats')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get Specialist Network Stats', description: 'Returns aggregated networking metrics.' })
  @ApiResponse({ type: SpecialistStatsDto })
  async getStats() {
    return this.specialistsService.getStats();
  }
}
