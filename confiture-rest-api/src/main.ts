import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as morgan from 'morgan';

import { AppModule } from './app.module';

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder().setTitle('Ara API').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/swagger', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'common'));

  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  configureSwagger(app);

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
