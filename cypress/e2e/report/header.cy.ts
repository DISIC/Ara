import * as auditJson from "../../fixtures/audit.json";
import * as statementJson from "../../fixtures/statement.json";

describe("Header report", () => {
  it("User can see audit in progress banner for in progress audit", () => {
    cy.createTestAudit().then(({ reportId }) => {
      cy.visit(`http://localhost:3000/rapport/${reportId}`);
      cy.contains("Résultats du rapport provisoires");
    });
  });

  it("User can't see audit in progress banner for completed audit", () => {
    cy.createTestAudit({ isComplete: true }).then(({ reportId }) => {
      cy.visit(`http://localhost:3000/rapport/${reportId}`);
      cy.contains("Résultats du rapport provisoires").should("not.exist");
    });
  });

  it("User can see audit header infos", () => {
    cy.createTestAudit({ isComplete: true }).then(({ reportId }) => {
      cy.visit(`http://localhost:3000/rapport/${reportId}`);
      cy.get("[data-cy='report-header']").contains(auditJson.procedureName);
      cy.get("[data-cy='report-header']").contains(`URL du site audité : ${statementJson.procedureUrl}`);
      cy.get("[data-cy='report-header']").contains("Type d’audit : 106 critères");
      cy.get("[data-cy='report-header']").contains(
        `Auditeur ou auditrice : ${auditJson.auditorName}`
      );
    });
  });

  it("User can copy report URL", () => {
    cy.createTestAudit({ isComplete: true }).then(({ reportId }) => {
      cy.visit(`http://localhost:3000/rapport/${reportId}`);
      // FIXME: svg logo is covering elements because
      // Electron does not support CSS nesting for now.
      // Adding `force: true` to click() function solves the problem.
      cy.contains("button", "Copier le lien du rapport").click({ force: true });
      cy.assertClipboardValue(`http://localhost:3000/rapport/${reportId}/`);
      cy.contains("button", "Lien copié");
    });
  });

  it("User can download results", () => {
    cy.createTestAudit({ isComplete: true }).then(({ reportId }) => {
      cy.visit(`http://localhost:3000/rapport/${reportId}`);
      cy.contains("button", "Télécharger").click({ force: true });
      cy.contains("a", "Télécharger l'audit").click({ force: true });

      cy.readFile("cypress/downloads/audit.csv");
    });
  });
});
