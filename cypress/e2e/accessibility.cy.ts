import { checkA11y } from "./common";

describe("Accessibility", () => {
  it("Has no detectable a11y violations on load", () => {
    cy.visit("http://localhost:3000");

    checkA11y();
  });

  it("Has no detectable a11y violations on dashboard page", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true });
      cy.createTestAudit({ auditorEmail: username, isPristine: true });
      cy.createTestAudit({ auditorEmail: username });
      cy.createTestAudit({ auditorEmail: username }).as("audit");
      cy.visit("http://localhost:3000/compte");

      checkA11y();
    });
  });

  it("Has no detectable a11y violations on generation page", () => {
    cy.createTestAudit({ isComplete: true }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation/`);
      checkA11y();
    });
  });

  it("Has no detectable a11y violations on synthese page", () => {
    cy.createTestAudit({ isComplete: true }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/synthese/`);
      checkA11y();
    });
  });
});
