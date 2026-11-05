import { AuditReference } from "../../../confiture-rest-api/src/generated/prisma/enums";

describe("Compliance with RGAA 4 or 5 Audits", () => {
  it("A RGAA 4 audit with blocking user impacts is partially compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, auditReference: AuditReference.RGAA_4, countBlockingUserImpact: 8 }).then(() => {
        cy.visit("http://localhost:3000/compte");

        cy.contains("Terminé (1)");

        cy.get(".audit-compliance-level").contains("Partiellement conforme");
      });
    });
  });

  it("A RGAA 4 audit is compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, auditReference: AuditReference.RGAA_4, isCompliant: true }).then(() => {
        cy.visit("http://localhost:3000/compte");

        cy.contains("Terminé (1)");

        cy.get(".audit-compliance-level").contains("Totalement conforme");
      });
    });
  });

  it("A RGAA 5 with no blocking user impact and many minor or major user impact is partially compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, auditReference: AuditReference.RGAA_5_Web, countBlockingUserImpact: 0 }).then(() => {
        cy.visit("http://localhost:3000/compte");

        cy.contains("Terminé (1)");

        cy.get(".audit-compliance-level").contains("Partiellement conforme");
      });
    });
  });

  it("A RGAA 5 with one blocking user impact is not compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, auditReference: AuditReference.RGAA_5_Web, countBlockingUserImpact: 1 }).then(() => {
        cy.visit("http://localhost:3000/compte");

        cy.contains("Terminé (1)");

        cy.get(".audit-compliance-level").contains("Non conforme");
      });
    });
  });

  it("A RGAA 5 with many blocking user impact is not compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, auditReference: AuditReference.RGAA_5_Web }).then(() => {
        cy.visit("http://localhost:3000/compte");

        cy.contains("Terminé (1)");

        cy.get(".audit-compliance-level").contains("Non conforme");
      });
    });
  });

  it("A RGAA 5 audit is compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, auditReference: AuditReference.RGAA_5_Web, isCompliant: true }).then(() => {
        cy.visit("http://localhost:3000/compte");

        cy.contains("Terminé (1)");

        cy.get(".audit-compliance-level").contains("Totalement conforme");
      });
    });
  });
});
