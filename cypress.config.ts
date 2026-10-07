import fs from "fs";
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
        },
        // New task to run console.table from Node
        table(data) {
          console.table(data);
          return null;
        },
        clearDownloads() {
          const downloads = config.downloadsFolder;
          fs.rmSync(downloads, { recursive: true, force: true });
          fs.mkdirSync(downloads, { recursive: true });

          return null;
        }
      });
    }
  }
});
