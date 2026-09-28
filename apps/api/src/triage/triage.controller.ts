import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { TriageService } from './triage.service';
import { CreateTriageDto } from './dto/create-triage.dto';
import type { Request } from 'express';

@ApiTags('Triage')
@Controller('triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit Triage Data', description: 'Runs the Henry Model decision engine and returns the audit recommendation. Publicly accessible for visitors.' })
  @ApiResponse({ 
    status: 201, 
    description: 'Triage analysis complete.',
    schema: {
      example: {
        triageId: 'uuid-1234',
        decision: 'CRITICAL',
        auditType: 'LONG_FORM',
        auditSessionId: 'uuid-5678'
      }
    }
  })
  create(@Body() createTriageDto: CreateTriageDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.triageService.create(createTriageDto, user?.sub ? ({ id: user.sub } as any) : undefined);
  }
}
