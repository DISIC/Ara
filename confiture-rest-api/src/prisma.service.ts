import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    "query" | "info" | "warn" | "error"
  >
  implements OnModuleInit
{
  constructor() {
    const debugQuery = process.env.DEBUG === "prisma:query";
    let logObject = {};
    if (debugQuery) {
      // Note: ideally we would use `emit: "event"` instead of `emit: "stdout"`
      // to avoid double logging, but Prisma's query logging is connection-scoped
      // rather than query-scoped, so queries using an existing connection
      // would not appear in logs
      // TODO: improve when upgrading Prisma
      logObject = {
        log: [
          {
            emit: "stdout",
            level: "query"
          }
        ]
      };
    }
    super(logObject);
  }

  async onModuleInit() {
    await this.$connect();
    this.$on("query", (query: Prisma.QueryEvent) => {
      let q = query.query;
      JSON.parse(query.params).forEach((e, i) => {
        q = q.replace(`$${i + 1}`, `'${e}'`);
      });
      console.log("=======================================");
      console.log("--- Prisma Query (with $n replaced) ---");
      console.log(q);
      console.log("Duration: " + query.duration + "ms\n");
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }
}
