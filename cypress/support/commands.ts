/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

interface CreateTestAuditOptions {
  isComplete?: boolean;
  hasNoImprovementsComments?: boolean;
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element based on label
       * @example cy.getByLabel('Title')
       */
      getByLabel(value: string | RegExp): Chainable;

      /**
       * Command to assert the content of the clipboard
       * @example cy.assertClipboardValue('Pouet')
       */
      assertClipboardValue(value: string): Chainable;

      /**
       * Create a test audit with auto generated IDs
       * @example cy.createTestAudit(true, true)
       */
      createTestAudit(options?: CreateTestAuditOptions): Chainable;
    }
  }
}

Cypress.Commands.add(
  "getByLabel",
  { prevSubject: "optional" },
  (subject, label: string | RegExp) => {
    const localCy = subject ? cy.wrap(subject) : cy;
    localCy
      .contains("label", label)
      .invoke("attr", "for")
      .then((id) => {
        cy.get("#" + id);
      });
  },
);

Cypress.Commands.add("assertClipboardValue", (value: string) => {
  cy.window().focus();
  cy.window().then((win) => {
    win.navigator.clipboard.readText().then((text) => {
      expect(text).to.eq(value);
    });
  });
});

Cypress.Commands.add("createTestAudit", (options?: CreateTestAuditOptions) => {
  const isComplete = options?.isComplete;
  const hasNoImprovementsComments = options?.hasNoImprovementsComments;
  cy.exec(
    `yarn run tests:seed-debug-audit ${isComplete ? "--complete" : ""} ${
      hasNoImprovementsComments ? "--no-impr" : ""
    }`,
  ).then((result) => {
    if (result.code !== 0) {
      // failure
      throw "Command exited with non-zero code";
    }

    // sucesss
    const json = result.stdout.split("\n")[1];
    const data = JSON.parse(json);

    return {
      editId: data.editId,
      reportId: data.reportId,
    };
  });
});

export {};
