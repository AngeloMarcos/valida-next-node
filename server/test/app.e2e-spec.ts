import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api (GET) - should return 404 for undefined routes', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(404);
  });

  describe('CORS', () => {
    it('should have CORS enabled', async () => {
      const response = await request(app.getHttpServer())
        .options('/api')
        .expect(404); // 404 because route doesn't exist, but CORS headers should be present
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
