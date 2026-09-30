import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditSession } from './entities/audit-session.entity';
import { AuditForm } from './entities/audit-form.entity';
import { AuditFormQuestion } from './entities/audit-form-question.entity';
import { AuditFormAnswer } from './entities/audit-form-answer.entity';
import { PreAuditSession } from '../triage/entities/pre-audit-session.entity';
import { AIModule } from '../ai/ai.module';
import { AdminModule } from '../admin/admin.module';
import { AuditFormService } from './audit-form.service';
import { AdminAuditFormsController, PublicAuditFormsController } from './audit-form.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditSession,
      AuditForm,
      AuditFormQuestion,
      AuditFormAnswer,
      PreAuditSession,
    ]),
    AIModule,
    AdminModule,
  ],
  controllers: [
    AuditController,
    AdminAuditFormsController,
    PublicAuditFormsController,
  ],
  providers: [AuditService, AuditFormService],
  exports: [AuditService, AuditFormService],
})
export class AuditModule {}

