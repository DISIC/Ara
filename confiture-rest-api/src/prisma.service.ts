// @ts-nocheck
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

export function getPrismaInstance(config: ConfigService) {
  let url = config.get<string>("DATABASE_URL");

  // add or remove url params based on weither we want to connet to the DB using SSL
  try {
    const urlBuilder = new URL(url);
    if (config.get<boolean>("DATABASE_SSL")) {
      urlBuilder.searchParams.set("sslmode", "require");
      urlBuilder.searchParams.set("uselibpqcompat", "true");
    } else {
      urlBuilder.searchParams.delete("sslmode");
      urlBuilder.searchParams.delete("uselibpqcompat");
    }
    url = urlBuilder.toString();
  } catch {
    // if we fail to parse the url, do nothing, there are cases where
    // DATABASE_URL is undefined (such as when generating types)
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: url
    })
  }).$extends({
    name: "auditsHiddenByDefault",
    query: {
      audit: {
        $allOperations({ args, model, operation, query }) {
          console.log({ model, operation, args });
          if (args.where) {
            args.where = { isHidden: false, ...args.where };
          }
          console.log(args);
          return query(args);
        }
      }
    }
  });

  return prisma;
}

export const PRISMA_SERVICE = Symbol("PRISMA_SERVICE");

// FIXME: use exact type of extended client
export type PrismaService = PrismaClient;

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit {
//   constructor(
//     private readonly config: ConfigService
//   ) {
//     let url = config.get<string>("DATABASE_URL");
//
//     // add or remove url params based on weither we want to connet to the DB using SSL
//     try {
//       const urlBuilder = new URL(url);
//       if (config.get<boolean>("DATABASE_SSL")) {
//         urlBuilder.searchParams.set("sslmode", "require");
//         urlBuilder.searchParams.set("uselibpqcompat", "true");
//       } else {
//         urlBuilder.searchParams.delete("sslmode");
//         urlBuilder.searchParams.delete("uselibpqcompat");
//       }
//       url = urlBuilder.toString();
//     } catch {
//       // if we fail to parse the url, do nothing, there are cases where
//       // DATABASE_URL is undefined (such as when generating types)
//     }
//
//     super({
//       adapter: new PrismaPg({
//         connectionString: url
//       })
//     });
//   }
//
//   async onModuleInit() {
//     await this.$connect();
//   }
// }
