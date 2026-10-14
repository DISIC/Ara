import { checkA11y } from "./common";

describe("Accessibility", () => {
  it("Accueil : has no detectable a11y violations", () => {
    cy.visit("/");
    cy.contains("Je réalise un audit d’accessibilité avec Ara");
    checkA11y();
  });

  it("Contact et contributions : has no detectable a11y violations", () => {
    cy.visit("/contact-contributions");
    cy.contains("Contact");
    checkA11y();
  });

  it("Mentions légales : has no detectable a11y violations", () => {
    cy.visit("/mentions-legales");
    cy.contains("Mentions légales");
    checkA11y();
  });

  it("Accessibilité : has no detectable a11y violations", () => {
    cy.visit("/accessibilite");
    cy.contains("Déclaration d’accessibilité");
    checkA11y();
  });

  it("Plan du site : has no detectable a11y violations", () => {
    cy.visit("/plan-du-site");
    cy.contains("Plan du site");
    checkA11y();
  });

  it("Connexion : has no detectable a11y violations", () => {
    cy.visit("/compte/connexion");
    cy.contains("Connexion à Ara");
    checkA11y();
  });

  it("Mot de passe oublié : has no detectable a11y violations", () => {
    cy.visit("/compte/reinitialiser-mot-de-passe");
    cy.contains("Réinitialiser votre mot de passe");
    checkA11y();
  });

  it("Compte : has no detectable a11y violations", () => {
    cy.createTestAccount({ login: true }).then(() => {
      cy.visit("/compte/parametres");
      cy.contains("Mon compte");
      checkA11y();
    });
  });

  it("Mes audits : has no detectable a11y violations", () => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true });
      cy.createTestAudit({ auditorEmail: username, isPristine: true });
      cy.createTestAudit({ auditorEmail: username });
      cy.createTestAudit({ auditorEmail: username });
      cy.visit("/compte");
      cy.contains("Mes audits");
      checkA11y();
    });
  });

  it("Synthèse : has no detectable a11y violations", () => {
    cy.createTestAudit({ isComplete: true }).then(({ editId }) => {
      cy.visit(`/audits/${editId}/synthese/`);
      cy.contains("Audit de mon petit site");
      checkA11y();
    });
  });

  it("Audit : has no detectable a11y violations", () => {
    cy.createTestAudit({ isComplete: true }).then(({ editId }) => {
      cy.visit(`/audits/${editId}/generation/`);
      cy.contains("Audit");
      checkA11y();
    });
  });

  it("Rapport : has no detectable a11y violations", () => {
    cy.createTestAudit({ isComplete: true }).then(({ reportId }) => {
      cy.visit(`/rapport/${reportId}/resultats/`);
      cy.contains("Synthèse des résultats");
      checkA11y();
    });
  });

  it("Déclaration (saisie) : has no detectable a11y violations", () => {
    cy.createTestAudit({ isComplete: true, fillStatement: true }).then(({ editId }) => {
      cy.visit(`/audits/${editId}/declaration/`);
      cy.contains("Déclaration d’accessibilité");
      checkA11y();
    });
  });

  it("Déclaration (consultation) : has no detectable a11y violations", () => {
    cy.createTestAudit({ isComplete: true, fillStatement: true }).then(({ reportId }) => {
      cy.visit(`/declaration/${reportId}`);
      cy.contains("Déclaration d’accessibilité à publier");
      checkA11y();
    });
  });

  it("Paramètre de l'audit : has no detectable a11y violations", () => {
    cy.createTestAudit({ isComplete: true }).then(({ editId }) => {
      cy.visit(`/audits/${editId}/parametres`);
      cy.contains("Paramètres de l’audit");
      checkA11y();
    });
  });
});
