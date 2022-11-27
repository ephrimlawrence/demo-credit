import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { faker } from '@faker-js/faker';

const path = "/api/auth/signup"

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const form = {
    email: faker.internet.email(),
    password: "password",
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    nextOfKin: faker.name.fullName()
  }

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

  });

  it(`Create account => ${path} (POST)`, () => {
    return request(app.getHttpServer())
      .post(path)
      .send(form)
      .expect(201)
      .expect((resp) => resp.body.firstName == form.firstName)
      .expect((resp) => resp.body.lastName == form.lastName)
      .expect((resp) => resp.body.nextOfKin == form.nextOfKin)
      .expect((resp) => resp.body.password == undefined)
      .expect((resp) => resp.body.email == form.email);
  });

  it(`Create account with existing email => ${path} (POST)`, () => {
    return request(app.getHttpServer())
      .post(path)
      .send(form)
      .expect(HttpStatus.CONFLICT);
  });

  it(`Create account with invalid email => ${path} (POST)`, () => {
    return request(app.getHttpServer())
      .post(path)
      .send({ ...form, email: faker.random.words() })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it(`with missing required fields  => ${path} (POST)`, () => {
    const { email, firstName, nextOfKin, ...f } = form

    return request(app.getHttpServer())
      .post(path)
      .send(f)
      .expect(HttpStatus.BAD_REQUEST);
  });
});
