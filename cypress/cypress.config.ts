import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "support/e2e.ts",
    fixturesFolder: "fixtures",
    downloadsFolder: "downloads",
    screenshotsFolder: "screenshots",
    setupNodeEvents(on) {
      // implement node event listeners here
      on("task", {
        // New task to run console.log from Node
        log(args) {
          console.log(...args);
          return null;
        },
        // New task to run console.table from Node
        table(data) {
          console.table(data);
          return null;
        }
      });
    }
  },
  experimentalStudio: true
});
