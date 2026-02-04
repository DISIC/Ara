import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    private readonly config: ConfigService
  ) {
    const originalUrl = config.get<string>("DATABASE_URL");
    const url = new URL(originalUrl);

    // add or remove url params based on weither we want to connet to the DB using SSL
    if (config.get<boolean>("DATABASE_SSL")) {
      url.searchParams.set("sslmode", "require");
      url.searchParams.set("uselibpqcompat", "true");
    } else {
      url.searchParams.delete("sslmode");
      url.searchParams.delete("uselibpqcompat");
    }

    super({
      adapter: new PrismaPg({
        connectionString: url.toString()
      })
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
