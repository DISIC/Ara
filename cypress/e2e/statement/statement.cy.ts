import * as auditJson from "../../fixtures/audit.json";
import * as statementJson from "../../fixtures/statement.json";

describe("Statement", () => {
  it("User can fill a11y statement", () => {
    cy.createTestAudit().then(({ editId }) => {
      cy.visit(`http://localhost:3000/audits/${editId}/synthese`);
      cy.contains("Compléter").invoke("removeAttr", "target").click();

      // General infos
      cy.getByLabel("Entité qui a demandé l’audit")
        .clear()
        .type(statementJson.auditInitiator);
      cy.getByLabel("Entité qui a réalisé l’audit")
        .clear()
        .type(statementJson.auditorOrganisation);
      cy.getByLabel("URL de la page d’accueil du site audité")
        .clear()
        .type(statementJson.procedureUrl);

      cy.getByLabel("Adresse e-mail").clear().type(statementJson.contactEmail);
      cy.getByLabel("Formulaire de contact en ligne")
        .clear()
        .type(statementJson.contactFormUrl);

      // Technologies
      cy.getByLabel("Ajouter des technologies")
        .clear()
        .type(statementJson.technologies);

      cy.contains("button", "Ajouter les technologies").click();

      // Tools
      cy.contains("Web Developer Toolbar").click();
      cy.contains("WCAG Contrast checker").click();
      cy.getByLabel("Ajouter des outils d’assistance")
        .clear()
        .type(statementJson.tools);

      cy.contains("button", "Ajouter les outils").click();

      // Environments
      cy.contains("Combinaison 1").click();
      cy.contains("button", "Ajouter un environnement de test").click();
      cy.getByLabel("Appareil").clear().type("Ordinateur");
      cy.getByLabel("Logiciel d’exploitation").clear().type("Windows");
      cy.getByLabel("Technologie d’assistance").clear().type("JAWS");
      cy.getByLabel("Navigateur").clear().type("Edge");

      // Not accessible content
      cy.get("[aria-labelledby='notCompliantContent']")
        .clear()
        .type(statementJson.notCompliantContent);
      cy.get("[aria-labelledby='derogatedContent']")
        .clear()
        .type(statementJson.derogatedContent);
      cy.get("[aria-labelledby='notInScopeContent']")
        .clear()
        .type(statementJson.notInScopeContent);

      cy.getByLabel("URL du schéma pluriannuel de mise en accessibilité (optionnel)")
        .clear()
        .type(statementJson.schemaPluriannuelUrl);

      cy.getByLabel("URL du plan d'actions en cours (optionnel)")
        .clear()
        .type(statementJson.planActionUrl);

      cy.contains("button", "Enregistrer").click();
      cy.contains("h1", auditJson.procedureName);
    });
  });

  it("User can copy statement html", () => {
    cy.createTestAudit({ fillStatement: true }).then(({ reportId }) => {
      cy.visit(`http://localhost:3000/declaration/${reportId}`);
      cy.contains("Copier le code HTML").click();
      cy.contains("Code HTML copié");
      cy.window().focus();
      cy.window()
        .its("navigator.clipboard")
        .then(clipboard => clipboard.readText()
          .then((t: string) => {
            cy.wrap(t).should("not.be.empty");
          }));
    });
  });
});
