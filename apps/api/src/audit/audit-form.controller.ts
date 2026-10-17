import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { Public } from '../auth/decorators/public.decorator';
import { AdminService } from '../admin/admin.service';
import { AuditFormService } from './audit-form.service';
import {
  AuditFormDto,
  AuditFormType,
  CreateAuditFormAnswerDto,
  CreateAuditFormDto,
  CreateAuditFormQuestionDto,
  UpdateAuditFormAnswerDto,
  UpdateAuditFormDto,
  UpdateAuditFormQuestionDto,
} from './dto/audit-form.dto';
import type { Request } from 'express';

@ApiTags('Admin Audit Forms')
@Controller('admin/audits/forms')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('access-token')
export class AdminAuditFormsController {
  constructor(
    private readonly auditFormService: AuditFormService,
    private readonly adminService: AdminService,
  ) {}

  private async verifyAdmin(req: Request): Promise<void> {
    const user = (req as any).user;
    if (!user || !user.sub) {
      throw new ForbiddenException('Access denied. Administrator authentication required.');
    }
    await this.adminService.verifyAdmin(user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List all audit forms (short and long)', description: 'Optionally filter by type=SHORT_FORM|LONG_FORM' })
  @ApiResponse({ status: 200, type: [AuditFormDto] })
  async listForms(@Req() req: Request, @Query('type') type?: string) {
    await this.verifyAdmin(req);
    return this.auditFormService.listForms(type as any);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new Short or Long Audit form' })
  @ApiResponse({ status: 201, type: AuditFormDto })
  async createForm(@Req() req: Request, @Body() dto: CreateAuditFormDto) {
    await this.verifyAdmin(req);
    return this.auditFormService.createForm(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an audit form with all its questions and options' })
  @ApiResponse({ status: 200, type: AuditFormDto })
  async getForm(@Req() req: Request, @Param('id') id: string) {
    await this.verifyAdmin(req);
    return this.auditFormService.getForm(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update audit form metadata or default status' })
  @ApiResponse({ status: 200, type: AuditFormDto })
  async updateForm(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateAuditFormDto,
  ) {
    await this.verifyAdmin(req);
    return this.auditFormService.updateForm(id, dto);
  }

  @Post(':id/default')
  @ApiOperation({ summary: 'Set this audit form as the default for its type (Short/Long)' })
  @ApiResponse({ status: 200, type: AuditFormDto })
  async setDefault(@Req() req: Request, @Param('id') id: string) {
    await this.verifyAdmin(req);
    return this.auditFormService.setDefault(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an audit form' })
  async deleteForm(@Req() req: Request, @Param('id') id: string) {
    await this.verifyAdmin(req);
    return this.auditFormService.deleteForm(id);
  }

  // --- Question management inside audit form ---

  @Post(':id/questions')
  @ApiOperation({ summary: 'Add a question to this audit form' })
  async createQuestion(
    @Req() req: Request,
    @Param('id') formId: string,
    @Body() dto: CreateAuditFormQuestionDto,
  ) {
    await this.verifyAdmin(req);
    return this.auditFormService.createQuestion(formId, dto);
  }

  @Patch('questions/:qid')
  @ApiOperation({ summary: 'Update an audit question' })
  async updateQuestion(
    @Req() req: Request,
    @Param('qid') qid: string,
    @Body() dto: UpdateAuditFormQuestionDto,
  ) {
    await this.verifyAdmin(req);
    return this.auditFormService.updateQuestion(qid, dto);
  }

  @Delete('questions/:qid')
  @ApiOperation({ summary: 'Delete an audit question' })
  async deleteQuestion(@Req() req: Request, @Param('qid') qid: string) {
    await this.verifyAdmin(req);
    return this.auditFormService.deleteQuestion(qid);
  }

  // --- Answer options management ---

  @Post('questions/:qid/answers')
  @ApiOperation({ summary: 'Add an answer option to an audit question' })
  async createAnswer(
    @Req() req: Request,
    @Param('qid') qid: string,
    @Body() dto: CreateAuditFormAnswerDto,
  ) {
    await this.verifyAdmin(req);
    return this.auditFormService.createAnswer(qid, dto);
  }

  @Patch('answers/:aid')
  @ApiOperation({ summary: 'Update an audit answer option' })
  async updateAnswer(
    @Req() req: Request,
    @Param('aid') aid: string,
    @Body() dto: UpdateAuditFormAnswerDto,
  ) {
    await this.verifyAdmin(req);
    return this.auditFormService.updateAnswer(aid, dto);
  }

  @Delete('answers/:aid')
  @ApiOperation({ summary: 'Delete an audit answer option' })
  async deleteAnswer(@Req() req: Request, @Param('aid') aid: string) {
    await this.verifyAdmin(req);
    return this.auditFormService.deleteAnswer(aid);
  }
}

@ApiTags('Public Audit Forms')
@Controller('audit/public/form')
export class PublicAuditFormsController {
  constructor(private readonly auditFormService: AuditFormService) {}

  @Public()
  @Get('default')
  @ApiOperation({ summary: 'Get default published Short or Long audit' })
  getDefault(@Query('type') type?: string) {
    return this.auditFormService.getPublicForm('default', type as any);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get published audit by slug or ID' })
  getOne(@Param('slug') slug: string) {
    return this.auditFormService.getPublicForm(slug);
  }
}
