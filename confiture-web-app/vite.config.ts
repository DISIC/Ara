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
        VITE_MATOMO_ENABLE: config.env.VITE_MATOMO_ENABLE,
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
