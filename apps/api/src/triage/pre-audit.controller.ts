import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { PreAuditService } from './pre-audit.service';
import { SubmitPreAuditDto, PreAuditSubmissionResultDto } from './dto/pre-audit.dto';

@ApiTags('Pre-Audit')
@Controller('pre-audit')
@UseGuards(ThrottlerGuard)
export class PreAuditController {
  constructor(private readonly preAuditService: PreAuditService) {}

  @Public()
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Public pre-audit submission',
    description:
      'Accepts the answers a visitor gave, re-evaluates them server-side against the configured question flow and returns the recommended audit type. Client-provided routing is never trusted.',
  })
  async submit(@Body() dto: SubmitPreAuditDto): Promise<PreAuditSubmissionResultDto> {
    return this.preAuditService.evaluateAndSave(dto);
  }
}