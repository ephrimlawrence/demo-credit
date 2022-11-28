import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { faker } from '@faker-js/faker';


describe('Transfers', () => {
  let app: INestApplication;
  let accessToken: string;

  const accounts = [];
  const path = "/api/transfers"

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

    for (let i = 0; i < 2; i++) {
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
        .expect(201)
        .then(resp => accounts.push(resp.body))

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
    }
  });

  it(`transfer 1000 to another account => ${path} (POST)`, () => {
    return request(app.getHttpServer())
      .post(path)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 1000, toAccountId: accounts[0].accountId })
      .expect(HttpStatus.CREATED)
  });

  it(`transfer 1000 to another non existent account => ${path} (POST)`, () => {

    return request(app.getHttpServer())
      .post(path)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 1000, toAccountId: faker.random.numeric(7) })
      .expect(HttpStatus.NOT_FOUND)
  });

  it(`transfer -1000 => ${path} (POST)`, () => {

    return request(app.getHttpServer())
      .post(path)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: -1000, toAccountId: accounts[0].accountId })
      .expect(HttpStatus.BAD_REQUEST)
  });

  it(`transfer amount more than current balance => ${path} (POST)`, () => {

    return request(app.getHttpServer())
      .post(path)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 100000000, toAccountId: accounts[0].accountId })
      .expect(HttpStatus.FORBIDDEN)
  });
});
