import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from './../src/app.module';

describe('Profile (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;

  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Setup: Login
    const email = `profile-test-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send({ email, password: 'password123', firstName: 'Test', lastName: 'User', businessName: 'TestBiz' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/signin')
      .send({ email, password: 'password123' });
      
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users/profile (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBeDefined();
        expect(res.body.firstName).toBe('Test');
      });
  });

  it('/users/profile (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ location: 'New York' })
      .expect(200)
      .expect((res) => {
        expect(res.body.location).toBe('New York');
      });
  });
});
