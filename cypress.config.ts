import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("task", {
        // New task to run console.log from Node
        log(args) {
          console.log(...args);
          return null;
        }
      });
    }
  },
  experimentalStudio: true
});
