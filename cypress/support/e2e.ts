// ***********************************************************
// This example support/e2e.ts is processed and
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

/**
 * Hack to ignore error "(uncaught:exception) Error: ResizeObserver loop limit exceeded"
 * See:
 * - https://github.com/vuejs/vue-cli/issues/7431
 * - https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
 */
Cypress.on(
  "uncaught:exception",
  (err) => !err.message.includes("ResizeObserver loop limit exceeded")
);

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')
