import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
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
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!requestOrigin) return callback(null, true);

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
