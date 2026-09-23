import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditSession } from './entities/audit-session.entity';
import { PreAuditSession } from '../triage/entities/pre-audit-session.entity';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuditSession, PreAuditSession]), AIModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
