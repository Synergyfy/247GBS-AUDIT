import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TriageService } from './triage.service';
import { TriageController } from './triage.controller';
import { AuditTriage } from './entities/triage.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuditTriage]), AuditModule],
  controllers: [TriageController],
  providers: [TriageService],
})
export class TriageModule {}
