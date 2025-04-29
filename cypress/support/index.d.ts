interface CreateTestAuditOptions {
  isComplete?: boolean;
  isPristine?: boolean;
  hasNoImprovementsComments?: boolean;
  auditorEmail?: string;
  fillStatement?: boolean;
}

interface CreateTestAccountOptions {
  login?: boolean;
}

declare namespace Cypress {
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
      options?: CreateTestAuditOptions
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

    /**
     * Clear field and type a string
     */
    clearAndType(text: string, options?: Partial<ClearOptions>): Chainable;

    isWithinViewport(): Chainable<Element>;
  }
}
