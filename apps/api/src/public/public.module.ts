import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { PlatformSetting } from '../admin/entities/platform-setting.entity';
import { HelpResource } from '../admin/entities/help-resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting, HelpResource])],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}