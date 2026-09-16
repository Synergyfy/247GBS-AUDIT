import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { McomService } from './mcom.service';
import { SsoController } from './sso.controller';
import { HandshakeController } from './handshake.controller';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [HttpModule, JwtModule.register({}), UsersModule],
  controllers: [SsoController, HandshakeController, WebhookController],
  providers: [McomService],
  exports: [McomService],
})
export class McomModule {}
