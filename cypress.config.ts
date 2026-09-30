import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      // Same failure numbering as the Mocha summary, reset for each spec
      let failureIndex = 0;
      on("before:spec", () => {
        failureIndex = 0;
      });
      on("after:screenshot", (details) => {
        // Ignore manual cy.screenshot() calls
        if (!details.testFailure) {
          return;
        }
        failureIndex++;
        const prefix = String(failureIndex).padStart(2, "0");
        const newPath = path.join(path.dirname(details.path), `${prefix}_${path.basename(details.path)}`);
        fs.renameSync(details.path, newPath);
        return { path: newPath };
      });

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
  }
});
