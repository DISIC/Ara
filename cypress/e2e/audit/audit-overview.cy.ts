import { AuditReference } from "../../../confiture-web-app/src/types";

describe("Audit Overview", () => {
  it("RGAA 4 audit overview", () => {
    cy.createTestAudit({ isPristine: true, auditReference: AuditReference.RGAA_4 }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/synthese`);
      cy.contains("Web - 106 critères - RGAA 4");
    });
  });

  it("RGAA 5 Web audit overview", () => {
    cy.createTestAudit({ isPristine: true, auditReference: AuditReference.RGAA_5_Web }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/synthese`);
      cy.contains("Web - 106 critères - RGAA 5");
    });
  });

  it("RGAA 5 Document audit overview", () => {
    cy.createTestAudit({ isPristine: true, auditReference: AuditReference.RGAA_5_Document }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/synthese`);
      cy.contains("Bureautique - 106 critères - RGAA 5");
    });
  });

  it("RGAA 5 Mobile audit overview", () => {
    cy.createTestAudit({ isPristine: true, auditReference: AuditReference.RGAA_5_Mobile }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/synthese`);
      cy.contains("Application mobile - 106 critères - RGAA 5");
    });
  });
});
