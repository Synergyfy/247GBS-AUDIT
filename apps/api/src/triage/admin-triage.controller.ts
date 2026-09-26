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
import { PreAuditService } from './pre-audit.service';
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
    private readonly preAuditService: PreAuditService,
    private readonly adminService: AdminService,
  ) {}

  private async verifyAdmin(req: Request): Promise<void> {
    // TODO(dev): TEMPORARY DEV-ONLY bypass. Skip admin authorization while
    // NODE_ENV === 'development' so the admin triage area can be used on
    // localhost without signing in. Admin auth MUST be restored before
    // production (remove this block).
    if (process.env.NODE_ENV === 'development') return;

    const user = (req as any).user;
    if (!user || !user.sub) throw new ForbiddenException();
    await this.adminService.verifyAdmin(user.sub);
  }

  // --- Questions ---

  @Get('questions')
  @ApiOperation({ summary: 'List all Business Triage questions', description: 'Returns every question with its answer options and flow-safety flags.' })
  @ApiResponse({ status: 200, type: [AdminTriageQuestionDto] })
  async listQuestions(@Req() req: Request) {
    await this.verifyAdmin(req);
    return this.businessTriageService.listQuestions();
  }

  @Post('questions')
  @ApiOperation({ summary: 'Create a Business Triage question' })
  async createQuestion(@Req() req: Request, @Body() dto: CreateTriageQuestionDto) {
    await this.verifyAdmin(req);
    return this.businessTriageService.createQuestion(dto);
  }

  @Patch('questions/:id')
  @ApiOperation({ summary: 'Update a Business Triage question' })
  async updateQuestion(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateTriageQuestionDto) {
    await this.verifyAdmin(req);
    return this.businessTriageService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  @ApiOperation({ summary: 'Deactivate a Business Triage question', description: 'Soft-deletes the question. Fails if another answer points to it.' })
  @ApiResponse({ status: 200, type: DeleteMessageDto })
  async removeQuestion(@Req() req: Request, @Param('id') id: string) {
    await this.verifyAdmin(req);
    return this.businessTriageService.removeQuestion(id);
  }

  // --- Answers ---

  @Post('questions/:id/answers')
  @ApiOperation({ summary: 'Add an answer option to a question', description: 'The answer must point to a next question OR an audit type — not both.' })
  async createAnswer(@Req() req: Request, @Param('id') id: string, @Body() dto: CreateTriageAnswerDto) {
    await this.verifyAdmin(req);
    return this.businessTriageService.createAnswer(id, dto);
  }

  @Patch('answers/:id')
  @ApiOperation({ summary: 'Update an answer option', description: 'Update the answer text, status, or its destination.' })
  async updateAnswer(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateTriageAnswerDto) {
    await this.verifyAdmin(req);
    return this.businessTriageService.updateAnswer(id, dto);
  }

  @Delete('answers/:id')
  @ApiOperation({ summary: 'Deactivate an answer option' })
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
    return this.preAuditService.listResponses();
  }

  @Get('responses/:id')
  @ApiOperation({ summary: 'Get a single Business Triage submission', description: 'Immutable record of the questions shown, the answers given and the routing that concluded.' })
  @ApiResponse({ status: 200, type: TriageResponseDetailDto })
  async getResponse(@Req() req: Request, @Param('id') id: string) {
    await this.verifyAdmin(req);
    return this.preAuditService.getResponse(id);
  }
}