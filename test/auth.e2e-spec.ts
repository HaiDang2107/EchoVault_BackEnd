import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/module/auth/dto/auth.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Sử dụng validation pipes nếu có
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const user: AuthDto = {
    email: 'testthỉd@example.com',
    password: 'Te3456',
  };

  let accessToken: string;

  it('/auth/signup (POST) - should sign up a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(user)

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email', user.email);
  });

  it('/auth/login (POST) - should log in an existing user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(user)

    expect(response.body).toHaveProperty('access_token');
    accessToken = response.body.access_token;
  });

  it('/auth/login (POST) - should fail with incorrect password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: 'WrongPassword123',
      })
  });
});
