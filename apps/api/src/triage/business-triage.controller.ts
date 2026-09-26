import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { BusinessTriageService } from './business-triage.service';
import { TriageFormService } from './triage-form.service';
import { TriageQuestionItemDto } from './dto/triage-question.dto';
import { PublicTriageFormDto } from './dto/triage-form.dto';

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

// Public endpoint for the shareable responder URL: /audit/triage/{slug}.
@ApiTags('Business Triage')
@Controller('triage/form')
export class PublicTriageFormController {
  constructor(private readonly triageFormService: TriageFormService) {}

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a published Business Triage form by its public slug', description: 'Returns the form title/description, the responder settings and the first question. Only published forms are served.' })
  @ApiResponse({ status: 200, type: PublicTriageFormDto })
  @ApiResponse({ status: 404, description: 'Published form not found.' })
  getForm(@Param('slug') slug: string) {
    return this.triageFormService.getPublicForm(slug);
  }
}