import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { PreAuditService } from './pre-audit.service';
import { TriageOtpService } from './triage-otp.service';
import { SubmitPreAuditDto, PreAuditSubmissionResultDto } from './dto/pre-audit.dto';

@ApiTags('Pre-Audit')
@Controller('pre-audit')
@UseGuards(ThrottlerGuard)
export class PreAuditController {
  constructor(
    private readonly preAuditService: PreAuditService,
    private readonly otpService: TriageOtpService,
  ) {}

  @Public()
  @Get('status')
  @ApiOperation({
    summary: 'Check pre-audit completion status for a given email',
    description: 'Returns whether the specified user email has completed a pre-audit session.',
  })
  async getStatus(@Query('email') email?: string) {
    return this.preAuditService.getUserStatus(email);
  }

  @Public()
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send verification OTP to user email',
    description: 'Generates and delivers a 6-digit OTP code to the supplied email via Resend.',
  })
  async sendOtp(@Body() body: { email: string }): Promise<{ success: boolean; message: string }> {
    return this.otpService.sendOtp(body.email);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email OTP',
    description: 'Validates the 6-digit verification code entered by the user.',
  })
  async verifyOtp(@Body() body: { email: string; code: string }): Promise<{ verified: boolean; message: string }> {
    return this.otpService.verifyOtp(body.email, body.code);
  }

  @Public()
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Public pre-audit submission',
    description:
      'Accepts the answers a visitor gave, re-evaluates them server-side against the configured question flow and returns the recommended audit type. Client-provided routing is never trusted. Authenticated callers omit email (derived from their session); guests must supply an OTP-verified email.',
  })
  async submit(
    @Body() dto: SubmitPreAuditDto,
    @Req() req: any,
  ): Promise<PreAuditSubmissionResultDto> {
    const authEmail: string | null =
      typeof req?.user?.email === 'string' ? req.user.email : null;
    return this.preAuditService.evaluateAndSave(dto, authEmail);
  }
}