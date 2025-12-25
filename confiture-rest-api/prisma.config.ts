import { defineConfig } from "prisma/config";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.warn("No DATABASE_URL specified. Using placeholder value");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    // sometimes a DATABASE_URL in not specified
    // we use a placeholder so prisma does not complain when generation the client
    url: process.env.DATABASE_URL || "placeholder_database_url"
  }
});
