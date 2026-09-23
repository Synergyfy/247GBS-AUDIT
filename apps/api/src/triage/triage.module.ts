import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TriageService } from './triage.service';
import { TriageController } from './triage.controller';
import { BusinessTriageService } from './business-triage.service';
import { BusinessTriageController } from './business-triage.controller';
import { AdminTriageController } from './admin-triage.controller';
import { AuditTriage } from './entities/triage.entity';
import { TriageQuestion } from './entities/triage-question.entity';
import { TriageAnswer } from './entities/triage-answer.entity';
import { PreAuditSession } from './entities/pre-audit-session.entity';
import { PreAuditService } from './pre-audit.service';
import { PreAuditController } from './pre-audit.controller';
import { AuditModule } from '../audit/audit.module';
import { AdminModule } from '../admin/admin.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditTriage, TriageQuestion, TriageAnswer, PreAuditSession]),
    AuditModule,
    AdminModule,
    MailModule,
  ],
  controllers: [TriageController, BusinessTriageController, AdminTriageController, PreAuditController],
  providers: [TriageService, BusinessTriageService, PreAuditService],
})
export class TriageModule {}
