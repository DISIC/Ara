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
      createTestAudit(
        options?: CreateTestAuditOptions,
      ): Chainable<{ editId: string; reportId: string }>;

      /**
       * Create a test account and return its username and password
       */
      createTestAccount(options?: CreateTestAccountOptions): Chainable<{
        username: string;
        password: string;
        authToken: string;
        uid: string;
      }>;

      isWithinViewport(): Chainable<Element>;
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
        cy.get(`#${id}`);
      });
  }
);

Cypress.Commands.add("assertClipboardValue", (value: string) => {
  cy.window().focus();
  cy.window().then((win) => {
    win.navigator.clipboard.readText().then((text) => {
      expect(text).to.eq(value);
    });
  });
});

interface CreateTestAuditOptions {
  isComplete?: boolean;
  isPristine?: boolean;
  hasNoImprovementsComments?: boolean;
  auditorEmail?: string;
  fillStatement?: boolean;
}

/**
 * Create a test audit with specific options by calling debug API endpoints.
 */
Cypress.Commands.add("createTestAudit", (options?: CreateTestAuditOptions) => {
  cy.request("POST", "http://localhost:3000/api/debug/create-audit", {
    isComplete: options?.isComplete,
    isPristine: options?.isPristine,
    noImprovements: options?.hasNoImprovementsComments,
    auditorEmail: options?.auditorEmail,
    fillStatement: options?.fillStatement
  }).its("body");
});

interface CreateTestAccountOptions {
  login?: boolean;
}

/**
 * Create a test account with specific options by calling debug API endpoints.
 */
Cypress.Commands.add(
  "createTestAccount",
  (options?: CreateTestAccountOptions) => {
    cy.request("POST", "http://localhost:3000/api/debug/create-verified-user")
      .its("body")
      .as("userCredentials")
      .then(({ authToken }) => {
        if (options?.login) {
          cy.window().then((win) =>
            win.localStorage.setItem("confiture:authToken", authToken)
          );
        }
      });

    cy.get("@userCredentials");
  }
);

Cypress.Commands.addQuery(
  "isWithinViewport" as keyof Cypress.Chainable<any>,
  () => {
    const viewportWidth = Cypress.config("viewportWidth");
    const viewportHeight = Cypress.config("viewportHeight");
    const innerFn = (subject: HTMLElement[]) => {
      // Cypress retries this function on failure
      const { top, left, bottom, right } = subject[0].getBoundingClientRect();
      expect(top).to.be.at.least(0);
      expect(left).to.be.at.least(0);
      expect(right).to.be.at.most(viewportWidth);
      expect(bottom).to.be.at.most(viewportHeight);
    };
    return innerFn;
  }
);

// Override cy.log so that it calls "log" task in headless mode.
// See "log" task in cypress.config.
Cypress.Commands.overwrite("log", function (log, ...args) {
  const indent = "\t"; // You can adjust the number of tabs or spaces here
  const formattedArgs = args.map((arg) =>
    typeof arg === "string" ? indent + arg : indent + JSON.stringify(arg)
  );
  if (Cypress.browser.isHeadless) {
    return cy.task("log", formattedArgs, { log: false }).then(() => {
      return log(...args);
    });
  } else {
    // eslint-disable-next-line no-console
    console.log(...formattedArgs);
    return log(...args);
  }
});

export {};
