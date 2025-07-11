import { writeFile } from "fs/promises";
import { resolve } from "path";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import openapiTS, { OpenAPI3 } from "openapi-typescript";

import { AppModule } from "./app.module";

async function main() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder().setTitle("Confiture API").build();
  const document = SwaggerModule.createDocument(app, config);

  const ast = await openapiTS(document as OpenAPI3);
  const fileContent = "\n" + ast;
  const resolvedPath = resolve(__dirname, "../confiture-api.ts");
  await writeFile(resolvedPath, fileContent, {
    encoding: "utf-8"
  });
  console.log("✅ Typings saved to", resolvedPath);
}

main();
