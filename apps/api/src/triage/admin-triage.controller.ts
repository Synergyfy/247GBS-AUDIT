import {
  Controller,
  Get,
  Req,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AdminService } from '../admin/admin.service';
import { BusinessTriageService } from './business-triage.service';
import {
  CreateTriageQuestionDto,
  UpdateTriageQuestionDto,
  CreateTriageAnswerDto,
  UpdateTriageAnswerDto,
  AdminTriageQuestionDto,
  DeleteMessageDto,
} from './dto/triage-question.dto';
import type { Request } from 'express';

@ApiTags('Admin Business Triage')
@Controller('admin/triage')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('access-token')
export class AdminTriageController {
  constructor(
    private readonly businessTriageService: BusinessTriageService,
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
}