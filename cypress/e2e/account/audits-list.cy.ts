import * as auditJson from "../../fixtures/audit.json";

describe("Audits list", () => {
  // Create an logged in account and 4 associated audits (1 completed, 1 pristine and 2 in progress)
  beforeEach(() => {
    cy.createTestAccount({ login: true }).then(({ username }) => {
      cy.createTestAudit({ auditorEmail: username, isComplete: true });
      cy.createTestAudit({ auditorEmail: username, isPristine: true });
      cy.createTestAudit({ auditorEmail: username });
      cy.createTestAudit({ auditorEmail: username }).as("audit");
      cy.visit("http://localhost:3000/compte");
    });
  });
  it("User can access all their audits", () => {
    cy.contains("En cours (3)");
    cy.contains("Terminé (1)");

    const expectedLabels = [
      "Continuer l’audit",
      "Continuer l’audit",
      "Commencer l’audit",
      "Accéder à l’audit"
    ];

    cy.get(".audit-main-action").each(($el, i) => {
      expect($el.text()).to.contain(expectedLabels[i]);
    });
  });

  it("User can start audit with prefilled infos", () => {
    // FIXME: export function?
    function fillPageField(
      pageIndex: number,
      field: string,
      content: string
    ) {
      cy.contains(`Page ${pageIndex}`)
        .parent()
        .parent()
        .contains(field)
        .parent()
        .find("input")
        .clear()
        .type(content);
    }

    // Create a new audit but auditor email field should not be present
    cy.contains("a", "Démarrer un nouvel audit").click();

    cy.contains("106 critères").click();

    cy.contains("Nom du site ou du service à auditer")
      .parent()
      .find("input")
      .type(auditJson.procedureName);

    cy.contains("button", "Étape suivante").click();
    cy.contains("button", "Ajouter une page").click();

    fillPageField(1, "Nom de la page", auditJson.pages[0].name);
    fillPageField(1, "URL de la page", auditJson.pages[0].url);
    fillPageField(2, "Nom de la page", auditJson.pages[1].name);
    fillPageField(2, "URL de la page", auditJson.pages[1].url);
    fillPageField(3, "Nom de la page", auditJson.pages[2].name);
    fillPageField(3, "URL de la page", auditJson.pages[2].url);
    fillPageField(4, "Nom de la page", auditJson.pages[3].name);
    fillPageField(4, "URL de la page", auditJson.pages[3].url);
    fillPageField(5, "Nom de la page", auditJson.pages[4].name);
    fillPageField(5, "URL de la page", auditJson.pages[4].url);
    fillPageField(6, "Nom de la page", auditJson.pages[5].name);
    fillPageField(6, "URL de la page", auditJson.pages[5].url);
    fillPageField(7, "Nom de la page", auditJson.pages[6].name);
    fillPageField(7, "URL de la page", auditJson.pages[6].url);
    fillPageField(8, "Nom de la page", auditJson.pages[7].name);
    fillPageField(8, "URL de la page", auditJson.pages[7].url);

    cy.contains("button", "Étape suivante").click();

    cy.contains("button", "Ignorer cette étape").click();

    cy.getByLabel("Prénom et nom (optionnel)").type(auditJson.auditorName);

    cy.contains("button", "Valider les paramètres").click();

    cy.contains("h1", auditJson.procedureName);

    // Create new audit but in only 2 steps (step 3 auto-filled)
    cy.contains("a", "Mes audits").click();

    cy.contains("a", "Démarrer un nouvel audit").click();

    cy.contains("106 critères").click();

    cy.contains("Nom du site ou du service à auditer")
      .parent()
      .find("input")
      .type(auditJson.procedureName);

    cy.contains("button", "Étape suivante").click();
    cy.contains("button", "Ajouter une page").click();

    fillPageField(1, "Nom de la page", auditJson.pages[0].name);
    fillPageField(1, "URL de la page", auditJson.pages[0].url);
    fillPageField(2, "Nom de la page", auditJson.pages[1].name);
    fillPageField(2, "URL de la page", auditJson.pages[1].url);
    fillPageField(3, "Nom de la page", auditJson.pages[2].name);
    fillPageField(3, "URL de la page", auditJson.pages[2].url);
    fillPageField(4, "Nom de la page", auditJson.pages[3].name);
    fillPageField(4, "URL de la page", auditJson.pages[3].url);
    fillPageField(5, "Nom de la page", auditJson.pages[4].name);
    fillPageField(5, "URL de la page", auditJson.pages[4].url);
    fillPageField(6, "Nom de la page", auditJson.pages[5].name);
    fillPageField(6, "URL de la page", auditJson.pages[5].url);
    fillPageField(7, "Nom de la page", auditJson.pages[6].name);
    fillPageField(7, "URL de la page", auditJson.pages[6].url);
    fillPageField(8, "Nom de la page", auditJson.pages[7].name);
    fillPageField(8, "URL de la page", auditJson.pages[7].url);

    cy.contains("button", "Étape suivante").click();

    cy.contains("button", "Valider les paramètres").click();

    cy.contains("h1", "Audit");
  });

  it("User can duplicate audit", () => {
    cy.contains("button", "Actions").click();
    cy.contains("button", "Dupliquer l’audit").click();

    cy.getByLabel("Nom de la copie").type("Audit de mon petit site (2)");
    cy.get("dialog").contains("button", "Dupliquer l’audit").click();

    cy.contains("Audit « Audit de mon petit site (2) » créé", { timeout: 50_000 });
    cy.contains("button", "Accéder à l’audit").click();

    cy.contains("h1 + p", "Audit de mon petit site (2)");
  });

  it("User can copy report link", () => {
    cy.contains("button", "Actions").click();
    cy.contains("button", "Copier le lien du rapport").click();
    cy.get("@audit").then((audit) => {
      cy.assertClipboardValue(
        // @ts-ignore
        // TODO: remove `@ts-ignore` when the following issue is fixed:
        // "feat: [Add Typescript support for Aliases #8762"](https://github.com/cypress-io/cypress/issues/8762)
        `http://localhost:3000/rapport/${audit.reportId}`
      );
      cy.contains(
        "Le lien vers le rapport a bien été copié dans le presse-papier."
      );
    });
  });

  it("User can download audit", () => {
    cy.exec("rm -rf cypress/downloads");

    cy.contains("Actions").click();
    cy.contains("Télécharger l’audit").click();

    cy.readFile("cypress/downloads/audit-audit-de-mon-petit-site.csv");
  });

  it("User can delete audit", () => {
    cy.contains("Actions").click();
    cy.contains("Supprimer l’audit").click();

    cy.get("dialog").contains("button", "Supprimer définitivement l’audit").click();

    cy.contains("Audit « Audit de mon petit site » supprimé");
  });

  it("User can transfer an audit", () => {
    const newEmail = "example@domain.com";

    cy.contains("button", "Actions").click();
    cy.contains("button", "Transférer l’audit").click();

    // Fill form
    cy.getByLabel("Adresse e-mail du destinataire")
      .clear()
      .type(newEmail);
    cy.getByLabel("Confirmer e-mail du destinataire")
      .clear()
      .type(newEmail);
    cy.contains("button[type='submit']", "Transférer l’audit").click();

    // Assert audit is gone (3 audits left)
    cy.get(".audits-list .audit-name").should("have.length", 3);
    cy.contains("a", "Audit de mon petit site").should("be.focused");
    cy.contains("Audit « Audit de mon petit site » transféré");
    cy.contains(`Lien d’accès envoyé à ${newEmail}`);

    // Logout and check auditorEmail in audit parameters
    cy.get(".account-header button[aria-expanded]").click();
    cy.contains("button", "Me déconnecter").click();
    cy.get("@audit").then(audit => {
      // @ts-ignore
      // TODO: remove `@ts-ignore` when the following issue is fixed:
      // "feat: [Add Typescript support for Aliases #8762"](https://github.com/cypress-io/cypress/issues/8762)
      cy.visit(`http://localhost:3000/audits/${audit.editId}/parametres`);
      cy.getByLabel("Adresse e-mail").should("have.value", newEmail);
    });
  });
});
