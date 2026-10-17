import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditSession } from '../audit/entities/audit-session.entity';
import { PreAuditSession } from '../triage/entities/pre-audit-session.entity';
import { UsersModule } from '../users/users.module';
import { McomModule } from '../mcom/mcom.module';
import { PeerAuthGuard } from '../mcom/peer/peer-auth.guard';
import { PartnerAuditDataController } from './partner-audit-data.controller';
import { PartnerAuditDataService } from './partner-audit-data.service';
import { AuditPartnerNotifier } from './audit-partner-notifier.service';

/**
 * M2M data-sharing surface for ecosystem peers (fundordonate et al.).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([PreAuditSession, AuditSession]),
    UsersModule,
    McomModule,
  ],
  controllers: [PartnerAuditDataController],
  providers: [PartnerAuditDataService, PeerAuthGuard, AuditPartnerNotifier],
  exports: [AuditPartnerNotifier],
})
export class PartnerModule {}
