import { checkA11y } from "./common";

describe("Accessibility", () => {
  it("Accueil : has no detectable a11y violations", () => {
    cy.visit("http://localhost:3000");
    checkA11y();
  });

  it("Contact et contributions : has no detectable a11y violations", () => {
    cy.visit("http://localhost:3000/contact-contributions");
    checkA11y();
  });

  it("Mentions légales : has no detectable a11y violations", () => {
    cy.visit("http://localhost:3000/mentions-legales");
    checkA11y();
  });

  it("Accessibilité : has no detectable a11y violations", () => {
    cy.visit("http://localhost:3000/accessibilite");
    checkA11y();
  });

  it("Plan du site : has no detectable a11y violations", () => {
    cy.visit("http://localhost:3000/plan-du-site");
    checkA11y();
  });

  it("Connexion : has no detectable a11y violations", () => {
    cy.visit("http://localhost:3000/connexion");
    checkA11y();
  });

  it("Mot de passe oublié : has no detectable a11y violations", () => {
    cy.visit("http://localhost:3000/reinitialiser-mot-de-passe");
    checkA11y();
  });

  it("Compte : has no detectable a11y violations", () => {
    cy.createTestAccount({ login: true }).then(() => {
      cy.visit("http://localhost:3000/compte/parametres");
      checkA11y();
    });
  });

  it("Mes audits : has no detectable a11y violations", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true });
      cy.createTestAudit({ auditorEmail: username, isPristine: true });
      cy.createTestAudit({ auditorEmail: username });
      cy.createTestAudit({ auditorEmail: username }).as("audit");
      cy.visit("http://localhost:3000/compte");

      checkA11y();
    });
  });

  it("Synthèse : has no detectable a11y violations", () => {
    cy.createTestAudit({ isComplete: true }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/synthese/`);
      checkA11y();
    });
  });

  it("Audit : has no detectable a11y violations", () => {
    cy.createTestAudit({ isComplete: true }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/generation/`);
      checkA11y();
    });
  });

  it("Rapport : has no detectable a11y violations", () => {
    cy.createTestAudit({ isComplete: true }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/rapport/${editId}/resultats/`);
      checkA11y();
    });
  });

  it("Déclaration (saisie) : has no detectable a11y violations", () => {
    cy.createTestAudit({ isComplete: true }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/declaration/`);
      checkA11y();
    });
  });

  it("Déclaration (consultation) : has no detectable a11y violations", () => {
    cy.createTestAudit({ isComplete: true }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/declaration/${editId}`);
      checkA11y();
    });
  });

  it("Paramètre de l'audit : has no detectable a11y violations", () => {
    cy.createTestAudit({ isComplete: true }).then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/parametres`);
      checkA11y();
    });
  });
});
