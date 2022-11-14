import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { ViteEjsPlugin } from "vite-plugin-ejs";

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.docx"],
  plugins: [
    vue(),
    ViteEjsPlugin((config) => {
      return {
        VITE_MATOMO_BASE_URL: config.env.VITE_MATOMO_BASE_URL,
        VITE_MATOMO_SITE_ID: config.env.VITE_MATOMO_SITE_ID,
      };
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/setupTests.ts"],
  },
});
