import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { TriageService } from './triage.service';
import { CreateTriageDto } from './dto/create-triage.dto';
import type { Request } from 'express';

@ApiTags('Triage')
@Controller('triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Submit Triage Data', description: 'Runs the Henry Model decision engine and returns the audit recommendation.' })
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
    // In a real app, we'd use a decorator to get the user, but for now we'll assume the guard attached it
    const user = (req as any).user;
    // We need to pass the user ID mainly, or fetch the full user if needed. 
    // The service expects a User entity or at least an object with an ID.
    // Let's pass the user object structure that TypeORM expects (just the ID is enough for the relation)
    return this.triageService.create(createTriageDto, { id: user.sub } as any);
  }
}
