import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { AuditSession } from '../audit/entities/audit-session.entity';
import { Invoice } from '../protocols/entities/invoice.entity';
import { PlatformSetting } from './entities/platform-setting.entity';
import { HelpResource } from './entities/help-resource.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuditSession, Invoice, PlatformSetting, HelpResource]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
