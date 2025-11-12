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
       * Custom child command to simulate a paste event with an image
       * @example cy.get(".tiptap").pasteImage({filePath: "../fixture/img.jpg", fileName: 'ImageName.jpg'})
       */
      pasteImage(value: { filePath: string; fileName: string }): Chainable<JQuery<HTMLElement>>;
      /**
       * Custom child command to simulate a paste event with HTML text
       * @example cy.get(".tiptap").pasteImage({filePath: "../fixture/img.jpg", fileName: 'ImageName.jpg'})
       */
      pasteHTML(filePath: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Add a child command to simulate a paste event with an image
// @ts-ignore
Cypress.Commands.add("pasteImage", { prevSubject: "element" }, (subject, options) => {
  cy.fixture(options.filePath, "base64").then(imageBase64 => {
    // Convert base64 to blob
    const blob = Cypress.Blob.base64StringToBlob(imageBase64, "image/jpg");

    // Create a file from that blob
    const file = new File([blob], options.fileName, { type: "image/jpg" });

    // Create a fake ClipboardEvent with a DataTransfer object containing the file
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true
    });

    cy.wrap(subject).invoke("get", 0).invoke("dispatchEvent", pasteEvent);
  });
});

// Add a child command to simulate a paste event with HTML text
// @ts-ignore
Cypress.Commands.add("pasteHTML", { prevSubject: "element" }, (subject, filePath) => {
  cy.fixture(filePath).then(html => {
    // Create a fake ClipboardEvent with a DataTransfer object containing the file
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/html", html);
    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true
    });

    cy.wrap(subject).invoke("get", 0).invoke("dispatchEvent", pasteEvent);
  });
});

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

export {};
