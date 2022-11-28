import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));

  // enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      skipMissingProperties: false,
    }),
  );


  const config = new DocumentBuilder()
    .setTitle('Demo Credit API Docs')
    .setDescription('API documentation for Demo Credit application')
    .setVersion('1.0')
    .addBearerAuth()
    .setBasePath(`${process.env.APP_URL}/api`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('public/swagger-spec.json', JSON.stringify(document));

  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
