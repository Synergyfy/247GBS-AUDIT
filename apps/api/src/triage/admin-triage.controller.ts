import {
  Controller,
  Get,
  Req,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AdminService } from '../admin/admin.service';
import { BusinessTriageService } from './business-triage.service';
import { TriageFormService } from './triage-form.service';
import { TriageReportService } from './triage-report.service';
import {
  CreateTriageQuestionDto,
  UpdateTriageQuestionDto,
  CreateTriageAnswerDto,
  UpdateTriageAnswerDto,
  AdminTriageQuestionDto,
  DeleteMessageDto,
} from './dto/triage-question.dto';
import {
  PublishTriageFormResultDto,
  TriageFormDto,
  TriageResponseDetailDto,
  TriageResponsesOverviewDto,
  UpdateTriageFormDto,
} from './dto/triage-form.dto';
import type { Request } from 'express';

@ApiTags('Admin Business Triage')
@Controller('admin/triage')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('access-token')
export class AdminTriageController {
  constructor(
    private readonly businessTriageService: BusinessTriageService,
    private readonly triageFormService: TriageFormService,
    private readonly triageReportService: TriageReportService,
    private readonly adminService: AdminService,
  ) {}

  private async verifyAdmin(req: Request): Promise<void> {
    const user = (req as any).user;
    if (!user || !user.sub) {
      throw new ForbiddenException('Access denied. Administrator authentication required.');
    }
    await this.adminService.verifyAdmin(user.sub);
  }

  // --- Questions ---

  @Get('questions')
  @ApiOperation({ summary: 'List all questions with their answers', description: 'Returns all questions (active and inactive) in display order, including answer counts and target routing.' })
  @ApiResponse({ status: 200, type: [AdminTriageQuestionDto] })
  async listQuestions(@Req() req: Request) {
    await this.verifyAdmin(req);
    return this.businessTriageService.listQuestions();
  }

  @Post('questions')
  @ApiOperation({ summary: 'Create a new triage question', description: 'Creates a question. Default destinations are validated against existing questions.' })
  @ApiResponse({ status: 201, type: AdminTriageQuestionDto })
  async createQuestion(@Req() req: Request, @Body() dto: CreateTriageQuestionDto) {
    await this.verifyAdmin(req);
    return this.businessTriageService.createQuestion(dto);
  }

  @Patch('questions/:id')
  @ApiOperation({ summary: 'Update a triage question', description: 'Updates question text, type, order or routing destinations.' })
  @ApiResponse({ status: 200, type: AdminTriageQuestionDto })
  async updateQuestion(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateTriageQuestionDto,
  ) {
    await this.verifyAdmin(req);
    return this.businessTriageService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  @ApiOperation({ summary: 'Delete a triage question', description: 'Deletes question and its answers. Fails if other questions/answers route to it.' })
  @ApiResponse({ status: 200, type: DeleteMessageDto })
  async removeQuestion(@Req() req: Request, @Param('id') id: string) {
    await this.verifyAdmin(req);
    return this.businessTriageService.removeQuestion(id);
  }

  // --- Answers ---

  @Post('questions/:questionId/answers')
  @ApiOperation({ summary: 'Add an answer option to a question', description: 'Must specify either nextQuestionId or destinationType/auditType.' })
  async createAnswer(
    @Req() req: Request,
    @Param('questionId') questionId: string,
    @Body() dto: CreateTriageAnswerDto,
  ) {
    await this.verifyAdmin(req);
    return this.businessTriageService.createAnswer(questionId, dto);
  }

  @Patch('answers/:id')
  @ApiOperation({ summary: 'Update an answer option', description: 'Updates text, value, scoreImpact or destination.' })
  async updateAnswer(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateTriageAnswerDto,
  ) {
    await this.verifyAdmin(req);
    return this.businessTriageService.updateAnswer(id, dto);
  }

  @Delete('answers/:id')
  @ApiOperation({ summary: 'Delete an answer option' })
  @ApiResponse({ status: 200, type: DeleteMessageDto })
  async removeAnswer(@Req() req: Request, @Param('id') id: string) {
    await this.verifyAdmin(req);
    return this.businessTriageService.removeAnswer(id);
  }

  // --- Form / publish state ---

  @Get('form')
  @ApiOperation({ summary: 'Get the Business Triage form definition', description: 'Title, description, publish state, public slug and responder settings.' })
  @ApiResponse({ status: 200, type: TriageFormDto })
  async getForm(@Req() req: Request) {
    await this.verifyAdmin(req);
    return this.triageFormService.getForm();
  }

  @Patch('form')
  @ApiOperation({ summary: 'Update the Business Triage form definition', description: 'Update title/description/settings. Publish state is managed via publish/unpublish.' })
  @ApiResponse({ status: 200, type: TriageFormDto })
  async updateForm(@Req() req: Request, @Body() dto: UpdateTriageFormDto) {
    await this.verifyAdmin(req);
    return this.triageFormService.updateForm(dto);
  }

  @Post('publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate and publish the Business Triage', description: 'Runs the full flow-health check; fails with the validation issues when the flow cannot reach an audit.' })
  @ApiResponse({ status: 200, type: PublishTriageFormResultDto })
  async publish(@Req() req: Request) {
    await this.verifyAdmin(req);
    return this.triageFormService.publish();
  }

  @Post('unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish the Business Triage', description: 'Takes the form offline. The public slug is retained for a future re-publish.' })
  @ApiResponse({ status: 200, type: PublishTriageFormResultDto })
  async unpublish(@Req() req: Request) {
    await this.verifyAdmin(req);
    return this.triageFormService.unpublish();
  }

  // --- Responses ---

  @Get('responses')
  @ApiOperation({ summary: 'List stored Business Triage submissions', description: 'Summary stats plus the most recent submissions. Submissions are re-evaluated server-side before storage.' })
  @ApiResponse({ status: 200, type: TriageResponsesOverviewDto })
  async listResponses(@Req() req: Request) {
    await this.verifyAdmin(req);
    return this.triageReportService.listResponses();
  }

  @Get('responses/:id')
  @ApiOperation({ summary: 'Get a single Business Triage submission', description: 'Immutable record of the questions shown, the answers given and the routing that concluded.' })
  @ApiResponse({ status: 200, type: TriageResponseDetailDto })
  async getResponse(@Req() req: Request, @Param('id') id: string) {
    await this.verifyAdmin(req);
    return this.triageReportService.getResponse(id);
  }
}