import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { faker } from '@faker-js/faker';


describe('Withdrawals', () => {
  let app: INestApplication;
  let accessToken: string;

  const path = "/api/withdrawals"

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      skipMissingProperties: false,
    }))
    await app.init();

    let form = {
      email: faker.internet.email(),
      password: "password",
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      nextOfKin: faker.name.fullName()
    }
    // Create account
    await request(app.getHttpServer())
      .post("/api/auth/signup")
      .send(form)
      .expect(201);

    // Login to account
    await request(app.getHttpServer())
      .post("/api/auth/login")
      .send(form)
      .expect(201)
      .then(resp => accessToken = resp.body.accessToken)

    // Deposit money into account
    await request(app.getHttpServer())
      .post("/api/deposits")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 900000 })
      .expect(HttpStatus.CREATED)
      .expect((resp) => resp.body.amount == 900000)

  });

  it(`withdraw 8000 => ${path} (POST)`, () => {
    return request(app.getHttpServer())
      .post(path)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 8000 })
      .expect(HttpStatus.CREATED)
      .expect((resp) => resp.body.amount == 8000)
  });

  it(`withdraw amount above account balance => ${path} (POST)`, () => {
    return request(app.getHttpServer())
      .post(path)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 90000000 })
      .expect(HttpStatus.FORBIDDEN)
  });

  it(`withdraw with invalid amount => ${path} (POST)`, () => {
    return request(app.getHttpServer())
      .post(path)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: faker.random.words() })
      .expect(HttpStatus.BAD_REQUEST)
  });

  it(`withdraw negative amount => ${path} (POST)`, () => {
    return request(app.getHttpServer())
      .post(path)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: -5000 })
      .expect(HttpStatus.BAD_REQUEST)
  });

  it(`list of withdrawals => ${path} (GET)`, () => {
    return request(app.getHttpServer())
      .get(path)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect((resp) => {
        expect(Array.isArray(resp.body)).toBe(true)
        expect(resp.body.length).toBeGreaterThanOrEqual(1)
      })
  });
});
