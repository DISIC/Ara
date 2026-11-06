import { AuditReference } from "../../../confiture-rest-api/src/generated/prisma/enums";

describe("RGAA 4 or 5 Audit Compliance", () => {
  it("Account : a RGAA 4 audit with blocking user impacts is partially compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, auditReference: AuditReference.RGAA_4, countBlockingUserImpact: 8 }).then(() => {
        cy.visit("http://localhost:3000/compte");

        cy.contains("Terminé (1)");

        cy.get(".audit-compliance-level").contains("Partiellement conforme");
      });
    });
  });

  it("Account : a RGAA 4 audit is compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, auditReference: AuditReference.RGAA_4, isCompliant: true }).then(() => {
        cy.visit("http://localhost:3000/compte");

        cy.contains("Terminé (1)");

        cy.get(".audit-compliance-level").contains("Totalement conforme");
      });
    });
  });

  it("Account : a RGAA 5 audit with no blocking user impact and many minor or major user impact is partially compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, auditReference: AuditReference.RGAA_5_Web, countBlockingUserImpact: 0 }).then(() => {
        cy.visit("http://localhost:3000/compte");

        cy.contains("Terminé (1)");

        cy.get(".audit-compliance-level").contains("Partiellement conforme");
      });
    });
  });

  it("Account : a RGAA 5 audit with one blocking user impact is not compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, auditReference: AuditReference.RGAA_5_Web, countBlockingUserImpact: 1 }).then(() => {
        cy.visit("http://localhost:3000/compte");

        cy.contains("Terminé (1)");

        cy.get(".audit-compliance-level").contains("Non conforme");
      });
    });
  });

  it("Account : a RGAA 5 audit with many blocking user impact is not compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, auditReference: AuditReference.RGAA_5_Web }).then(() => {
        cy.visit("http://localhost:3000/compte");

        cy.contains("Terminé (1)");

        cy.get(".audit-compliance-level").contains("Non conforme");
      });
    });
  });

  it("Account : a RGAA 5 audit is compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, auditReference: AuditReference.RGAA_5_Web, isCompliant: true }).then(() => {
        cy.visit("http://localhost:3000/compte");

        cy.contains("Terminé (1)");

        cy.get(".audit-compliance-level").contains("Totalement conforme");
      });
    });
  });

  it("Statement : a RGAA 4 audit with blocking user impacts is partially compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, fillStatement: true, auditReference: AuditReference.RGAA_4, countBlockingUserImpact: 8 }).then(({ reportId }) => {
        cy.visit(`http://localhost:3000/declaration/${reportId}`);

        cy.contains("afficher la mention « Accessibilité : partiellement conforme »");
        cy.contains("est partiellement conforme avec le référentiel général d’amélioration de l’accessibilité (RGAA)");
        cy.contains("des critères du RGAA version 4.1.2 sont respectés");
      });
    });
  });

  it("Statement : a RGAA 4 audit is compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, fillStatement: true, auditReference: AuditReference.RGAA_4, isCompliant: true }).then(({ reportId }) => {
        cy.visit(`http://localhost:3000/declaration/${reportId}`);

        cy.contains("afficher la mention « Accessibilité : totalement conforme »");
        cy.contains("est totalement conforme avec le référentiel général d’amélioration de l’accessibilité (RGAA)");
        cy.contains("des critères du RGAA version 4.1.2 sont respectés");
      });
    });
  });

  it("Statement : a RGAA 5 audit with no blocking user impact and many minor or major user impact is partially compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, fillStatement: true, auditReference: AuditReference.RGAA_5_Web, countBlockingUserImpact: 0 }).then(({ reportId }) => {
        cy.visit(`http://localhost:3000/declaration/${reportId}`);

        cy.contains("afficher la mention « Accessibilité : partiellement conforme »");
        cy.contains("est partiellement conforme avec le référentiel général d’amélioration de l’accessibilité (RGAA)");
        cy.contains("des critères du RGAA version 5 sont respectés");
      });
    });
  });

  it("Statement : a RGAA 5 audit with one blocking user impact is not compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, fillStatement: true, auditReference: AuditReference.RGAA_5_Web, countBlockingUserImpact: 1 }).then(({ reportId }) => {
        cy.visit(`http://localhost:3000/declaration/${reportId}`);

        cy.contains("afficher la mention « Accessibilité : non conforme »");
        cy.contains("est non conforme avec le référentiel général d’amélioration de l’accessibilité (RGAA)");
        cy.contains("des critères du RGAA version 5 sont respectés");
      });
    });
  });

  it("Statement : a RGAA 5 audit with many blocking user impact is not compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, fillStatement: true, auditReference: AuditReference.RGAA_5_Web }).then(({ reportId }) => {
        cy.visit(`http://localhost:3000/declaration/${reportId}`);

        cy.contains("afficher la mention « Accessibilité : non conforme »");
        cy.contains("est non conforme avec le référentiel général d’amélioration de l’accessibilité (RGAA)");
        cy.contains("des critères du RGAA version 5 sont respectés");
      });
    });
  });

  it("Statement : a RGAA 5 audit is compliant", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true, fillStatement: true, auditReference: AuditReference.RGAA_5_Web, isCompliant: true }).then(({ reportId }) => {
        cy.visit(`http://localhost:3000/declaration/${reportId}`);

        cy.contains("afficher la mention « Accessibilité : totalement conforme »");
        cy.contains("est totalement conforme avec le référentiel général d’amélioration de l’accessibilité (RGAA)");
        cy.contains("des critères du RGAA version 5 sont respectés");
      });
    });
  });
});
