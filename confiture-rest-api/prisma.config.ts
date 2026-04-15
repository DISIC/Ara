import { defineConfig } from "prisma/config";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.warn("No DATABASE_URL specified. Using placeholder value");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Only allow seeding on dev and review environnments
    seed: process.env.NODE_ENV !== "production" || process.env.HEROKU_APP_NAME
      ? "yarn dlx tsx prisma/seed.ts"
      : undefined
  },
  datasource: {
    // sometimes a DATABASE_URL in not specified
    // we use a placeholder so prisma does not complain when generating the client
    url: process.env.DATABASE_URL || "placeholder_database_url"
  }
});
