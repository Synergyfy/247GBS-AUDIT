import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';
import { AuditModule } from '../audit/audit.module';
import { AIModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { AuditSession } from '../audit/entities/audit-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditSession]),
    AuditModule,
    AIModule,
    UsersModule
  ],
  controllers: [DashboardController, IntelligenceController],
  providers: [DashboardService, IntelligenceService],
})
export class DashboardModule {}
