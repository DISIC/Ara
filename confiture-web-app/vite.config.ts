import sentryVitePlugin from "@sentry/vite-plugin";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const uploadSourceMapsToSentry =
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT &&
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.VITE_SENTRY_RELEASE;

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true // Source map generation must be turned on
  },
  assetsInclude: ["**/*.docx", "**/*.md"],
  plugins: [
    vue(),
    ...(uploadSourceMapsToSentry
      ? [
          sentryVitePlugin({
            include: "./dist",
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            release: process.env.VITE_SENTRY_RELEASE
          })
        ]
      : [])
  ],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000"
    },
    port: 3000
  },
  preview: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    allowedHosts: [".herokuapp.com"]
  }
});
