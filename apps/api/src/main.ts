import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  // Fail fast on missing/weak secrets (never fall back to public defaults).
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set');
  }
  if (accessSecret.length < 32 || refreshSecret.length < 32) {
    throw new Error('JWT secrets must be at least 32 characters');
  }
  if (process.env.TYPEORM_SYNC === 'true' && process.env.NODE_ENV === 'production') {
    throw new Error('TYPEORM_SYNC=true is forbidden in production. Use migrations.');
  }
  if (process.env.TYPEORM_SYNC === 'true' && process.env.NODE_ENV !== 'development') {
    // eslint-disable-next-line no-console
    console.warn('[DB] TYPEORM_SYNC=true is only honoured with NODE_ENV=development. Ignored otherwise.');
  }
  const app = await NestFactory.create(AppModule);
  
  // Vercel/Heroku proxy support (Critical for Secure Cookies)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalGuards(new JwtAuthGuard(app.get('Reflector')));
  app.setGlobalPrefix('api/v1');

  // Ports/origins are env-driven: FRONTEND_URL + ALLOWED_ORIGINS decide
  // which frontend origin is allowed. Defaults match apps/web/.env (9009).
  const frontendFallback = 'http://localhost:9009';
  const configuredFrontend = (process.env.FRONTEND_URL || frontendFallback)
    .trim()
    .replace(/\/+$/, '');

  const defaultOrigins = [
    'https://247gbsaudit.centralhubsolution.com',
    configuredFrontend,
  ]
    .filter(Boolean)
    .map((o) => (o as string).trim().replace(/\/+$/, ''));

  const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, ''))
    .filter(Boolean);

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  console.log('[CORS] Allowed origins:', allowedOrigins);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      // No-origin requests (mobile apps, curl, server-to-server) are gated by
      // ALLOW_NO_ORIGIN. Default: allow in dev, deny in production.
      // Auth is enforced by JWT cookies/headers, not by Origin — CORS is only
      // a browser policy.
      if (!requestOrigin) {
        const raw = process.env.ALLOW_NO_ORIGIN;
        const allowNoOrigin =
          raw !== undefined ? raw === 'true' : process.env.NODE_ENV !== 'production';
        if (allowNoOrigin) return callback(null, true);
        // eslint-disable-next-line no-console
        console.warn('[CORS] Blocked no-origin request (ALLOW_NO_ORIGIN=false)');
        return callback(null, false);
      }

      const normalized = requestOrigin.trim().replace(/\/+$/, '');
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: "${requestOrigin}" (Normalized: "${normalized}")`);
      console.warn(`[CORS] Allowed list: ${JSON.stringify(allowedOrigins)}`);
      return callback(null, false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('247 GBS Audit API')
    .setDescription('API documentation for the 247 GBS Audit platform. \n\n**Authentication:** \n- Most endpoints require a Bearer Access Token.\n- Use `/auth/signin` to get tokens.\n- Use `/auth/refresh` with a Refresh Token to get new Access Tokens.\n- MCOM SSO endpoints are public and handle OAuth flow.')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'refresh-token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/api-docs', app, document, {
    customSiteTitle: '247 GBS Audit API Docs',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css',
    ],
  });

  // Single source of truth: process.env.PORT (see apps/api/.env). Defaults to 9008.
  const port = parseInt(process.env.PORT ?? '9008', 10);
  await app.listen(port);
  console.log(`Application is running on port: ${port}`);
}
bootstrap();
