import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from './../src/app.module';

describe('Audit Flow (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;
  let auditSessionId: string;

  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // 1. Setup: Register & Login a user
    const email = `audit-test-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'password123', firstName: 'Test', lastName: 'User', businessName: 'TestBiz' });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password: 'password123' });
      
    accessToken = loginRes.body.accessToken;
    const cookies = loginRes.get('Set-Cookie');

    // 2. Verify Refresh Token works via cookie
    const refreshRes = await request(app.getHttpServer())
      .get('/auth/refresh')
      .set('Cookie', cookies)
      .expect(200);

    expect(refreshRes.body.accessToken).toBeDefined();
    // Update accessToken to the new one
    accessToken = refreshRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Should Submit Triage and Create Session', async () => {
    const res = await request(app.getHttpServer())
      .post('/triage')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        stockExtent: 40,
        stockImpact: 'serious',
        hasSpareCapacity: 'yes'
      })
      .expect(201);

    expect(res.body.decision).toBe('CRITICAL');
    expect(res.body.auditType).toBe('LONG_FORM');
    expect(res.body.auditSessionId).toBeDefined();
    
    auditSessionId = res.body.auditSessionId;
  });

  it('2. Should Select Sector', async () => {
    await request(app.getHttpServer())
      .patch(`/audit/${auditSessionId}/sector`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sectorId: 'hospitality-food',
        groupId: 'dining',
        businessTypeId: 'fine-dining'
      })
      .expect(200);
  });

  it('3. Should Submit Answers and Get Calculation', async () => {
    const res = await request(app.getHttpServer())
      .put(`/audit/${auditSessionId}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        // 100% waste impact inputs
        'hosp-dining-stock-deep-01': 1000, 
        'stock_value_excess': 5000,
        'hosp-dining-stock-trigger-01': 10 
      })
      .expect(200);

    const metrics = res.body.calculatedMetrics;
    expect(metrics).toBeDefined();
    expect(metrics.totalStockImpact).toBe(18000); // Matches logic (1000*12 + 5000*0.1*12)
  });
});
