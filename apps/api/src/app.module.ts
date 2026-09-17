import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TriageModule } from './triage/triage.module';
import { AuditModule } from './audit/audit.module';
import { AIModule } from './ai/ai.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProtocolsModule } from './protocols/protocols.module';
import { AdminModule } from './admin/admin.module';
import { SpecialistsModule } from './dashboard/specialists/specialists.module';
import { McomModule } from './mcom/mcom.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: parseInt(configService.get<string>('POSTGRES_PORT') || '5432', 10),
        username: configService.get<string>('POSTGRES_USERNAME'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_NAME'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    TriageModule,
    AuditModule,
    AIModule,
    DashboardModule,
    ProtocolsModule,
    AdminModule,
    SpecialistsModule,
    McomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
