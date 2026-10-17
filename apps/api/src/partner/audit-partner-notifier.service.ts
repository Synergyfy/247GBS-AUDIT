import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PeerClientService } from '../mcom/peer/peer-client.service';
import { UsersService } from '../users/users.service';

export interface AuditCompletedPayload {
  auditId: string;
  mcomUserId: string | null;
  status: string;
  auditType: string | null;
  sectorId: string | null;
  calculatedMetrics: Record<string, unknown> | null;
  completedAt: string;
}

interface CompletedAuditLike {
  id: string;
  userId: string;
  status: string;
  auditType?: string | null;
  sectorId?: string | null;
  calculatedMetrics?: unknown;
}

/**
 * Optional outbound push: notifies a partner (fundordonate) when an audit is
 * completed so it can re-evaluate funding.
 *
 * Disabled by default and fully env-driven — it only fires when
 * `FUNDORDONATE_AUDIT_EVENTS_ENABLED=true` **and** `FUNDORDONATE_BASE_URL` is
 * set. Failures are logged and swallowed so a partner outage never breaks the
 * audit completion flow.
 */
@Injectable()
export class AuditPartnerNotifier {
  private readonly logger = new Logger(AuditPartnerNotifier.name);

  constructor(
    private readonly config: ConfigService,
    private readonly peerClient: PeerClientService,
    private readonly usersService: UsersService,
  ) {}

  private get enabled(): boolean {
    return (
      this.config.get<string>('FUNDORDONATE_AUDIT_EVENTS_ENABLED') === 'true'
    );
  }

  private get baseUrl(): string {
    return this.config.get<string>('FUNDORDONATE_BASE_URL')?.trim() || '';
  }

  private get eventPath(): string {
    return (
      this.config.get<string>('FUNDORDONATE_AUDIT_EVENT_PATH')?.trim() ||
      '/api/v1/partner/audit-events'
    );
  }

  private get audience(): string {
    return (
      this.config.get<string>('FUNDORDONATE_CLIENT_ID')?.trim() ||
      'fundordonate'
    );
  }

  private get scope(): string {
    return (
      this.config.get<string>('FUNDORDONATE_AUDIT_EVENT_SCOPE')?.trim() ||
      'audit:write'
    );
  }

  async notifyAuditCompleted(audit: CompletedAuditLike): Promise<void> {
    if (!this.enabled || !this.baseUrl) return;

    let mcomUserId: string | null = null;
    try {
      const user = await this.usersService.findById(audit.userId);
      mcomUserId = user?.mcomUserId ?? null;
    } catch (error) {
      this.logger.warn(
        `Could not resolve user for audit ${audit.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    const payload: AuditCompletedPayload = {
      auditId: audit.id,
      mcomUserId,
      status: audit.status,
      auditType: audit.auditType ?? null,
      sectorId: audit.sectorId ?? null,
      calculatedMetrics:
        (audit.calculatedMetrics as Record<string, unknown>) ?? null,
      completedAt: new Date().toISOString(),
    };

    try {
      await this.peerClient.callPeerApi(
        this.baseUrl,
        this.audience,
        this.eventPath,
        { method: 'POST', scope: this.scope, data: payload },
      );
      this.logger.log(
        `Notified ${this.audience} of completed audit ${audit.id}`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not notify ${this.audience} of audit ${audit.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
