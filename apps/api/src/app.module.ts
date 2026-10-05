import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
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
import { PublicModule } from './public/public.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: parseInt(configService.get<string>('RATE_LIMIT_TTL_SECONDS') || '60', 10) * 1000,
            limit: parseInt(configService.get<string>('RATE_LIMIT_PRE_AUDIT') || '20', 10),
          },
        ],
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Secure default: synchronize is ALWAYS off unless explicitly opted-in
        // for local development via TYPEORM_SYNC=true. Never auto-enables in
        // prod, staging, or Supabase environments. Use migrations (see /migrations).
        const syncRequested = configService.get<string>('TYPEORM_SYNC') === 'true';
        const isProd = process.env.NODE_ENV === 'production';
        const synchronize = syncRequested && !isProd && process.env.NODE_ENV === 'development';
        if (syncRequested && !synchronize) {
          // eslint-disable-next-line no-console
          console.warn(
            '[DB] TYPEORM_SYNC=true ignored (only honoured with NODE_ENV=development). Use migrations.',
          );
        }
        return {
          type: 'postgres',
          host: configService.get<string>('POSTGRES_HOST'),
          port: parseInt(configService.get<string>('POSTGRES_PORT') || '5432', 10),
          username: configService.get<string>('POSTGRES_USERNAME'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_NAME'),
          autoLoadEntities: true,
          synchronize,
          // Migrations are CLI-driven (see data-source.ts + package.json),
          // never auto-run on boot to avoid deploy races.
          migrationsRun: false,
          ssl:
            process.env.NODE_ENV === 'production' ||
            configService.get<string>('POSTGRES_SSL') === 'true' ||
            Boolean(configService.get<string>('POSTGRES_HOST')?.includes('supabase'))
              ? { rejectUnauthorized: false }
              : false,
        };
      },
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
    PublicModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
