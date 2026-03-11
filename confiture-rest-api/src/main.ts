// FIX urgh i dont wanna fight eslint insisting this should be the last import when i need it to be first
/* eslint-disable perfectionist/sort-imports */
import "./instruments";

import type { NestExpressApplication } from "@nestjs/platform-express";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import proxy from "express-http-proxy";
import morgan from "morgan";

import { AppModule } from "./app.module";

/**
 * TODO: DELETE THIS
 */

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder().setTitle("Ara API").build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/swagger", app, document);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useBodyParser("json", { limit: "500kb" });
  app.use(morgan(process.env.NODE_ENV !== "production" ? "dev" : "common"));
  app.use("/uploads", proxy(process.env.S3_VIRTUAL_HOST));

  app.setGlobalPrefix("/api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  configureSwagger(app);

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
