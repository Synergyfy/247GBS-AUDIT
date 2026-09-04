import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { AuditSession } from '../audit/entities/audit-session.entity';
import { Invoice } from '../protocols/entities/invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuditSession, Invoice]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
