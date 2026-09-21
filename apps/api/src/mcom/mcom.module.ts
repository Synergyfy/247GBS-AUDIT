import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { McomService } from './mcom.service';
import { ExternalPlanService } from './external-plan.service';
import { SsoController } from './sso.controller';
import { WebhookController } from './webhook.controller';
import { ExternalPlanController } from './external-plan.controller';
import { ExternalPlan } from './entities/external-plan.entity';

@Module({
  imports: [HttpModule, JwtModule.register({}), UsersModule, TypeOrmModule.forFeature([ExternalPlan])],
  controllers: [SsoController, WebhookController, ExternalPlanController],
  providers: [McomService, ExternalPlanService],
  exports: [McomService, ExternalPlanService],
})
export class McomModule {}
