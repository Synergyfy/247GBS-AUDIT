import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TriageService } from './triage.service';
import { TriageController } from './triage.controller';
import { TriageFlowValidatorService } from './triage-flow-validator.service';
import { TriageQuestionService } from './triage-question.service';
import { TriageAnswerService } from './triage-answer.service';
import { BusinessTriageService } from './business-triage.service';
import { BusinessTriageController, PublicTriageFormController } from './business-triage.controller';
import { AdminTriageController } from './admin-triage.controller';
import { TriageFormService } from './triage-form.service';
import { TriageReportService } from './triage-report.service';
import { AuditTriage } from './entities/triage.entity';
import { TriageQuestion } from './entities/triage-question.entity';
import { TriageAnswer } from './entities/triage-answer.entity';
import { PreAuditSession } from './entities/pre-audit-session.entity';
import { TriageForm } from './entities/triage-form.entity';
import { PreAuditService } from './pre-audit.service';
import { PreAuditController } from './pre-audit.controller';
import { TriageOtpService } from './triage-otp.service';
import { AuditModule } from '../audit/audit.module';
import { AdminModule } from '../admin/admin.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditTriage,
      TriageQuestion,
      TriageAnswer,
      PreAuditSession,
      TriageForm,
    ]),
    AuditModule,
    AdminModule,
    MailModule,
  ],
  controllers: [
    TriageController,
    BusinessTriageController,
    PublicTriageFormController,
    AdminTriageController,
    PreAuditController,
  ],
  providers: [
    TriageService,
    TriageFlowValidatorService,
    TriageQuestionService,
    TriageAnswerService,
    BusinessTriageService,
    TriageFormService,
    TriageReportService,
    PreAuditService,
    TriageOtpService,
  ],
  exports: [
    TriageService,
    TriageQuestionService,
    TriageAnswerService,
    TriageFlowValidatorService,
    BusinessTriageService,
    TriageFormService,
    TriageReportService,
    PreAuditService,
    TriageOtpService,
  ],
})
export class TriageModule {}
