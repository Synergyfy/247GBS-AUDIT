import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtocolsController } from './protocols.controller';
import { ProtocolsService } from './protocols.service';
import { NotificationSetting } from './entities/notification-setting.entity';
import { BillingProfile } from './entities/billing-profile.entity';
import { Invoice } from './entities/invoice.entity';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationSetting, BillingProfile, Invoice]),
    UsersModule,
  ],
  controllers: [ProtocolsController],
  providers: [ProtocolsService],
})
export class ProtocolsModule {}
