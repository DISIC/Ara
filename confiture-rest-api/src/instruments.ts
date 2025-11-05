import * as Sentry from "@sentry/nestjs";

console.log("🚀 ~ process.env.SENTRY_DSN:", process.env.SENTRY_DSN);
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? "unknown"
  // TODO: add release
});
