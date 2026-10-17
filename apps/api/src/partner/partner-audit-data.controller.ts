import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { PeerAuthGuard } from '../mcom/peer/peer-auth.guard';
import { RequirePeerScope } from '../mcom/peer/peer-scope.decorator';
import { PEER_SCOPES } from '../mcom/peer/peer.types';
import type { PeerRequest } from '../mcom/peer/peer.types';
import { PartnerAuditDataService } from './partner-audit-data.service';
import {
  PartnerAuditsResponseDto,
  PartnerAuditSummaryDto,
  PartnerPreAuditResponseDto,
  PartnerSummaryResponseDto,
} from './dto/partner-audit-data.dto';

/**
 * Inbound M2M surface exposing a delegated user's pre-audit and audit data to
 * permitted ecosystem peers (e.g. fundordonate).
 *
 * The user is always derived from the delegated token (`req.peerCaller.userId`)
 * — there is deliberately no user id in the path — so a caller can only read
 * the data of the user it was delegated for. Every route is `@Public()` to
 * stand down the local-JWT guard, then gated by `PeerAuthGuard`.
 */
@ApiTags('Partner Data (M2M)')
@ApiHeader({
  name: 'Authorization',
  required: true,
  description:
    'Bearer <MCOM delegated service token> — minted by the caller at Central via /api/v1/auth/service-token/exchange.',
})
@Controller('partner/audit-data')
@Public()
@UseGuards(ThrottlerGuard, PeerAuthGuard)
export class PartnerAuditDataController {
  constructor(private readonly service: PartnerAuditDataService) {}

  @Get('pre-audit')
  @RequirePeerScope(PEER_SCOPES.PRE_AUDIT_READ)
  @ApiOperation({
    summary: "Get the delegated user's pre-audit diagnostic",
    description:
      "Returns the latest completed pre-audit for the delegated user, including the server-computed diagnostic (funding need/gap, operations, readiness, recommendation). Requires the `preaudit:read` scope and the user's pre-audit consent.",
  })
  @ApiResponse({ status: 200, type: PartnerPreAuditResponseDto })
  @ApiResponse({
    status: 403,
    description: 'Consent missing or scope/caller not permitted.',
  })
  async getPreAudit(
    @Req() req: PeerRequest,
  ): Promise<PartnerPreAuditResponseDto> {
    return this.service.getPreAudit(req.peerCaller!.userId);
  }

  @Get('audits')
  @RequirePeerScope(PEER_SCOPES.AUDIT_READ)
  @ApiOperation({
    summary: "List the delegated user's audit sessions",
    description:
      "Returns audit sessions and calculated metrics for the delegated user. Requires the `audit:read` scope and the user's pre-audit consent. Raw answers are never exposed.",
  })
  @ApiResponse({ status: 200, type: PartnerAuditsResponseDto })
  @ApiResponse({
    status: 403,
    description: 'Consent missing or scope/caller not permitted.',
  })
  async getAudits(@Req() req: PeerRequest): Promise<PartnerAuditsResponseDto> {
    return this.service.getAudits(req.peerCaller!.userId);
  }

  @Get('summary')
  @RequirePeerScope(PEER_SCOPES.PRE_AUDIT_READ, PEER_SCOPES.AUDIT_READ)
  @ApiOperation({
    summary: 'Get a combined pre-audit + audit summary for the delegated user',
    description:
      'Convenience view for a funding decision: the pre-audit diagnostic plus the audit sessions. Requires BOTH the `preaudit:read` and `audit:read` scopes.',
  })
  @ApiResponse({ status: 200, type: PartnerSummaryResponseDto })
  @ApiResponse({
    status: 403,
    description: 'Consent missing or scope/caller not permitted.',
  })
  async getSummary(
    @Req() req: PeerRequest,
  ): Promise<PartnerSummaryResponseDto> {
    return this.service.getSummary(req.peerCaller!.userId);
  }

  @Get('audits/:id')
  @RequirePeerScope(PEER_SCOPES.AUDIT_READ)
  @ApiOperation({
    summary: "Get one of the delegated user's audit sessions",
  })
  @ApiResponse({ status: 200, type: PartnerAuditSummaryDto })
  @ApiResponse({
    status: 403,
    description: 'Consent missing or scope/caller not permitted.',
  })
  @ApiResponse({ status: 404, description: 'Audit not found for this user.' })
  async getAudit(
    @Param('id') id: string,
    @Req() req: PeerRequest,
  ): Promise<PartnerAuditSummaryDto> {
    return this.service.getAudit(req.peerCaller!.userId, id);
  }
}
