import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { BusinessTriageService } from './business-triage.service';
import { TriageQuestionItemDto } from './dto/triage-question.dto';

// Public endpoints used by the Business Triage flow (accessible to visitors /
// new signups without authentication).
@ApiTags('Business Triage')
@Controller('triage/questions')
export class BusinessTriageController {
  constructor(private readonly businessTriageService: BusinessTriageService) {}

  @Public()
  @Get('start')
  @ApiOperation({ summary: 'Get first Business Triage question', description: 'Returns the first active triage question with its answer options. No authentication required.' })
  @ApiResponse({ status: 200, type: TriageQuestionItemDto })
  @ApiResponse({ status: 404, description: 'No active triage questions are configured.' })
  getStart() {
    return this.businessTriageService.getStartQuestion();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a Business Triage question', description: 'Returns a single active triage question with its answer options. No authentication required.' })
  @ApiResponse({ status: 200, type: TriageQuestionItemDto })
  @ApiResponse({ status: 404, description: 'Triage question not found.' })
  getOne(@Param('id') id: string) {
    return this.businessTriageService.getQuestion(id);
  }
}